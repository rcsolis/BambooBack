import { Picture, PhotoInFirestore } from "../utils/interfaces";

/**
 * Represent a photo of a property
 * @class
 */
export class Photo {
    id: string | undefined;
    propertyId: string;
    images: Picture[]
    /**
     * @constructor
     */
    constructor() {
        this.id = "";
        this.propertyId = "";
        this.images = [];
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
    toFirestore(): PhotoInFirestore {
        return {
            id: this.id,
            propertyId: this.propertyId,
            images: this.images.map((item) => {
                return {
                    name: item.name,
                    url: item.url,
                    thumb128: item.thumb128,
                    thumb256: item.thumb256,
                    thumb512: item.thumb512,
                };
            }),
        };
    }

    static loadFromFirestore(data: any): Photo {
        const photo: Photo = new Photo();
        photo.id = data.id;
        photo.propertyId = data.propertyId;
        photo.images = data.images;
        return photo;
    }
}
