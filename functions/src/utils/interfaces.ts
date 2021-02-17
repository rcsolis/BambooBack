export interface AddressFirestore {
    street: string;
    colony: string;
    municipality: string;
    state: string;
    postalCode: string;
}

export interface CoordinatesFirestore {
    latitude: string;
    longitude: string;
}

export interface NewPhotoFromJson{
    propertyId: string;
    name: string;
    description: string;
}
export interface PhotoToFirestore {
    id: string | undefined;
    propertyId: string;
    name: string;
    description: string;
}

export interface RawProperty {
    name: string;
    description: string;
    years: number;
    address: AddressFirestore;
    coordinates: CoordinatesFirestore;
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
    propertyType: number
    commercialMode: number;
}

export interface PropertyToFirestore {
    id: string | undefined;
    name: string;
    description: string;
    years: number;
    address: AddressFirestore;
    coordinates: CoordinatesFirestore;
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
    propertyType: number
    commercialMode: number;
    isAvailable: boolean;
    isPublic: boolean;
    visits: number;
    interested: number;
    updatedAt: FirebaseFirestore.FieldValue | undefined;
}
