import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { Property } from "../classes/Property";

const DB = admin.firestore();

export const all = functions.https.onRequest(async (request, response) => {
    try {
        functions.logger.info("Search:All. Start");
        // Test method and data
        if (request.method !== "GET" && request.is("application/json")) {
            throw new functions.https.HttpsError(
                "unimplemented",
                "Method not allowed");
        }
        if (request.body === undefined ) {
            throw new functions.https.HttpsError(
                "invalid-argument",
                "Data is empty");
        }
        const complete: boolean = request.body.complete;
        // Get all Documents
        const docRef = DB.collection("properties");
        const snapshots = await docRef.where("isAvailable", "==", true)
            .where("isVisible", "==", true)
            .orderBy("price", "desc")
            .get();
        let total: number = 0;
        const result: Array<any> = [];
        if (!snapshots.empty) {
            snapshots.forEach((document) => {
                const data: FirebaseFirestore.DocumentData = document.data();
                const prop: Property = Property.fromFirestore(document.id, data);
                if (complete) {
                    result.push(prop.getComplete());
                } else {
                    result.push(prop.getShort());
                }
            });
            total = result.length;
        }
        functions.logger.info("Search:All. End");
        response.status(200).json({
            total: total,
            properties: result,
        });
    } catch (error) {
        functions.logger.error("Exception in Search:All. ", error);
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

export const getById = functions.https.onRequest(async (request, response) => {
    try {
        functions.logger.info("Search:GetById. Start");
        // Test method and data
        if (request.method !== "GET" && request.is("application/json")) {
            throw new functions.https.HttpsError(
                "unimplemented",
                "Method not allowed");
        }
        if (request.body === undefined ) {
            throw new functions.https.HttpsError(
                "invalid-argument",
                "Data is empty");
        }
        const docId: string = request.body.docId;
        if (!docId) {
            throw new functions.https.HttpsError(
                "invalid-argument",
                "Incorrect data.");
        }
        // Get all Document
        const docRef = DB.collection("properties").doc(docId);
        const snapshot = await docRef.get();
        if (!snapshot.exists) {
            throw new functions.https.HttpsError(
                "not-found",
                "Property not found.");
        }
        const docData = snapshot.data()!;
        if (!docData.isAvailable || !docData.isVisible) {
            throw new functions.https.HttpsError(
                "failed-precondition",
                "Property not available.");
        }
        const prop: Property = Property.fromFirestore(snapshot.id, docData);
        functions.logger.info("Search:GetById. End");
        response.status(200).json({
            property: prop.getComplete(),
        });
    } catch (error) {
        functions.logger.error("Exception in Search:GetById. ", error);
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
