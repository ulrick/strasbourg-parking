
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import { Enums } from '../../enums/enums';
import { ParkingLocation } from '../../model/parking-location';
import { TGeoPosition } from '../../types/custom-type';
import { ParkingStatus } from '../../model/parking-status';
import { Mapper } from '../../core/mapper';


/*
  Generated class for the ParkingServiceProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ParkingServiceProvider {

  private parkingsLocation: ParkingLocation[] = [];
  private parkingsStatus: ParkingStatus[] = [];

  private headers = new Headers({'Content-Type': 'application/json; charset=UTF-8',
                                  'Access-Control-Allow-Origin' : '*',
                                  'Access-Control-Allow-Methods': 'GET, OPTIONS',
                                  'Accept': 'application/json'
                                });

  constructor(public httpClient: HttpClient, public http: Http) {

    console.log('Hello ParkingServiceProvider Provider');
  }

  /**
   * 
   * 
   * @returns {Promise<ParkingLocation[]>} 
   * @memberof ParkingServiceProvider
   */
  public readParkingLocation(): Promise<ParkingLocation[]> {

    var headers = this.headers;
  
    let options = new RequestOptions({ headers:headers});

    return new Promise(resolve => {
      this.http.get("http://carto.strasmap.eu/remote.amf.json/Parking.geometry", options)
      //this.http.get("/assets/mock/mock-location.json", options)
        .map(res => res.json())
        .subscribe((data: any) =>{

          let parkings: ParkingLocation[] = data.s.map((parking: any, index) => {

            var geoLocation: TGeoPosition = {latitude: parking.go.y, longitude: parking.go.x}
            var parkingType: Enums.ParkingType = Mapper.mapParkingType(parking.ic);

            return new ParkingLocation(parseInt(parking.id), parking.ln, geoLocation, Enums.ParkingType[parkingType]);

          })

          this.parkingsLocation = parkings;

          resolve(this.parkingsLocation);
        });
    }).catch(error => {
      this.handleError("Une erreur s'est produite. Vérifier la connexion!");
    }) as Promise<ParkingLocation[]>;
  }


  /**
   * 
   * 
   * @returns {Promise<ParkingStatus[]>} 
   * @memberof ParkingServiceProvider
   */
  public readParkingStatus(): Promise<ParkingStatus[]> {

    var headers = this.headers;  
    let options = new RequestOptions({ headers:headers});

    return new Promise(resolve => {
      this.http.get("http://carto.strasmap.eu/remote.amf.json/Parking.status", options)
      //this.http.get("/assets/mock/mock-status.json", options) 
        .map(res => res.json())
        .subscribe((data: any) =>{ 

          let parkingsStatus: ParkingStatus[] = data.s.map((parking: any, index) => {

            var status: Enums.ParkingStatus = Mapper.mapStatus(parking.ds);
            var nbAvailablePlaces: number = parseInt(parking.df);
            var nbTotalPlaces: number = parseInt(parking.dt);

            return new ParkingStatus(parseInt(parking.id), Enums.ParkingStatus[status], nbAvailablePlaces, nbTotalPlaces);
            
          })

          this.parkingsStatus = parkingsStatus;

          resolve(this.parkingsStatus);
        });
    }).catch(error => {
      this.handleError("Une erreur s'est produite. Vérifier la connexion! "+ error);
    }) as Promise<ParkingStatus[]>;
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
