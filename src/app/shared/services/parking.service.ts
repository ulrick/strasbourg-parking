
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { ParkingLocation } from '@shared/entities';
import { TGeoPosition } from '@shared/types';
import { BaseService } from '@shared/utils';

/*
  Generated class for the ParkingServiceProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable({ providedIn: 'root' })
export class ParkingService extends BaseService {

  private headers = new HttpHeaders(
    {
      'Authorization': 'Apikey 0d5c464242678895a08954f66399c26bad77bead3e89fcb1669c251a'
    });

  public endPoint = "https://data.strasbourg.eu/api/records/1.0/search";
  public parkingLocations: ParkingLocation[] = [];

  private datasets = {
    carParkingStatus: "occupation-parkings-temps-reel",
    carParkingLocation: "parkings",
    bicycleParking: "stations-velhop",
  }

  constructor(public httpClient: HttpClient) {
    super();
  }

  public readParkingLocation(): Observable<ParkingLocation[]> {

    let params = new HttpParams();
    params = params.append('dataset', this.datasets.carParkingLocation);
    params = params.append('rows', '50');

    if (this.parkingLocations?.length > 0) {
      return of(this.parkingLocations);
    }

    return this.httpClient.get<any>(`${this.endPoint}`, { headers: this.headers, params: params })
    .pipe(
      map(parkings => {
        const data = parkings.records.map(val => val.fields);
        return data.map((parking: any) => {
          const geoLocation: TGeoPosition = { latitude: parking.position[0], longitude: parking.position[1] }
          const newParking: ParkingLocation = {
            id: parking.idsurfs,
            name: parking.name,
            position: geoLocation,
            parkingType: parking.types,
            address: parking.address
          };

          return newParking;
        });
      }),
      tap((parkingLocations: ParkingLocation[]) => this.parkingLocations = parkingLocations),
      catchError(this.handleError)
    );
  }

  public readParkingStatus(): Observable<ParkingLocation[]> {
    let params = this.noCacheParams().params;
    params = params.append('dataset', this.datasets.carParkingStatus);
    params = params.append('rows', '50');
    params = params.append('facet', 'etat_descriptif');
    params = params.append('refine.etat_descriptif', 'Ouvert');

    return this.httpClient.get<any>(`${this.endPoint}`, { headers: this.headers, params: params })
      .pipe(
        map(parkingStatuses => {
          if (parkingStatuses.length <= 0) return [];
          const data = parkingStatuses.records.map(val => val.fields);
          return data.map((parking: any) => {
            const newParking: ParkingLocation = {
              id: parking.idsurfs,
              name: parking.nom_parking,
              availablePlaces: parking.libre,
              totalPlaces: parking.total,
            };

            return newParking;
          });
        }),
        catchError(this.handleError)
      );
  }

  public readBicycleParking(): Observable<ParkingLocation[]> {

    let params = this.noCacheParams().params;
    params = params.append('dataset', this.datasets.bicycleParking);
    params = params.append('rows', '50');

    return this.httpClient.get<any>(`${this.endPoint}`, { headers: this.headers, params: params })
      .pipe(
        map(parkings => {
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
        }),
        catchError(this.handleError)
      );
  }
}
