import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CarParkingComponent } from './car-parking.component';

import { CarParkingRoutingModule } from './car-parking-routing.module';
import { SharedModule } from '@shared/shared.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    IonicModule,
    CarParkingRoutingModule
  ],
  declarations: [
    CarParkingComponent
  ]
})
export class CarParkingModule {}
