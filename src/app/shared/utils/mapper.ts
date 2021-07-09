import { ParkingLocation } from '@shared/entities';
import { TGeoPosition } from '@shared/types';

export function mapParkingLocation(parkingLocations: any): ParkingLocation[] {
    const data = parkingLocations.records.map(val => val.fields);
    return data.map((parking: any) => {

        const geoLocation: TGeoPosition = { latitude: parking.position[0], longitude: parking.position[1] }

        const newParking: ParkingLocation = {
            id: parking.idsurfs,
            name: parking.name,
            position: geoLocation,
            parkingType: parking?.types,
            address: parking.address
        };

        return newParking;
    });
}

export function mapParkingStatus(parkingStatus: any): ParkingLocation[] {
    if (parkingStatus.length <= 0) return [];
    const data = parkingStatus.records.map(val => val.fields);
    return data.map((parking: any) => {

        const newParking: ParkingLocation = {
            id: parking.idsurfs,
            name: parking.nom_parking,
            availablePlaces: parking.libre,
            totalPlaces: parking.total,
        };

        return newParking;
    });
}

export function mapBicycleParkings(parkings: any): ParkingLocation[] {
    const data = parkings.records.map(val => val.fields);
    return data.map((parking: any) => {

        const geoLocation: TGeoPosition = { latitude: parking.coordonnees[0], longitude: parking.coordonnees[1] }

        const newParking: ParkingLocation = {
            id: parking.id,
            name: parking.na,
            totalPlaces: parking.to,
            position: geoLocation,
            availablePlaces: parking.av,
        };

        return newParking;
    });
}
