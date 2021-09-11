import { Geolocation, GeolocationOptions } from "@ionic-native/geolocation/ngx";
import { NativeGeocoder, NativeGeocoderResult } from "@ionic-native/native-geocoder/ngx";
import { Network } from "@ionic-native/network/ngx";
import { ToastController } from "@ionic/angular";

import { ParkingLocation } from "@shared/entities";
import { ParkingService } from "@shared/services";

export abstract class ParkingBase {
    parkings: ParkingLocation[] = [];
    protected geolocationOptions: GeolocationOptions = {
        enableHighAccuracy: true,
        // timeout: 10000, // Tu as 3 secondes max pour me retourner la position GPS actuelle
        // maximumAge: 0 // Durée en millisecondes du cache de la position courante
    }
    protected currentPosition: any = null;
    networkAvailable = true;
    disconnectSubscription;
    connectSubscription;
    letterStartTitle: string;

    constructor(
        protected _parkingService: ParkingService,
        protected _toastController: ToastController,
        protected _geolocation: Geolocation,
        protected _nativeGeocoder: NativeGeocoder,
        protected _network: Network) {
    }

    protected abstract loadParkings(): void;

    createParking() {
    }

    async presentToast(message: string) {
        const toast = await this._toastController.create({
            message: message,
            duration: 5000,
            position: 'bottom',
            cssClass: 'toast-card'
        });
        toast.present();
    }

    public doRefresh(event) {
        setTimeout(() => {
            this.loadParkings();
            event.target.complete();
        }, 2000);
    }

    protected buildAddress(parking: ParkingLocation): void {
        if (parking.address) {
            return;
        }

        if(parking.position == null) return;
    
        this._nativeGeocoder.reverseGeocode(parking.position.latitude, parking.position.longitude)
          .then((results: NativeGeocoderResult[]) =>{
    
          if (results.length == 0) {
            return;
          }
    
          parking.address = 
            `${results[0]?.subThoroughfare ?? ''}
            ${results[0].thoroughfare || ' '}
            ${results[0].locality || ''},
            ${results[0].postalCode || ''}`
        })
        .catch((error: any) => console.log(error));
    }

    public showDirection(parking: ParkingLocation): void {
        if (!this.currentPosition) return;

        var latLngOrigin: string = this.currentPosition.coords.latitude.toString() + ',' + this.currentPosition.coords.longitude.toString();
        var latLngDest: string = parking.position.latitude.toString() + ',' + parking.position.longitude.toString();
        window.open('https://www.google.com/maps/dir/?api=1&origin=' + latLngOrigin + '&destination=' + latLngDest);
    }

    protected handleError(error) {
        var message: string = "Problème de position GPS!";

        switch (error.code) {
            case 1: message = "Veuillez autoriser l'application à accéder à votre position!";
                break;
            case 2: message = "Impossible de récupérer votre position actuelle!";
                break;
            default: message = "Problème de position GPS!";
                break;
        }

        this.presentToast(message);
    }
}