import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsComponent } from './tabs.component';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsComponent,
    children: [
      {
        path: 'car-parking',
        loadChildren: () => import('../car-parking/car-parking.module').then( m => m.CarParkingModule)
      },
      {
        path: 'bicycle-parking',
        loadChildren: () => import('../bicycle-parking/bicycle-parking.module').then(m => m.BicycleParkingModule)
      },
      {
        path: '',
        redirectTo: 'car-parking',
        pathMatch: 'full'
      },
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/car-parking',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsRoutingModule {}
