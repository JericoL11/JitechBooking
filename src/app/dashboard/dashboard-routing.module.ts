import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { BookingComponent } from './booking/booking.component';
import { DashboardLandingComponent } from './dashboard-landing/dashboard-landing.component';
import { BookingdashboardComponent } from './bookingdashboard/bookingdashboard.component';
import { BookingRoomsComponent } from './booking-rooms/booking-rooms.component';

const routes: Routes = [
  {
    path: '', 
    component: DashboardComponent,
    children: [
      {
        path: '', // empty path loads the l
        // anding component directly
        component: DashboardLandingComponent,
      },
      {
        path: 'booking',
        component: BookingComponent
      },
      {
        path: 'booking-rooms',
        component: BookingRoomsComponent
      },
      {
        path: 'maintenance',
        loadChildren: () => import('./maintenance/maintenance-routing.module').then(m => m.MaintenanceRoutingModule)
      },
    ]
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
