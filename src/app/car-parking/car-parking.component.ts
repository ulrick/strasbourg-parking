import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Geolocation, GeolocationOptions } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder, NativeGeocoderResult } from '@ionic-native/native-geocoder/ngx';

import { Subject, timer } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { ParkingBase } from '@shared/components';
import { ParkingLocation } from '@shared/entities';
import { ParkingService } from '@shared/services';
import { Spherical } from '@shared/utils';
import { mapParkingLocation, mapParkingStatus } from '@shared/utils/mapper';
import { Network } from '@ionic-native/network/ngx';

@Component({
  selector: 'app-car-parking',
  templateUrl: 'car-parking.component.html',
  styleUrls: ['car-parking.component.scss'],
})
export class CarParkingComponent extends ParkingBase implements OnInit, OnDestroy {
  private parkingStatuses: ParkingLocation[] = [];
  private parkingLocations: ParkingLocation[] = [];
  parkings: ParkingLocation[] = [];
  headerTitle: string;
  
  private _unsubscribe = new Subject<void>();

  constructor(
    protected _parkingService: ParkingService,
    protected _route: ActivatedRoute,
    protected _titleService: Title,
    public _toastController: ToastController,
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
      this.parkingLocations = mapParkingLocation(parkingLocations);
      this._titleService.setTitle('Opened Car Parkings');

      this.headerTitle = 'arkings ouverts';
      this.letterStartTitle = 'P';
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

  protected loadParkings(): void {
    this._geolocation.getCurrentPosition(this.geolocationOptions).then(currentPosition => {
      this.parkings = [];
      if (currentPosition) {
        // this.presentToast('test');
        this.currentPosition = currentPosition;
        this._parkingService.readParkingStatus().subscribe(val => {
          this.parkingStatuses = mapParkingStatus(val);

          const parkings = this.parkingStatuses.map(val => {
            if (!val.id) return null;

            const parkingLocation = this.findParking(val.id);

            if (parkingLocation) {
              let parking: ParkingLocation = {
                id: val.id,
                name: val.name,
                availablePlaces: val.availablePlaces,
                address: parkingLocation.address,
                position: parkingLocation.position,
                computedDistance: Spherical.computeDistanceBetween(
                  { lat: parkingLocation.position.latitude, lng: parkingLocation.position.longitude },
                  { lat: currentPosition.coords.latitude, lng: currentPosition.coords.longitude }
                )
              };

              this.buildAddress(parking)

              return parking;
            }
          });

          this.parkings = parkings.filter(p => p != null).sort((a, b) => a.computedDistance - b.computedDistance);
          return this.parkings;
        })
      }
    }).catch(error => {
      this.handleError(error);
    });
  }

  findParking(parkingId: string | number): ParkingLocation {
    return this.parkingLocations.find(val => val.id === parkingId);
  }
}
