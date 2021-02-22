import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as stream from "stream";
import * as path from "path";
import * as os from "os";
import * as fs from "fs";
import * as spawn from "child-process-promise";
import { promisify } from "util";
import { Picture, Thumbnail } from "../utils/interfaces";
import { Photo } from "../classes/Photo";
// Data base
const DB = admin.firestore();
// Storage
const STORAGE = admin.storage();
const BUCKET = STORAGE.bucket("gs://bamboo-cd1d0.appspot.com");
// For buffer wait operation
const finishedAsync = promisify(stream.finished);
// For function settings
const runtimeOpts: functions.RuntimeOptions = {
    timeoutSeconds: 20,
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
            functions.logger.info("Photos:Create. Process Image.", fileName);
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
            const fileParts = fileName.split(".");
            const newFileName = `${photoRef.id}_${fileParts[0]}.${fileParts[1]}`;
            const file = BUCKET.file(`${docId}/` + newFileName);
            // Write image to bucket
            bufferStream.pipe(file.createWriteStream({
                metadata: {
                    contentType: mimeType,
                },
                public: true,
            }));
            // Wait for finished write operation
            await finishedAsync(bufferStream);
            // Get publics URL with 3 years of expiration
            const signedUrls = await file.getSignedUrl({
                action: "read",
                expires: "12-31-2023",
            });
            const finalUrl = signedUrls[0];
            // Update photo document adding new
            const picture: Picture = {
                name: newFileName,
                url: finalUrl,
                thumb128: { name: "", url: "" },
                thumb256: { name: "", url: "" },
                thumb512: { name: "", url: "" },
            };
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
                fileName: newFileName,
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
 * SERVICE FUNCTION
 * Return all the images related to a property, search the related photos document
 * and get all the images array.
 * @param {string} docId Property Identifier
 * @return {object} Photo object with images array
 */
export const getByProperty = functions.https.onRequest(async (request, response) => {
    try {
        functions.logger.info("Photos:GetByProperty. Start");
        // Test method and data
        if (request.method !== "GET") {
            throw new functions.https.HttpsError(
                "unimplemented",
                "Method not allowed");
        }
        if (request.query === undefined || request.query.docId === undefined ) {
            throw new functions.https.HttpsError(
                "invalid-argument",
                "Data is empty");
        }
        const docId:string = request.query.docId.toString();
        if (!docId) {
            throw new functions.https.HttpsError(
                "invalid-argument",
                "Incorrect data.");
        }
        // get document
        const docQuery = await DB.collection("photos")
            .where("propertyId", "==", docId).get();
        if (docQuery.empty || docQuery.size>1) {
            throw new functions.https.HttpsError(
                "failed-precondition",
                "Broken relationship between photos and properties");
        }
        const docRef = docQuery.docs[0];
        const photo: Photo = Photo.loadFromFirestore(docRef.data());
        // Return
        functions.logger.info("Photos:GetByProperty. End");
        response.status(200).json(photo.toFirestore());
    } catch (error) {
        functions.logger.error("Exception in Photos:GetByProperty. ", error);
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
 * SERVICE FUNCTION
 * Return the photo document related to the identifier parameter.
 * Get the document by photo identifier.
 * @param {string} docId PHOTO Identifier
 * @return {object} Photo object with images array
 */
export const getById = functions.https.onRequest(async (request, response) => {
    try {
        functions.logger.info("Photos:GetById. Start");
        // Test method and data
        if (request.method !== "GET") {
            throw new functions.https.HttpsError(
                "unimplemented",
                "Method not allowed");
        }
        if (request.query === undefined || request.query.docId === undefined ) {
            throw new functions.https.HttpsError(
                "invalid-argument",
                "Data is empty");
        }
        const docId:string = request.query.docId.toString();
        if (!docId) {
            throw new functions.https.HttpsError(
                "invalid-argument",
                "Incorrect data.");
        }
        // get document
        const docSnap = await DB.collection("photos").doc(docId).get();
        if (!docSnap.exists) {
            throw new functions.https.HttpsError(
                "not-found",
                "Images not found");
        }
        const photo: Photo = Photo.loadFromFirestore(docSnap.data());
        // Return
        functions.logger.info("Photos:GetById. End");
        response.status(200).json(photo.toFirestore());
    } catch (error) {
        functions.logger.error("Exception in Photos:GetById. ", error);
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
export const onCreate = functions.runWith(runtimeOpts)
    .storage.object().onFinalize(async (photo) => {
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
            // Get the original file name
            const fileName = path.basename(filePath);
            // Exit if the image is already a thumbnail.
            if (fileName.startsWith("thumb_")) {
                functions.logger
                    .warn("Photos:OnCreate. END Is a Thumbnail, nothing to do.",
                        filePath);
                return;
            }
            // Create the temporal file path
            const tempFilePath = path.join(os.tmpdir(), fileName);
            const metadata = {
                contentType: contentType,
            };
            const photosId = fileName.split("_")[0];
            // Download to temporal file storage
            await BUCKET.file(filePath).download({ destination: tempFilePath });
            functions.logger.info("Photos:OnCreate. Downloaded to temp.",
                filePath, tempFilePath);
            // For each size
            for (const size of SIZES) {
                const resThumb = await createThumbnail(size,
                    fileName, filePath, tempFilePath, metadata);
                // get signed url for thumbnail
                const signedUrls = await BUCKET.file(resThumb.path).getSignedUrl({
                    action: "read",
                    expires: "12-31-2023",
                });
                const finalUrl = signedUrls[0];
                // Create new thumbnail object
                const thumObj: Thumbnail = {
                    name: resThumb.name,
                    url: finalUrl,
                };
                // Get reference and update photos document
                const resRef = DB.collection("photos").doc(photosId);
                // Search for the image for to the generated thumbnail
                const resSnap = await resRef.get();
                const docData = resSnap.data()!;
                let imageIndex = 0;
                let imageElement: Picture = {
                    name: "",
                    url: "",
                    thumb128: { name: "", url: "" },
                    thumb256: { name: "", url: "" },
                    thumb512: { name: "", url: "" },
                };
                docData.images.forEach((element: Picture, index:number) => {
                    if (element.name === fileName) {
                        imageElement = element;
                        imageIndex = index;
                    }
                });
                // Update the size field
                switch (size) {
                case 512:
                    imageElement.thumb512 = thumObj;
                    break;
                case 256:
                    imageElement.thumb256 = thumObj;
                    break;
                case 128:
                default:
                    imageElement.thumb128 = thumObj;
                    break;
                }
                const finalImages = docData.images;
                // Replace the element
                finalImages[imageIndex] = imageElement;
                // Update all field in the document using transaction
                await DB.runTransaction(async (t) => {
                    t.update(resRef, { images: finalImages });
                });
                functions.logger.info("Photos.OnCreate. Update document.",
                    photosId, size, thumObj);
            }
            functions.logger.info("Photos.OnCreate. END.");
            // Delete the local file to free up disk space
            return fs.unlinkSync(tempFilePath);
        } catch (error) {
            functions.logger.error("Exception in Photos:onCreate. ", error);
            return;
        }
    });
/**
 * Helper function to create a thumbnail with imagemagik and upload
 * to bucket
 * @param {number} size Size of the image
 * @param {string} fileName Original file name
 * @param {string} filePath Original file path
 * @param {string} tempFilePath Temporal file path
 * @param {object} metadata Object with the metadata like content type
 */
async function createThumbnail(size: number,
    fileName: string,
    filePath: string,
    tempFilePath: string,
    metadata: object): Promise<{name:string, path:string}> {
    // add a 'thumb_' and size prefix to thumbnails file name.
    const thumbFileName = `thumb_${size}_${fileName}`;
    const thumbFilePath = path.join(path.dirname(filePath),
        thumbFileName);
    // Generate a thumbnail using ImageMagick.
    await spawn.spawn("convert",
        [tempFilePath, "-scale", `${size}`, tempFilePath]);
    functions.logger.info("Photos:onCreate. Created thumbnail.",
        size, thumbFilePath, thumbFileName);
    // Uploading the thumbnail.
    await BUCKET.upload(tempFilePath, {
        destination: thumbFilePath,
        metadata: metadata,
    });
    functions.logger.info("Photos:onCreate. Thumbnail uploaded.",
        thumbFileName, thumbFilePath);
    return { name: thumbFileName, path: thumbFilePath };
}
