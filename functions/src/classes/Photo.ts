import { PhotoToFirestore } from "../utils/interfaces";

/**
 * Represent a photo of a property
 * @class
 */
export class Photo {
    id: string | undefined;
    propertyId: string;
    name: string;
    description: string;
    /**
     * @constructor
     */
    constructor() {
        this.id = "";
        this.propertyId = "";
        this.name = "";
        this.description = "";
    }
    /**
     * Create a new instance linked with a property
     * @param {string} uid Photo identifier
     * @param {string} pid Property identifier
     * @return {Photo} New instance of photo
     */
    static create = (uid:string, pid: string): Photo => {
        const ph = new Photo();
        ph.id = uid;
        ph.propertyId = pid;
        return ph;
    }
    /**
     * Method to create a plain js object representation
     * @return {PhotoToFirestore} Plain object
     */
    toFirestore(): PhotoToFirestore {
        return {
            id: this.id,
            propertyId: this.propertyId,
            name: this.name,
            description: this.description,
        };
    }
}
