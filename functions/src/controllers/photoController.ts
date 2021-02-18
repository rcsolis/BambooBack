import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as stream from "stream";
import * as path from "path";
import * as os from "os";
import * as fs from "fs";
import * as spawn from "child-process-promise";
import { promisify } from "util";
import { Picture } from "../utils/interfaces";

const DB = admin.firestore();
const STORAGE = admin.storage();
const BUCKET = STORAGE.bucket("gs://bamboo-cd1d0.appspot.com");
const finishedAsync = promisify(stream.finished);
const runtimeOpts: functions.RuntimeOptions = {
    timeoutSeconds: 30,
    memory: "512MB",
};
/**
 * SERVICE FUNCTION
 * Function to receives an image and upload to the bucket
 * Save the file into the folder of the property {porpertyId}/{imageName}
 * Update the underlaying photo document, adding new Picture to images array
 * This fire event on bucket that resize the image to create thumbnails
 * @param {string} docId Property Identifier
 * @param {string} fileName Image file name with extention
 * @param {string} imageSource Raw image data encoded with base64
 */
export const create = functions
    .runWith(runtimeOpts).https.onRequest(async (request, response) => {
        try {
            functions.logger.info("Photos:Create. Start");
            // Test method and data
            if (request.method !== "POST" && request.is("application/json")) {
                throw new functions.https.HttpsError(
                    "unimplemented",
                    "Method not allowed");
            }
            if (request.body === undefined ) {
                throw new functions.https.HttpsError(
                    "invalid-argument",
                    "Data is empty");
            }
            const { docId, fileName, imageSource } = request.body;
            // Check if the property exists
            const propSnap = await DB.collection("properties").doc(docId).get();
            if (!propSnap.exists) {
                throw new functions.https.HttpsError(
                    "not-found",
                    "Property not found");
            }
            // Get photo document
            const photoQuery = await DB.collection("photos")
                .where("propertyId", "==", docId)
                .get();
            if (photoQuery.empty || photoQuery.size>1) {
                throw new functions.https.HttpsError(
                    "failed-precondition",
                    "Broken relationship between photos and properties");
            }
            const photoRef = photoQuery.docs[0];
            // Work with the image
            // Trim the not needed part of the base64 string
            const mimeType = imageSource
                .match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)[1];
            const base64EncodedImageStr = imageSource
                .replace(/^data:image\/\w+;base64,/, "");
            // Create a buffer with the image content
            const imageBuffer: Buffer = Buffer.from(base64EncodedImageStr, "base64");
            // Create a duplex buffer
            const bufferStream: stream.PassThrough = new stream.PassThrough();
            bufferStream.end(imageBuffer);
            // Define file and fileName, create an object
            const file = BUCKET.file(`${docId}/` + fileName);
            // Write
            bufferStream.pipe(file.createWriteStream({
                metadata: {
                    contentType: mimeType,
                },
                public: true,
            }));
            // Wait for finished write operation
            await finishedAsync(bufferStream);
            // Get publics URL with 3years of expiration
            const signedUrls = await file.getSignedUrl({
                action: "read",
                expires: "31-12-2023",
            });
            const finalUrl = signedUrls[0];
            // Update photo document
            const picture: Picture = { name: fileName, url: finalUrl };
            const resRef = DB.collection("photos").doc(photoRef.id);
            const resUpd = await resRef.update({
                images: admin.firestore.FieldValue.arrayUnion(picture),
            });
            functions.logger.info("Photos:Create. End",
                resUpd.writeTime, fileName, docId, photoRef.id);
            // Return
            response.status(200).json({
                docId: docId,
                photoId: photoRef.id,
                fileName: fileName,
                url: finalUrl,
            });
        } catch (error) {
            functions.logger.error("Exception in Photos:Create. ", error);
            if (error.message) {
                response.status(500).json({
                    code: error.code,
                    error: error.message,
                });
            } else {
                response.status(500).json({
                    code: 500,
                    error: error,
                });
            }
        }
    });
/**
 * TRIGGER FUNCTION
 * Launch when a object is created successfully into the bucket of Storage service.
 * Get the name, check if its an image and run the process to create thumbnails.
 * SIZES, contains the measurements we want for the images
 * Download to temporal file storage, create the thumbnail, updload again to
 * cloud storage and delete the temp file. (this launch again this function, in order
 * to prevent cyclic calls, check the image name)
 */
export const onCreate = functions.storage.object().onFinalize(async (photo) => {
    try {
        functions.logger.info("Photos:OnCreate. START.");
        // Resize target width in pixels
        const SIZES = [128, 256, 512];
        // Get the bukect reference
        // const fileBucket = photo.bucket;
        // const bucket = admin.storage().bucket(fileBucket);
        // File name with path of the object
        const filePath = photo.name;
        // Content type of the object
        const contentType = photo.contentType;
        // Check if has a name
        if (!filePath) {
            functions.logger.error("Photos:OnCreate. File doesnt has a name.",
                photo);
            throw new Error("File doesnt has a name.");
        }
        // Check if is an image file
        if (!contentType?.startsWith("image/")) {
            functions.logger.warn("Photos:OnCreate. This is not an image.",
                filePath);
            // Nothing to do
            return;
        }
        // Get the file name.
        const fileName = path.basename(filePath);
        // Exit if the image is already a thumbnail.
        if (fileName.startsWith("thumb_")) {
            return;
        }
        // Create the temporal file path
        const tempFilePath = path.join(os.tmpdir(), fileName);
        const metadata = {
            contentType: contentType,
        };
        // Download to temporal file storage
        await BUCKET.file(filePath).download({ destination: tempFilePath });
        functions.logger.info("Photos:OnCreate. Downloaded to temp.",
            filePath, tempFilePath);
        // for each size
        SIZES.forEach(async (size) => {
            // dd a 'thumb_' and size prefix to thumbnails file name.
            const thumbFileName = `thumb_${size}_${fileName}`;
            const thumbFilePath = path.join(path.dirname(filePath), thumbFileName);
            // Generate a thumbnail using ImageMagick.
            await spawn.spawn("convert",
                [tempFilePath, "-thumbnail", `${size}`, tempFilePath]);
            functions.logger.info("Photos:onCreate. Created thumbnail.",
                size, thumbFilePath, thumbFileName);
            // Uploading the thumbnail.
            await BUCKET.upload(tempFilePath, {
                destination: thumbFilePath,
                metadata: metadata,
            });
            functions.logger.info("Photos:onCreate. Thumbnail uploaded.",
                thumbFilePath, thumbFileName);
            // Delete the local file to free up disk space
            fs.unlinkSync(tempFilePath);
            functions.logger.info("Photos:onCreate. Thumbnail tempfile deleted.");
        });
        functions.logger.info("Photos.OnCreate. END.");
        return;
    } catch (error) {
        functions.logger.error("Exception in Photos:onCreate. ", error);
        return;
    }
});
