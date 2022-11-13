import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BicycleParkingResolve } from '@shared/resolvers';
import { BicycleParkingComponent } from './bicycle-parking.component';

const routes: Routes = [
  {
    path: '',
    component: BicycleParkingComponent,
    resolve: {
      bycicleParkings: BicycleParkingResolve
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BicycleParkingRoutingModule { }
