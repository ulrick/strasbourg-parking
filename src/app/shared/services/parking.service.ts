
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable, timer } from 'rxjs';
import { catchError, retry, switchMap } from 'rxjs/operators';

import { ParkingLocation } from '@shared/entities';

/*
  Generated class for the ParkingServiceProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable({ providedIn: 'root' })
export class ParkingService {

  private headers = new HttpHeaders(
    {
      'Authorization': 'Apikey 0d5c464242678895a08954f66399c26bad77bead3e89fcb1669c251a'
    });

  public endPoint = "https://data.strasbourg.eu/api/records/1.0/search";

  private datasets = {
    carParkingStatus: "occupation-parkings-temps-reel",
    carParkingLocation: "parkings",
    bicycleParking: "stations-velhop",
  }

  constructor(public httpClient: HttpClient) {
  }

  public readParkingLocation(): Observable<ParkingLocation[]> {

    let params = new HttpParams();
    params = params.append('dataset', this.datasets.carParkingLocation);
    params = params.append('rows', '50');

    return this.httpClient.get<any>(`${this.endPoint}`, { headers: this.headers, params: params })
      .pipe(
        catchError(this.handleError)
      );
  }

  public readParkingStatus(): Observable<ParkingLocation[]> {

    let params = new HttpParams();
    params = params.append('dataset', this.datasets.carParkingStatus);
    params = params.append('rows', '50');
    params = params.append('facet', 'etat_descriptif');
    params = params.append('refine.etat_descriptif', 'Ouvert');

    return this.httpClient.get<any>(`${this.endPoint}`, { headers: this.headers, params: params })
      .pipe(
        catchError(this.handleError)
      );
  }

  public readBicycleParking(): Observable<ParkingLocation[]> {

    let params = new HttpParams();
    params = params.append('dataset', this.datasets.bicycleParking);
    params = params.append('rows', '50');

    return this.httpClient.get<any>(`${this.endPoint}`, { headers: this.headers, params: params })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Handle error
   *
   * @private
   * @param {*} [error="Une erreur est survenue!"]
   * @returns {Promise<any>}
   * @memberof ParkingServiceProvider
   */
  private handleError(error: any = "Une erreur est survenue!"): Promise<any> {
    //console.error('Une erreur est survenue dans la couche service', error);
    return Promise.reject(error.message || error);
  }

}
