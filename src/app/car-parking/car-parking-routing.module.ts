import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ParkingResolve } from '@shared/resolvers';
import { CarParkingComponent } from './car-parking.component';

const routes: Routes = [
  {
    path: '',
    component: CarParkingComponent,
    resolve: {
      parkingLocation: ParkingResolve
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CarParkingRoutingModule {}
