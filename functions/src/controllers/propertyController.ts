import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { Property } from "../classes/Property";
import { Photo } from "../classes/Photo";
import {
    PhotoInFirestore,
    PropertyInFirestore,
    RawProperty,
} from "../utils/interfaces";

const DB = admin.firestore();
/**
 * SERVICE FUNCTION
 * Create a new Property
 * use POST method and expect a JSON object as body
 * with general information about a property
 * this tigger onCreate
 * @param {RawProperty} data New Document
 */
export const create = functions.https.onRequest(async (request, response) => {
    try {
        functions.logger.info("Properties:Create. Start");
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
        // Get data from post
        const data: RawProperty = request.body.data;
        // Create new property
        const newProperty: Property = Property.create(data,
            admin.firestore.FieldValue.serverTimestamp()
        );
        functions.logger.info("Properties:Create. Convert data", data);
        // Create document reference
        const propertyRef = await DB.collection("properties").doc();
        // Convert object to save to firestore
        const plainDoc: PropertyInFirestore =
            newProperty.toFirestore(propertyRef.id);
        // Save to Firestore
        const resProp = await propertyRef.set(plainDoc);
        functions.logger.info("Properties:Create. End creation",
            resProp.writeTime.toDate(), plainDoc);
        // Return
        response.status(200).json({
            time: resProp.writeTime.toDate(),
            obj: plainDoc,
        });
    // Error Handle
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
/**
 * SERVICE FUNCTION
 * Update a property
 * Use PUT method to send new document values to update general
 * information of a property
 * @param {string} docId Property identifier
 * @param {RawProperty} data Updated data
 */
export const update = functions.https.onRequest(async (request, response) => {
    try {
        functions.logger.info("Properties:Update. Start");
        // Test method and data
        if (request.method !== "PUT" && request.is("application/json")) {
            throw new functions.https.HttpsError(
                "unimplemented",
                "Method not allowed");
        }
        if (request.body === undefined ) {
            throw new functions.https.HttpsError(
                "invalid-argument",
                "Data is empty");
        }
        // Body is in form of id, data
        const { docId, data } = request.body;
        if (!docId || !data) {
            throw new functions.https.HttpsError(
                "not-found",
                "Data is empty");
        }
        functions.logger.info("Properties:Update. Parse", docId, data);
        // Get document to update
        const propertyRef = DB.collection("properties").doc(docId);
        const propertyDoc = await propertyRef.get();
        if (!propertyDoc.exists) {
            throw new functions.https.HttpsError(
                "not-found",
                "Property does not exist.");
        }
        const currentData = propertyDoc.data();
        if (!currentData) {
            throw new functions.https.HttpsError(
                "not-found",
                "Property data does not exist.");
        }
        const newData: PropertyInFirestore = Property.update(docId,
            currentData,
            data,
            admin.firestore.FieldValue.serverTimestamp()
        );
        // Update using set and merge
        const updateRes = await propertyRef.set(newData, { merge: true });
        functions.logger.info("Properties:Update. Updated successfully",
            updateRes.writeTime.toDate(), newData);
        // Return
        response.status(200).json({
            time: updateRes.writeTime.toDate(),
            obj: newData,
        });
    } catch (error) {
        functions.logger.error("Exception in Properties:Update. ", error);
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
 * Delete a property from database
 * This funcitons use DELETE method to receive property id and remove it
 * from database, this trigger onDelete
 * @param {string} docId
 */
export const remove = functions.https.onRequest( async (request, response) => {
    try {
        functions.logger.info("Properties:Remove. Start");
        // Test method and data
        if (request.method !== "DELETE" && request.is("application/json")) {
            throw new functions.https.HttpsError(
                "unimplemented",
                "Method not allowed");
        }
        if (request.body === undefined ) {
            throw new functions.https.HttpsError(
                "invalid-argument",
                "Data is empty");
        }
        const docId = request.body.id;
        if (!docId) {
            throw new functions.https.HttpsError(
                "invalid-argument",
                "Data is empty");
        }
        // Find document to ensure if exists
        const docRef: FirebaseFirestore.DocumentSnapshot = await DB
            .collection("properties")
            .doc(docId)
            .get();
        if (!docRef.exists) {
            throw new functions.https.HttpsError(
                "not-found",
                "Property data does not exist.");
        }
        // Remove document
        const docData: FirebaseFirestore.DocumentData | undefined = docRef.data();
        const resRem = await DB.collection("properties").doc(docId).delete();
        functions.logger.info("Properties:Remove. End deleted.",
            resRem.writeTime.toDate(), docData);
        // Return
        response.status(200).json({
            time: resRem.writeTime.toDate(),
            obj: docId,
        });
    } catch (error) {
        functions.logger.error("Exception in Properties:Remove. ", error);
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
 * Update the price of a property
 * @param {string} docId Property Identifier
 * @param {number} price New price
 */
export const updatePrice = functions.https.onRequest(async (request, response) => {
    try {
        functions.logger.info("Properties:UpdatePrice. Start");
        // Test method and data
        if (request.method !== "PUT" && request.is("application/json")) {
            throw new functions.https.HttpsError(
                "unimplemented",
                "Method not allowed");
        }
        if (request.body === undefined ) {
            throw new functions.https.HttpsError(
                "invalid-argument",
                "Data is empty");
        }
        const { docId, price } = request.body;
        if (!docId || !price || price<0) {
            throw new functions.https.HttpsError(
                "invalid-argument",
                "Incorrect data");
        }
        // Update price
        const docRef = DB.collection("properties").doc(docId);
        const snapshot = await docRef.get();
        if (!snapshot.exists) {
            throw new functions.https.HttpsError(
                "not-found",
                "Property not found");
        }
        const updRes = await docRef.set({
            price: price,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        {
            merge: true,
        });
        functions.logger.info("Properties:UpdatePrice. End,",
            updRes.writeTime.toDate(), docId, price);
        // Return
        response.status(200).json({
            time: updRes.writeTime.toDate(),
            obj: docId,
        });
    } catch (error) {
        functions.logger.error("Exception in Properties:UpdatePrice. ", error);
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
 * Update the availability status of a property
 * @param {string} docId Property identifier
 * @param {boolean} available Next status
 */
export const updateAvailability = functions.https
    .onRequest(async (request, response) => {
        try {
            functions.logger.info("Properties:UpdateAvailability. Start");
            // Test method and data
            if (request.method !== "PUT" && request.is("application/json")) {
                throw new functions.https.HttpsError(
                    "unimplemented",
                    "Method not allowed");
            }
            if (request.body === undefined ) {
                throw new functions.https.HttpsError(
                    "invalid-argument",
                    "Data is empty");
            }
            const { docId, available } = request.body;
            if (!docId) {
                throw new functions.https.HttpsError(
                    "invalid-argument",
                    "Incorrect data.");
            }
            // Get doc
            const docRef = DB.collection("properties").doc(docId);
            const snap = await docRef.get();
            if (!snap.exists) {
                throw new functions.https.HttpsError(
                    "not-found",
                    "Property not found");
            }
            // Update
            const updRes = await docRef.set({
                isAvailable: available,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            }, { merge: true });
            functions.logger.info("Properties:UpdateAvailability. End",
                updRes.writeTime, docId, available);
            // Return
            response.status(200).json({
                time: updRes.writeTime.toDate(),
                obj: docId,
            });
        } catch (error) {
            functions.logger.error("Exception in Properties:UpdateAvailability. ",
                error);
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
 * Update the visibilty status of a property, if its visible on webpage or not
 * @param {string} docId Property identifier
 * @param {boolean} visible Next status
 */
export const updateVisibility = functions.https
    .onRequest(async (request, response) => {
        try {
            functions.logger.info("Properties:UpdateVisibility. Start");
            // Test method and data
            if (request.method !== "PUT" && request.is("application/json")) {
                throw new functions.https.HttpsError(
                    "unimplemented",
                    "Method not allowed");
            }
            if (request.body === undefined ) {
                throw new functions.https.HttpsError(
                    "invalid-argument",
                    "Data is empty");
            }
            const { docId, visible } = request.body;
            if (!docId) {
                throw new functions.https.HttpsError(
                    "invalid-argument",
                    "Incorrect data.");
            }
            // Get doc
            const docRef = DB.collection("properties").doc(docId);
            const snap = await docRef.get();
            if (!snap.exists) {
                throw new functions.https.HttpsError(
                    "not-found",
                    "Property not found");
            }
            // Update
            const updRes = await docRef.set({
                isVisible: visible,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            }, { merge: true });
            functions.logger.info("Properties:UpdateVisibility. End",
                updRes.writeTime, docId, visible);
            // Return
            response.status(200).json({
                time: updRes.writeTime.toDate(),
                obj: docId,
            });
        } catch (error) {
            functions.logger.error("Exception in Properties:UpdateVisibility. ",
                error);
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
 * Add one to interested counter of a property
 * - Run the update into a transaction because this action could happen
 * in concurrent scenario
 * @param {string} docId Property identifier
 */
export const addInterest = functions.https.onRequest( async (request, response) => {
    try {
        functions.logger.info("Properties:AddInterest. Start");
        // Test method and data
        if (request.method !== "PUT" && request.is("application/json")) {
            throw new functions.https.HttpsError(
                "unimplemented",
                "Method not allowed");
        }
        if (request.body === undefined) {
            throw new functions.https.HttpsError(
                "invalid-argument",
                "Data is empty");
        }
        const docId = request.body.docId;
        if (!docId) {
            throw new functions.https.HttpsError(
                "invalid-argument",
                "Incorrect data.");
        }
        // Get document reference
        const docRef = DB.collection("properties").doc(docId);
        // Run transaction
        const transRes = await DB.runTransaction(async (transaction) => {
            const doc = await transaction.get(docRef);
            if (!doc.exists) {
                throw new functions.https.HttpsError(
                    "not-found",
                    "Property not found.");
            }
            let newInterest = 0;
            newInterest = doc.data()?.interested + 1;
            if (newInterest === 0) {
                newInterest = 1;
            }
            // Update
            await transaction.update(docRef, { interested: newInterest });
            if (doc.updateTime) {
                return doc.updateTime.toDate();
            } else {
                return admin.firestore.Timestamp.now().toDate();
            }
        });
        functions.logger.info("Properties:AddInterest. End", docId, transRes);
        // Return
        response.status(200).json({
            time: transRes,
            obj: docId,
        });
    } catch (error) {
        functions.logger.error("Exception in Properties:AddInterest. ", error);
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
 * Add one to visits counter of a property
 * - Run the update into a transaction because this action could happen
 * in concurrent scenario
 * @param {string} docId Property identifier
 */
export const addVisit = functions.https.onRequest(async (request, response) => {
    try {
        functions.logger.info("Properties:AddVisit. Start");
        // Test method and data
        if (request.method !== "PUT" && request.is("application/json")) {
            throw new functions.https.HttpsError(
                "unimplemented",
                "Method not allowed");
        }
        if (request.body === undefined) {
            throw new functions.https.HttpsError(
                "invalid-argument",
                "Data is empty");
        }
        const docId = request.body.docId;
        if (!docId) {
            throw new functions.https.HttpsError(
                "invalid-argument",
                "Incorrect data.");
        }
        // Get document reference
        const docRef = DB.collection("properties").doc(docId);
        // Run transaction
        const transRes = await DB.runTransaction(async (transaction) => {
            const doc = await transaction.get(docRef);
            if (!doc.exists) {
                throw new functions.https.HttpsError(
                    "not-found",
                    "Property not found.");
            }
            let newVisits = 0;
            newVisits = doc.data()?.visits + 1;
            if (newVisits === 0) {
                newVisits = 1;
            }
            // Update
            await transaction.update(docRef, { visits: newVisits });
            if (doc.updateTime) {
                return doc.updateTime.toDate();
            } else {
                return admin.firestore.Timestamp.now().toDate();
            }
        });
        functions.logger.info("Properties:AddVisit. End", docId, transRes);
        // Return
        response.status(200).json({
            time: transRes,
            obj: docId,
        });
    } catch (error) {
        functions.logger.error("Exception in Properties:AddVisits. ", error);
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
 * Launch when create new document on properties collection
 * Create an empty photo document linked with new
 * property using its document identifier
 * Update createdAt field on property document
 */
export const onCreate = functions.firestore
    .document("properties/{docId}")
    .onCreate(async (snapshot, context) => {
        try {
            // Create a new blank photo document
            functions.logger.info("Properties:onCreate:Trigger. Start trigger");
            const photoRef = await DB.collection("photos").doc();
            // Create empty document with references
            const photoObj = Photo.create(photoRef.id, context.params.docId);
            // Parse to plain js object to save it
            const plainPhoto: PhotoInFirestore = photoObj.toFirestore();
            // Write to photos collection
            const resPhoto = await photoRef.set(plainPhoto);
            functions.logger.info("Properties:onCreate:Trigger. End Trigger",
                resPhoto.writeTime.toDate(), plainPhoto);
            // Update root document (properties)
            return snapshot.ref.set({
                isAvailable: false,
                isVisible: false,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            }, { merge: true });
        } catch (error) {
            functions.logger.error("Exception in Properties:onCreate:Trigger.",
                error);
            return Promise.reject(error);
        }
    });
/**
 * TRIGGER FUNCTION
 * Launch when property is deleted
 * Search all documents in photos collection to delete it and delete all the files
 * and the directory named as property identifer in the cloud storage.
 */
export const onDelete = functions.firestore
    .document("properties/{docId}")
    .onDelete(async (snapshot, context) => {
        try {
            functions.logger.info("Properties:onDelete:Trigger. Start");
            const propertyId = context.params.docId;
            // Get all records in photos collection
            const snapQuery = await DB.collection("photos")
                .where("propertyId", "==", propertyId)
                .get();
            if (snapQuery.empty) {
                // If NOT exists any document, there no exists files to delete
                functions.logger.info("Properties:onDelete:Trigger. End.",
                    propertyId);
            } else {
                // If exists at least one document, delete all files from bucket
                // in the directory named with the property Id
                const bucket = admin.storage().bucket();
                await bucket.deleteFiles({
                    prefix: `${propertyId}/`,
                    force: true,
                });
                // Get all documets related to the property
                // and delete from photos collection
                const delPhoto: string[] = [];
                snapQuery.forEach((docItem) => delPhoto.push(docItem.id));
                for (let i = 0; i < delPhoto.length; i++) {
                    await DB.collection("photos")
                        .doc(delPhoto[i])
                        .delete();
                }
                functions.logger.info("Properties:onDelete:Trigger. End.",
                    delPhoto, propertyId);
            }
            return Promise.resolve("deleted");
        } catch (error) {
            functions.logger.error("Exception in Properties:onDelete:Trigger.",
                error);
            return Promise.reject(error);
        }
    });
