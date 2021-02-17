import { CoordinatesFirestore } from "../utils/interfaces";

/**
 * Class to represent a coordinates data for geolocalization
 * @class
 */
export class Coordinates {
    latitude: string
    longitude: string

    constructor() {
        this.latitude = "";
        this.longitude = "";
    }
    /**
     * Method to return a plain js object representation
     * @return {CoordinatesFirestore} plain object
     */
    toFirestore(): CoordinatesFirestore {
        return {
            latitude: this.latitude,
            longitude: this.longitude,
        };
    }
}
