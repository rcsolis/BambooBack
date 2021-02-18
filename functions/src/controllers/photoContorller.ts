import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as stream from "stream";
import { promisify } from "util";
import { Photo } from "../classes/Photo";
import { Picture } from "../utils/interfaces";

const DB = admin.firestore();
const storage = admin.storage();
const bucket = storage.bucket("gs://bamboo-cd1d0.appspot.com");
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
            const file = bucket.file(`${docId}/` + fileName);
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
            functions.logger.error("Exception in Properties:Create. ", error);
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
