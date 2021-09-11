import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Geolocation, GeolocationOptions } from '@ionic-native/geolocation/ngx';

import { Observable, Subject, timer } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { ParkingLocation } from '@shared/entities';
import { ParkingService } from '@shared/services';
import { mapBicycleParkings } from '@shared/utils/mapper';
import { Spherical } from '@shared/utils';
import { NativeGeocoder, NativeGeocoderResult } from '@ionic-native/native-geocoder/ngx';
import { ParkingBase } from '@shared/components';
import { Network } from '@ionic-native/network/ngx';

@Component({
  selector: 'app-bicycle-parking',
  templateUrl: './bicycle-parking.component.html',
  styleUrls: ['./bicycle-parking.component.scss'],
})
export class BicycleParkingComponent extends ParkingBase implements OnInit {

  private bicycleParkings: ParkingLocation[] = [];
  private _unsubscribe = new Subject<void>();
  parkingStatuses: ParkingLocation[] = [];
  parkings: ParkingLocation[] = [];
  
  protected currentPosition: any = null;
  headerTitle: string;

  constructor(
    protected _parkingService: ParkingService,
    private _route: ActivatedRoute,
    private _titleService: Title,
    protected _toastController: ToastController,
    protected _geolocation: Geolocation,
    protected _nativeGeocoder: NativeGeocoder,
    protected _network: Network
  ) {
    super(_parkingService, _toastController, _geolocation, _nativeGeocoder, _network)
  }

  ngOnInit(): void {
    this.disconnectSubscription = this._network.onDisconnect().subscribe(() => {
      this.networkAvailable = false;
    });

    this.connectSubscription = this._network.onConnect().subscribe(() => {
      this.networkAvailable = true;
      this.loadParkings();
    });

    if ('parkingLocation' in this._route.snapshot.data) {
      const parkingLocations = this._route.snapshot.data['parkingLocation'];
      this.bicycleParkings = mapBicycleParkings(parkingLocations);
      this._titleService.setTitle('Bicycle Parkings');
      this.headerTitle = 'élos disponibles';
      this.letterStartTitle = 'V';
    }
  }

  ngOnDestroy(): void {
    this._unsubscribe.next();
    this._unsubscribe.complete();
    this.disconnectSubscription.unsubscribe();
    this.connectSubscription.unsubscribe();
  }

  ionViewWillEnter() {
    timer(0, 60000).pipe(
      tap(() => {
        this.loadParkings();
      }),
      takeUntil(this._unsubscribe)
    ).subscribe();
  }

  ionViewWillLeave() {
    this._unsubscribe.next();
    this._unsubscribe.complete();
  }

  loadParkings(): void {
    this._geolocation.getCurrentPosition(this.geolocationOptions).then(currentPosition => {
      this.parkings = [];
      if (currentPosition) {
        this.currentPosition = currentPosition;
        const parkings = this.bicycleParkings.map(val => {
          if (!val.id) return null;

          let parking: ParkingLocation = {
            id: val.id,
            name: val.name,
            availablePlaces: val.availablePlaces,
            address: val.address,
            position: val.position,
            computedDistance: Spherical.computeDistanceBetween(
              { lat: val.position.latitude, lng: val.position.longitude },
              { lat: currentPosition.coords.latitude, lng: currentPosition.coords.longitude }
            )
          };

          this.buildAddress(parking);

          return parking;
        });

        this.parkings = parkings.filter(p => p != null).sort((a, b) => a.computedDistance - b.computedDistance);
        return this.parkings;
      }
    }).catch(error => {
      this.handleError(error);
    });
  }
}
