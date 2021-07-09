import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';

import { Observable, of as observableOf } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ParkingService } from '../services';

/** Gets a bicycle parkings and redirects to the 404 page if it does not exist. */
@Injectable({ providedIn: 'root' })
export class BicycleParkingResolve implements Resolve<any> {
    constructor(
        private _router: Router,
        private _parkingService: ParkingService,
    ) { }

    resolve(route: ActivatedRouteSnapshot): Observable<any> {
        return this._parkingService.readBicycleParking()
            .pipe(catchError(() => {
                this._router.navigateByUrl('404', { skipLocationChange: true });
                return observableOf(null);
            }));
    }
}
