import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx';
import { NativeGeocoder } from '@awesome-cordova-plugins/native-geocoder/ngx';
import { Network } from '@awesome-cordova-plugins/network/ngx';

import { from, Observable, Subject, throwError, timer } from 'rxjs';
import { catchError, map, switchMap, takeUntil, tap } from 'rxjs/operators';

import { ParkingLocation } from '@shared/entities';
import { ParkingService } from '@shared/services';
import { Spherical } from '@shared/utils';
import { ParkingBase } from '@shared/components';

@Component({
  selector: 'app-bicycle-parking',
  templateUrl: './bicycle-parking.component.html',
  styleUrls: [],
})
export class BicycleParkingComponent extends ParkingBase implements OnInit, AfterViewInit {

  private bicycleParkings: ParkingLocation[] = [];
  private _unsubscribe = new Subject<void>();
  parkings$: Observable<ParkingLocation[]>;
  headerTitle: string;
  timeoutID;

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
    if ('bycicleParkings' in this._route.snapshot.data) {
      this.bicycleParkings = this._route.snapshot.data['bycicleParkings'];
      this._titleService.setTitle('Bicycle Parkings');
      this.headerTitle = 'élos disponibles';
      this.letterStartTitle = 'V';
    }

    this.disconnectSubscription = this._network.onDisconnect().subscribe(() => {
      this.networkAvailable = false;
    });

    this.connectSubscription = this._network.onConnect().subscribe(() => {
      this.networkAvailable = true;
    });
  }

  ngAfterViewInit() {
    this.timeoutID = setTimeout(() => {
      for (let index = 0; index < this.bicycleParkings.length; index++) {
        const parking = this.bicycleParkings[index];
        this.buildAddress(parking);
      }
    }, 3000);
    
  }

  ngOnDestroy(): void {
    this._unsubscribe.next();
    this._unsubscribe.complete();
    this.disconnectSubscription.unsubscribe();
    this.connectSubscription.unsubscribe();
    clearTimeout(this.timeoutID);
  }

  ionViewWillEnter() {
    this.loadParkings();
  }

  ionViewWillLeave() {
    this._unsubscribe.next();
    this._unsubscribe.complete();
  }

  private buildParkings(currentPosition): ParkingLocation[] {
    this.currentPosition = currentPosition;

    const parkings = this.bicycleParkings
      .filter(p => p.id !== null && p.availablePlaces !== 0)
      .map(parking => {
        parking.computedDistance = Spherical.computeDistanceBetween(
          { lat: parking.position.latitude, lng: parking.position.longitude },
          { lat: currentPosition.coords.latitude, lng: currentPosition.coords.longitude }
        );
        parking.address = this.parkingAddress[parking.id]
        return parking;
      });

    return parkings;
  }

  private getParkings$(): Observable<ParkingLocation[]> {
    return from(this._geolocation.getCurrentPosition(this.geolocationOptions))
    .pipe(
      map(position => this.buildParkings(position).filter(p => p != null).sort((a, b) => a.computedDistance - b.computedDistance))
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
}
