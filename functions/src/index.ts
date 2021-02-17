import * as app from "firebase-admin";
app.initializeApp();


// Organize and group functions based on features
import * as property from "./controllers/propertyController";
import * as searching from "./controllers/searchController";
// import * as photos from "./controllers/photoController"
/**
 * Property services:
 * - Create: HTTPS.REQUEST - POST
 * - OnCreate: TRIGGER
 * - Update: HTTPS.REQUEST - PUT
 * - Delete: HTTPS.REQUEST - DELETE
 * - OnDelete: TRIGGER
 * - UpdatePrice: HTTPS.REQUEST - PUT
 * - UpdateAvailabily: HTTPS.REQUEST - PUT
 * - UpdateVisibility: HTTPS.REQUEST - PUT
 * - AddInterest: HTTPS.REQUEST - PUT
 */
export const properties = property;
/**
 * Photos services:
 * - create
 * - OnCreate
 * - remove
 */
// export const photos = photo
/**
 * Search services:
 * - all
 * - getById
 */
export const search = searching;
