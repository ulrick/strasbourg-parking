import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TabsRoutingModule } from './tabs-routing.module';

import { TabsComponent } from './tabs.component';
import { BicycleParkingModule } from '../bicycle-parking/bicycle-parking.module';
import { CarParkingModule } from '../car-parking/car-parking.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    TabsRoutingModule,
  ],
  declarations: [
    TabsComponent,
  ]
})
export class TabsModule {}
