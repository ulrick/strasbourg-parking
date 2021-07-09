import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BicycleParkingRoutingModule } from './bicycle-parking-routing.module';
import { BicycleParkingComponent } from './bicycle-parking.component';
import { SharedModule } from '@shared/shared.module';
import { IonicModule } from '@ionic/angular';


@NgModule({
  declarations: [BicycleParkingComponent],
  imports: [
    CommonModule,
    SharedModule,
    IonicModule,
    BicycleParkingRoutingModule
  ]
})
export class BicycleParkingModule { }
