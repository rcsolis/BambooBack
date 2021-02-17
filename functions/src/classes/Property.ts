import { Address } from "./Address";
import { Coordinates } from "./Coordinates";
import { PropertyType, CommercialMode } from "../utils/constants";
import { RawProperty, PropertyToFirestore } from "../utils/interfaces";

/**
 * Main class for represet a property
 * @class
 */
export class Property {
    id: string | undefined;
    name: string;
    description: string;
    years: number;
    address: Address;
    coordinates: Coordinates;
    sizeMts: number;
    buildMts: number;
    floor: string;
    rooms: number;
    baths: number;
    parking: number;
    hasLivingRoom: boolean;
    hasKitchen: boolean;
    hasServiceRoom: boolean;
    hasServiceArea: boolean;
    hasTvRoom: boolean;
    hasFurniture: boolean;
    hasCloset: boolean;
    hasTerrace: boolean;
    terraceMts: number;
    amenities: string[];
    propertyType: PropertyType;
    commercialMode: CommercialMode;
    isAvailable: boolean;
    isPublic: boolean;
    visits: number;
    interested: number;
    createdAt: FirebaseFirestore.FieldValue | undefined;
    updatedAt: FirebaseFirestore.FieldValue | undefined;
    availableAt: FirebaseFirestore.FieldValue | undefined;;
    publisedAt: FirebaseFirestore.FieldValue | undefined;;
    /**
     * @constructor
     */
    constructor() {
        this.id = undefined;
        this.name = "";
        this.description= "";
        this.years= 0.0;
        this.address= new Address();
        this.coordinates = new Coordinates();
        this.sizeMts = 0.0;
        this.buildMts= 0.0;
        this.floor= "";
        this.rooms= 0.0;
        this.baths= 0.0;
        this.parking= 0.0;
        this.hasLivingRoom= false;
        this.hasKitchen= false;
        this.hasServiceRoom= false;
        this.hasServiceArea= false;
        this.hasTvRoom= false;
        this.hasFurniture= false;
        this.hasCloset= false;
        this.hasTerrace= false;
        this.terraceMts= 0.0;
        this.amenities= [];
        this.propertyType= PropertyType.HOUSE;
        this.commercialMode= CommercialMode.SELL;
        this.isAvailable= false;
        this.isPublic= false;
        this.visits= 0.0;
        this.interested= 0.0;
        this.createdAt= undefined;
        this.updatedAt= undefined;
        this.availableAt= undefined;
        this.publisedAt= undefined;
    }
    /**
     * Static method to create a new instance
     * from plain object.
     * @param {RawProperty} obj Plain object
     * @return {Property} New object
     */
    static create = (obj: RawProperty): Property => {
        const newProp = new Property();
        newProp.name = obj.name;
        newProp.description = obj.description;
        newProp.years = obj.years;
        // address
        newProp.address.street = obj.address.street;
        newProp.address.colony = obj.address.colony;
        newProp.address.municipality = obj.address.municipality;
        newProp.address.state = obj.address.state;
        newProp.address.postalCode = obj.address.postalCode;
        // coordinates
        newProp.coordinates.latitude = obj.coordinates.latitude;
        newProp.coordinates.longitude = obj.coordinates.longitude;

        newProp.sizeMts = obj.sizeMts;
        newProp.buildMts = obj.buildMts;
        newProp.floor = obj.floor;
        newProp.rooms = obj.rooms;
        newProp.baths = obj.baths;
        newProp.parking = obj.parking;
        newProp.hasLivingRoom = obj.hasLivingRoom;
        newProp.hasKitchen = obj.hasKitchen;
        newProp.hasServiceRoom = obj.hasServiceRoom;
        newProp.hasServiceArea = obj.hasServiceArea;
        newProp.hasTvRoom = obj.hasTvRoom;
        newProp.hasFurniture = obj.hasFurniture;
        newProp.hasCloset = obj.hasCloset;
        newProp.hasTerrace = obj.hasTerrace;
        newProp.terraceMts = obj.terraceMts;
        newProp.amenities = obj.amenities;
        switch (obj.propertyType) {
        case PropertyType.APARTMENT:
            newProp.propertyType = PropertyType.APARTMENT;
            break;
        default:
            newProp.propertyType = PropertyType.HOUSE;
            break;
        }
        switch (obj.commercialMode) {
        case CommercialMode.PRESELL:
            newProp.commercialMode = CommercialMode.PRESELL;
            break;
        case CommercialMode.RENT:
            newProp.commercialMode = CommercialMode.RENT;
            break;
        default:
            // eslint-disable-next-line indent
                newProp.commercialMode = CommercialMode.SELL;
            break;
        }

        return newProp;
    }
    /**
     * Creates a plain object to save it to firestore
     * merging the current values with the new values received
     * @param {string} docId Document identifier
     * @param {FirebaseFirestore.DocumentData} current Current values
     * @param {RawProperty} next New values
     * @param {FirebaseFirestore.FieldValue} updateTimestamp Server timestamp
     * @return {PropertyToFirestore} Updated plain object
     */
    static update = (docId: string,
        current: FirebaseFirestore.DocumentData,
        next: RawProperty,
        updateTimestamp: FirebaseFirestore.FieldValue): PropertyToFirestore => {
        const curAmenities: Array<string> = current.amenities;
        next.amenities.forEach((value) => {
            if (!curAmenities.includes(value)) {
                curAmenities.push(value);
            }
        });
        const newAmenities = curAmenities.sort((a, b) => {
            if (a > b) return 1;
            if (a < b) return -1;
            return 0;
        });
        let newPropertyType: PropertyType = current.propertyType;
        if (next.propertyType !== current.propertyType) {
            switch (next.propertyType) {
            case PropertyType.APARTMENT:
                newPropertyType = PropertyType.APARTMENT;
                break;
            default:
                newPropertyType = PropertyType.HOUSE;
                break;
            }
        }
        let newCommercialMode: CommercialMode = current.commercialMode;
        if (next.commercialMode !== current.commercialMode) {
            switch (next.commercialMode) {
            case CommercialMode.PRESELL:
                newCommercialMode = CommercialMode.PRESELL;
                break;
            case CommercialMode.RENT:
                newCommercialMode = CommercialMode.RENT;
                break;
            default:
                newCommercialMode = CommercialMode.SELL;
                break;
            }
        }
        return {
            id: docId,
            name: (next.name && next.name !== current.name) ?
                next.name : current.name,
            description: (next.description &&
                next.description !== current.description) ?
                next.description : current.description,
            years: (next.years !== current.years) ?
                next.years : current.years,
            address: {
                street: (next.address.street &&
                    next.address.street !== current.address.street) ?
                    next.address.street : current.address.street,
                colony: (next.address.colony &&
                    next.address.colony !== current.address.colony) ?
                    next.address.colony : current.address.colony,
                municipality: (next.address.municipality &&
                next.address.municipality !== current.address.municipality) ?
                    next.address.municipality : current.address.municipality,
                state: (next.address.state &&
                    next.address.state !== current.address.state) ?
                    next.address.state : current.address.state,
                postalCode: (next.address.postalCode &&
                    next.address.postalCode !== current.address.postalCode) ?
                    next.address.postalCode : current.address.postalCode,
            },
            coordinates: {
                latitude: (next.coordinates.latitude &&
                next.coordinates.latitude !== current.coordinates.latitude )?
                    next.coordinates.latitude : current.coordinates.latitude,
                longitude: (next.coordinates.longitude &&
                next.coordinates.longitude !== current.coordinates.longitude) ?
                    next.coordinates.longitude : current.coordinates.longitude,
            },
            sizeMts: (next.sizeMts !== current.sizeMts) ?
                next.sizeMts : current.sizeMts,
            buildMts: (next.buildMts !== current.buildMts) ?
                next.buildMts : current.buildMts,
            floor: (next.floor !== current.floor) ?
                next.floor : current.floor,
            rooms: (next.rooms !== current.rooms) ?
                next.rooms : current.rooms,
            baths: (next.baths !== current.baths) ?
                next.baths : current.baths,
            parking: (next.parking !== current.parking) ?
                next.parking : current.parking,
            hasLivingRoom: (next.hasLivingRoom !== current.hasLivingRoom) ?
                next.hasLivingRoom : current.hasLivingRoom,
            hasKitchen: (next.hasKitchen !== current.hasKitchen) ?
                next.hasKitchen : current.hasKitchen,
            hasServiceRoom: (next.hasServiceRoom !== current.hasServiceRoom) ?
                next.hasServiceRoom : current.hasServiceRoom,
            hasServiceArea: (next.hasServiceArea !== current.hasServiceArea) ?
                next.hasServiceArea : current.hasServiceArea,
            hasTvRoom: (next.hasTvRoom !== current.hasTvRoom) ?
                next.hasTvRoom : current.hasTvRoom,
            hasFurniture: (next.hasFurniture !== current.hasFurniture) ?
                next.hasFurniture : current.hasFurniture,
            hasCloset: (next.hasCloset !== current.hasCloset) ?
                next.hasCloset : current.hasCloset,
            hasTerrace: (next.hasTerrace !== current.hasTerrace) ?
                next.hasTerrace : current.hasTerrace,
            terraceMts: (next.terraceMts !== current.terraceMts) ?
                next.terraceMts : current.terraceMts,
            amenities: newAmenities,
            propertyType: newPropertyType,
            commercialMode: newCommercialMode,
            isAvailable: current.isAvailable,
            isPublic: current.isPublic,
            visits: current.visits,
            interested: current.interested,
            updatedAt: updateTimestamp,
        };
    }
    /**
     * Method to create a plain object to save to db
     * with all the properties available.
     * @param {string} uid Document identifier
     * @return {PropertyToFirestore} Plain object
     */
    toFirestore(uid: string | undefined): PropertyToFirestore {
        return {
            id: (this.id)?this.id:uid,
            name: this.name,
            description: this.description,
            years: this.years,
            address: this.address.toFirestore(),
            coordinates: this.coordinates.toFirestore(),
            sizeMts: this.sizeMts,
            buildMts: this.buildMts,
            floor: this.floor,
            rooms: this.rooms,
            baths: this.baths,
            parking: this.parking,
            hasLivingRoom: this.hasLivingRoom,
            hasKitchen: this.hasKitchen,
            hasServiceRoom: this.hasServiceRoom,
            hasServiceArea: this.hasServiceArea,
            hasTvRoom: this.hasTvRoom,
            hasFurniture: this.hasFurniture,
            hasCloset: this.hasCloset,
            hasTerrace: this.hasTerrace,
            terraceMts: this.terraceMts,
            amenities: this.amenities,
            propertyType: this.propertyType,
            commercialMode: this.commercialMode,
            isAvailable: this.isAvailable,
            isPublic: this.isPublic,
            visits: this.visits,
            interested: this.interested,
            updatedAt: this.updatedAt,
        };
    }
}
