export interface LocationInfoFirestore {
    latitude: string;
    longitude: string;
    address: string;
    placeId: string;
    reference: string;
}

export interface NewPhotoFromJson{
    propertyId: string;
}

export interface Thumbnail{
    name: string;
    url: string;
}
export interface Picture{
    name: string;
    url: string;
    thumb128: Thumbnail,
    thumb256: Thumbnail,
    thumb512: Thumbnail,
}

export interface PhotoInFirestore {
    id: string | undefined;
    propertyId: string;
    images: Picture[];
}

export interface RawProperty {
    id: string | undefined;
    name: string;
    description: string;
    years: number;
    price: number;
    currency: string;
    location: LocationInfoFirestore;
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
    propertyType: number;
    commercialMode: number;
    source: string;
    matter: string;
}
export interface RawPropertyShort {
    id: string | undefined;
    name: string;
    description: string;
    price: number;
    currency: string;
    location: LocationInfoFirestore;
    sizeMts: number;
    buildMts: number;
    floor: string;
    rooms: number;
    baths: number;
    parking: number;
    propertyType: number
    commercialMode: number;
    source: string;
    matter: string;
}

export interface PropertyInFirestore {
    id: string | undefined;
    name: string;
    description: string;
    price: number;
    currency: string;
    years: number;
    location: LocationInfoFirestore;
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
    propertyType: number;
    source: string;
    matter: string;
    commercialMode: number;
    isAvailable: boolean;
    isVisible: boolean;
    visits: number;
    interested: number;
    updatedAt: FirebaseFirestore.FieldValue |
    FirebaseFirestore.Timestamp | Date | undefined;
}

export interface RawPropertyForAdmin {
    id: string | undefined;
    name: string;
    description: string;
    years: number;
    price: number;
    currency: string;
    location: LocationInfoFirestore;
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
    propertyType: number;
    commercialMode: number;
    source: string;
    matter: string;
    isAvailable: boolean;
    isVisible: boolean;
    visits: number;
    interested: number;
}

