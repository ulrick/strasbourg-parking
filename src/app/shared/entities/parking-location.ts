import { TGeoPosition } from '@shared/types';

export interface ParkingLocation {
    id: string|number;
    name: string;
    address?: string;
    position?: TGeoPosition;
    parkingType?: string;
    description?: string;
    status?: string;
    availablePlaces?: number;
    totalPlaces?: number;
    computedDistance?: number;
    updatedOn?: string;
}
