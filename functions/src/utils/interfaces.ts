
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
}

export interface Picture{
    name: string;
    url: string;
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
export interface RawPropertyShort {
    id: string | undefined;
    name: string;
    description: string;
    price: number;
    currency: string;
    address: AddressFirestore;
    coordinates: CoordinatesFirestore;
    sizeMts: number;
    buildMts: number;
    floor: string;
    rooms: number;
    baths: number;
    parking: number;
    propertyType: number
    commercialMode: number;
}
export interface PropertyInFirestore {
    id: string | undefined;
    name: string;
    description: string;
    price: number;
    currency: string;
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
    isVisible: boolean;
    visits: number;
    interested: number;
    updatedAt: FirebaseFirestore.Timestamp | Date | undefined;
}


