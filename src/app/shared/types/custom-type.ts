export type TGeoPosition = {
    latitude: number;
    longitude: number;
}

export declare type TAddress = {
    subStreet?: string; // Sub-Thoroughfare 
    street?: string; //Thoroughfare
    locality?: string;
    area?: string; // AdminArea => Région => district => zone
    postalCode?: string;
    country?: string; // Ville
}
