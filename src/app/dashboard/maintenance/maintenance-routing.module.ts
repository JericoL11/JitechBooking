import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MaintenanceComponent } from './maintenance.component';
import { RoomComponent } from './room/room.component';
import { FoodsComponent } from './foods/foods.component';
import { MaintenanceLandingComponent } from './maintenance-landing/maintenance-landing.component';
import { RoomCategoryComponent } from './room-category/room-category.component';

const routes: Routes = [
  {
    path: '',
    component: MaintenanceComponent,
    children: [
      {
        path: '',
        component: MaintenanceLandingComponent
      },
      {
        path: 'room',
        component: RoomComponent
      },
      {
        path: 'foods',
        component: FoodsComponent
      },
      {
        path: 'roomcategory',
        component:RoomCategoryComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MaintenanceRoutingModule { }
