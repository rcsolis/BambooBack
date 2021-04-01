import { LocationInfoFirestore } from "../utils/interfaces";

/**
 * Class to represent a coordinates data for geolocalization
 * @class
 */
export class LocationInfo {
    latitude: string
    longitude: string
    address: string
    placeId: string
    reference: string

    constructor() {
        this.latitude = "";
        this.longitude = "";
        this.address = "";
        this.placeId = "";
        this.reference = "";
    }
    /**
     * Method to return a plain js object representation
     * @return {LocationInfoFirestore} plain object
     */
    toFirestore(): LocationInfoFirestore {
        return {
            latitude: this.latitude,
            longitude: this.longitude,
            address: this.address,
            placeId: this.placeId,
            reference: this.reference,
        };
    }
}
