import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { ToastController } from '@ionic/angular';

import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx';
import { NativeGeocoder } from '@awesome-cordova-plugins/native-geocoder/ngx';
import { Network } from '@awesome-cordova-plugins/network/ngx';

import { from, Observable, Subject, throwError, timer } from 'rxjs';
import { catchError, concatMap, map, switchMap, takeUntil, tap } from 'rxjs/operators';

import { ParkingBase } from '@shared/components';
import { ParkingLocation } from '@shared/entities';
import { ParkingService } from '@shared/services';
import { Spherical } from '@shared/utils';

@Component({
  selector: 'app-car-parking',
  templateUrl: 'car-parking.component.html',
  styleUrls: [],
})
export class CarParkingComponent extends ParkingBase implements OnInit, OnDestroy {
  private parkingLocations: ParkingLocation[] = [];
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
    });

    if ('parkingLocation' in this._route.snapshot.data) {
      this.parkingLocations = this._route.snapshot.data['parkingLocation'];
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
    this.currentPosition = currentPosition;
    return this._parkingService.readParkingStatus()
    .pipe(
      map(parkingStatuses => { 
        return parkingStatuses
        .filter(p => p.id !== null)
        .map(p => {
          const parkingLocation = this.findParking(p.id);
          parkingLocation.availablePlaces = p.availablePlaces;
          parkingLocation.computedDistance = Spherical.computeDistanceBetween(
            { lat: parkingLocation.position.latitude, lng: parkingLocation.position.longitude },
            { lat: currentPosition.coords.latitude, lng: currentPosition.coords.longitude }
          );
          return parkingLocation;
        });
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
        return throwError(error);
      })
    );
  }

  findParking(parkingId: string | number): ParkingLocation {
    return this.parkingLocations.find(val => val.id === parkingId);
  }
}
