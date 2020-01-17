// https://docs.google.com/presentation/d/1zlkmoSY4AzDJc_P4IqWLnzct41IqHyzGkLeyhlAxMDE/edit#slide=id.gefe7d3b89a139c8_255

import { NativeGeocoder, NativeGeocoderReverseResult } from '@ionic-native/native-geocoder';
import {GeolocationOptions, Geolocation,  Geoposition, Coordinates} from '@ionic-native/geolocation';
import { ParkingServiceProvider } from '../../providers/parking-service/parking-service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';
import { TParking } from '../../types/custom-type';
import { ParkingStatus } from '../../model/parking-status';
import { ParkingLocation } from '../../model/parking-location';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import { Observable, Subscription } from 'rxjs/Rx';
import 'rxjs/add/observable/interval';
import { UnitConverterPipe } from '../../pipes/unit-converter/unit-converter';
import { NetworkManagerProvider } from '../../providers/network-manager/network-manager';
import { SpinnerDialog } from '@ionic-native/spinner-dialog';
import { Spherical } from '../../core/spherical';
import { Enums } from '../../enums/enums';


export interface ILatLng {
  lat: number;
  lng: number;
}

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  providers: [ ParkingServiceProvider, NetworkManagerProvider ]
})
export class HomePage implements OnInit, OnDestroy {

  private parkings: TParking[] = [];
  private parkingLocations: ParkingLocation[] = [];
  private parkingStatus: ParkingStatus[] = [];
  private parkingSubscriber : Subscription;
  private timer;
  private currentPosition: ILatLng; // = {lat: 48.544666689216, lng: 7.7357170060558};
  private positionWatchSubscriber: Subscription;
  private unitConverter: UnitConverterPipe = new UnitConverterPipe();
  private isNetworkAvailable: boolean = false;
  private areParkingsAvailable = true;

  private geolocationOptions : GeolocationOptions = {
    enableHighAccuracy: true,
    timeout: 3000, // Tu as 3 secondes pour me retourner la position GPS actuelle
    maximumAge: 0
  }

  constructor(  public navCtrl: NavController, 
                public parkingService: ParkingServiceProvider, 
                private geolocation: Geolocation, 
                private network : NetworkManagerProvider, 
                private spinnerDialog : SpinnerDialog,
                public loadingCtrl: LoadingController,
                private nativeGeocoder: NativeGeocoder) {

    this.isNetworkAvailable = this.network.isConnected();
    
  }

  ngOnInit() {
  }

  ngOnDestroy() { 
    this.parkingSubscriber.unsubscribe();
  }

  ionViewDidLoad() {
    
  }

  ionViewWillEnter(){

    this.showParkings();

    this.network.onConnect().subscribe(data=>{
      if(data.type == "online"){
        this.isNetworkAvailable = true;
        this.pollRequest();
      }
    })

    this.network.onDisconnect().subscribe(data=>{

      if(data.type == "offline"){
        this.isNetworkAvailable = false;
        this.spinnerDialog.show("Déconnexion!", "Vous n'êtes pas connectés!"), error => console.log(error);
        setTimeout(() => {
          this.spinnerDialog.hide();
        }, 3000);
        
        if(this.parkingSubscriber){
          this.parkingSubscriber.unsubscribe();
          this.parkingSubscriber = null;
        }    
      }
      
    });
  }

  ionViewWillLeave(){
    this.parkingSubscriber.unsubscribe();
  }

  /**
   * Initializes parking status and location data
   *
   * @private
   * @returns {Promise<any>}
   * @memberof HomePage
   */
  private initParkingAvailability(): Promise<any>{

    if(!this.isNetworkAvailable){
      return Promise.reject("Connexion non disponible!");
    }

    var p1 = this.parkingService.readParkingStatus()
      .then((parkingStatus: ParkingStatus[]) => {
        if(parkingStatus){
          this.parkingStatus = parkingStatus; 
        }
      })

    var p2 = this.parkingService.readParkingLocation()
      .then((parkingLocations: ParkingLocation[])=>{
        if(parkingLocations){
          this.parkingLocations = parkingLocations;
        }
      })

    return Promise.all([p1, p2]).catch(error => {
      Promise.reject(error);
    });

  }


  /**
   * Returns the user current position with geolocation
   *
   * @private
   * @returns {Promise<Geoposition>}
   * @memberof HomePage
   */
  private getCurrentPosition(): Promise<Geoposition> {
    return this.geolocation.getCurrentPosition(this.geolocationOptions)
  }

  /**
   *Polling request every 30 seconds to get the parking data from the strasbourg open data server 
   *
   * @private
   * @memberof HomePage
   */
  private pollRequest(): void {

    this.timer = Observable.timer(0, 1000 * 15); // Request every 15 seconds
    this.parkingSubscriber = this.timer.subscribe((val) => {
    
      this.getCurrentPosition().then((position: Geoposition)=>{
        if(position){

          this.initParkingAvailability().then(()=> {
            var coordinates: Coordinates = position.coords;
            var currentPosition: ILatLng = {lat: coordinates.latitude, lng: coordinates.longitude};
            this.currentPosition = currentPosition;
            
            this.getParkings(currentPosition);
          })
          .catch((error)=>{
            if(this.parkingSubscriber){
              this.parkingSubscriber.unsubscribe();
              this.parkingSubscriber = null;
            }
          });
        }
      }) 
      .catch((error)=>{
    
        var message: string = "Problème de position GPS!";
  
        switch(error.code){
          case 1: message = "Veuillez autoriser l'application à accéder à votre position!";
            break;
          case 2: message = "Impossible de récupérer votre position actuelle!";
            break;
          //case 3: message = "";
            //break;
          default: message = "Problème de position GPS!";
            break;
        }
  
        this.spinnerDialog.show("GPS", message);
          setTimeout(()=>{
            this.spinnerDialog.hide();
          }, 4000);
      })
    })
  }

  /**
   * Builds parking data
   * 
   * @memberof HomePage
   */
  public getParkings(currentPosition?: ILatLng): void {

    let parkings: TParking[] = [];

    if(this.parkingStatus.length == 0 || this.parkingLocations.length == 0){
      return;
    }

    if(this.parkingStatus){

      parkings = this.parkingStatus.map((parkingStatus:ParkingStatus, index: number)=>{

        // Gets parking location object
        var parkingLocation: ParkingLocation = this.findParking(parkingStatus.id);

        var parking: TParking = null;

        // Checks if a parking status exists in the parking location list
        if( parkingLocation != null ) {
          
          var positionParking: ILatLng = {lat: parkingLocation.position.latitude, lng: parkingLocation.position.longitude};

          parking = {
            id: parkingStatus.id,
            name: parkingLocation.name,
            status: parkingStatus.status,
            availablePlaces: parkingStatus.nbAvailablePlaces,
            position: parkingLocation.position,
            parkingType: parkingLocation.parkingType,
            address: {},
            distance: Spherical.computeDistanceBetween(currentPosition, positionParking),
          }

          this.setAddress(parking);
        }

        return parking;
      })
      .filter(val=>{ 
        // Filter and return only parkings that are opened
        return val != null && val.status == Enums.ParkingStatus[Enums.ParkingStatus.Open];
      }).sort( (a: TParking, b: TParking) => {
        // Then sort by nearest parking 
        return a.distance - b.distance;
      });

      this.parkings = parkings;
      this.areParkingsAvailable = this.parkings.length != 0 ? true: false;
      
    }
  }

  /**
   * Converts latlng position into address into user understandable address
   *
   * @private
   * @param {TParking} parking
   * @returns {void}
   * @memberof HomePage
   */
  private setAddress(parking: TParking): void {

    parking.address = {
      subStreet: "",
      street: "",
      locality: "",
      area: "",
      postalCode:  "",
      country: ""
    }

    if(parking.position == null) return;

    this.nativeGeocoder.reverseGeocode(parking.position.latitude, parking.position.longitude)
      .then((results: NativeGeocoderReverseResult[]) =>{

      if (results.length == 0) {
        return;
      }

      parking.address = {
        subStreet: results[0].subThoroughfare || "",
        street: results[0].thoroughfare || "",
        locality: results[0].locality || "",
        area: results[0].administrativeArea || "",
        postalCode: results[0].postalCode || "",
        country: results[0].countryName || ""
      }
    })
    .catch((error: any) => console.log(error));
  }

  /**
   * Open and use google map direction service
   *
   * @public
   * @param {TParking} parking
   * @memberof HomePage
   */
  public showDirection(parking: TParking): void{

    var latLngOrigin: string = this.currentPosition.lat.toString()+","+this.currentPosition.lng.toString();
    var latLngDest: string = parking.position.latitude.toString() +","+parking.position.longitude.toString();
    window.open("https://www.google.com/maps/dir/?api=1&origin="+latLngOrigin+"&destination="+latLngDest);
  }

 
  /**
   * Finds parking location from the given parking status id
   * 
   * @private
   * @param {number} parkingId 
   * @returns {ParkingLocation} 
   * @memberof HomePage
   */
  private findParking(parkingId: number): ParkingLocation{
    
    var parking: ParkingLocation = null;
   
    parking = this.parkingLocations.find((location: ParkingLocation) =>{ 
      return location.id == parkingId;
    })
  
    return parking;
  }

  /**
   * Reload data from server
   *
   * @param {*} refresher
   * @memberof HomePage
   */
  public doRefresh(refresher) {
    setTimeout(() => {
      if(this.isNetworkAvailable){
        this.pollRequest();
      }
      refresher.complete();
    }, 1000);
  }


  public showParkings(){
    let loading = this.loadingCtrl.create({
      content: 'Chargement des données...'
    });
  
    loading.present();
  
    setTimeout(() => {
      if(this.isNetworkAvailable){
        this.pollRequest();
      }
      else{
        this.areParkingsAvailable = false;
      }
      loading.dismiss();
    }, 1000);
  }

  /*********************** Google map integration ********************/
  /******************
   * *********
   * ****
   * **
   */
  // private startTraking(location?: ILatLng) {

  //   this.positionWatchSubscriber = this.watchPosition().subscribe((data: Geoposition) => {

  //       let updatelocation = { lat: data.coords.latitude, lng: data.coords.longitude };
  //       let image = './assets/imgs/automobile24px.png';
      
  //       this.map.setCameraTarget(updatelocation);
  //       this.currentMarker.setPosition(updatelocation);
  //       this.currentPosition = updatelocation;

  //       this.getParkings(this.currentPosition);

  //       console.log("new location ", updatelocation);
  //       //promise = Promise.resolve(this.currentPosition);
      
  //   });
  // }

  // private watchPosition():Observable<Geoposition>{
  //   return this.geolocation.watchPosition(this.geolocationOptions);
  // }

  // private loadMap(): void {

  //   this.getCurrentPosition().then((position: Geoposition)=>{
  //     let mapOptions: GoogleMapOptions = {
  //       camera: {
  //         target: {
  //           lat: position.coords.latitude,
  //           lng: position.coords.longitude
  //         },
  //         zoom: 12
  //         //tilt: 30
  //       }
  //     };

  //     let markerOptions: MarkerOptions = {
  //       title: 'Ma position',
  //       icon: './assets/imgs/automobile24px.png',
  //       position: {
  //         lat: position.coords.latitude,
  //         lng: position.coords.longitude
  //       }
  //     }

  //     //this.map = GoogleMaps.create('map_canvas', mapOptions);
  //     this.map.setOptions(mapOptions);
  //     this.currentMarker = this.map.addMarkerSync(markerOptions);

  //   })
  // }

}
