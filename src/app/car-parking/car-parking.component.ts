import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder } from '@ionic-native/native-geocoder/ngx';

import { from, Observable, Subject, timer } from 'rxjs';
import { catchError, concatMap, map, switchMap, takeUntil, tap } from 'rxjs/operators';

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
  private parkingLocations: ParkingLocation[] = [];
  parkings: ParkingLocation[] = [];
  parkings$: Observable<ParkingLocation[]>;
  headerTitle: string;
  
  private _unsubscribe = new Subject<void>();

  constructor(
    protected _parkingService: ParkingService,
    protected _route: ActivatedRoute,
    protected _titleService: Title,
    public _toastController: ToastController,
    protected _geolocation: Geolocation,
    protected _nativeGeocoder: NativeGeocoder,
    protected _network: Network,
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
    this.loadParkings();
  }

  ionViewWillLeave() {
    this._unsubscribe.next();
    this._unsubscribe.complete();
  }

  private buildParkings$(currentPosition): Observable<ParkingLocation[]> {
    return this._parkingService.readParkingStatus()
    .pipe(
      map(parkingStatuses => { 
        const parkings = mapParkingStatus(parkingStatuses)
        .filter(p => p.id !== null )
        .map(p => {
          const parkingLocation = this.findParking(p.id);
          parkingLocation.availablePlaces = p.availablePlaces;
          parkingLocation.computedDistance = Spherical.computeDistanceBetween(
            { lat: parkingLocation.position.latitude, lng: parkingLocation.position.longitude },
            { lat: currentPosition.coords.latitude, lng: currentPosition.coords.longitude }
          )
          return parkingLocation;   
        });
        return parkings;
      })
    );
  }

  private getParkings$(): Observable<ParkingLocation[]> {
    return from(this._geolocation.getCurrentPosition(this.geolocationOptions))
    .pipe(
      concatMap(currentPosition => this.buildParkings$(currentPosition)),
      map(val => val.filter(p => p != null).sort((a, b) => a.computedDistance - b.computedDistance))
    );
  }

  protected loadParkings(): void {
    this.parkings$ = timer(0, 60000).pipe(
      switchMap(() => {
        return this.getParkings$();
      }),
      takeUntil(this._unsubscribe),
      catchError(error => {
        this.handleError(error);
        throw new Error(error);
      })
    );
  }

  findParking(parkingId: string | number): ParkingLocation {
    return this.parkingLocations.find(val => val.id === parkingId);
  }
}
