import { AddressFirestore } from "../utils/interfaces";
/**
 * Class for represent an Address Objects
 * @class
 */
export class Address {
    street: string
    colony: string
    municipality: string
    state: string
    postalCode: string

    constructor() {
        this.street = "";
        this.colony = "";
        this.municipality = "";
        this.state = "";
        this.postalCode = "";
    }
    /**
     * Method to parse object to plain js object.
     * @return {AddressFirestore} plain object representation.
     */
    toFirestore(): AddressFirestore {
        return {
            street: this.street,
            colony: this.colony,
            municipality: this.municipality,
            state: this.state,
            postalCode: this.postalCode,
        };
    }
}
