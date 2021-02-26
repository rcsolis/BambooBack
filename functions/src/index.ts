import * as app from "firebase-admin";
app.initializeApp();


// Organize and group functions based on features
import * as property from "./controllers/propertyController";
import * as searching from "./controllers/searchController";
import * as images from "./controllers/photoController";
import * as emailing from "./controllers/emailController";

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
 * - getById
 * - getByProperty
 */
export const photos = images;
/**
 * Search services:
 * - all
 * - getById
 */
export const search = searching;

/**
 * send an email
 */
export const email = emailing;
