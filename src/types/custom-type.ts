import { Enums } from "../enums/enums";


export type TGeoPosition = {
    latitude: number;
    longitude: number;
}

export type TParkingStatus = {
    id: number;
    status: string;
    nbAvailablePlaces: number;
    nbTotalPlaces: number;
}

export declare type TAddress = {
    subStreet?: string; // Sub-Thoroughfare 
    street?: string; //Thoroughfare
    locality?: string;
    area?: string; // AdminArea => Région => district => zone
    postalCode?: string;
    country?: string; // Ville
  }
  
  export declare type TParking = {
    id:number, 
    name: string, 
    status: string, 
    availablePlaces: number, 
    position:TGeoPosition, 
    parkingType: string, 
    distance?: number,
    address?: TAddress,
    zone?: Enums.ParkingArea,
    price?: number 
  }