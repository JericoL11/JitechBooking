import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { BookingComponent } from './booking/booking.component';
import { DashboardLandingComponent } from './dashboard-landing/dashboard-landing.component';
import { RoomComponent } from './room/room.component';
import { BookingdashboardComponent } from './bookingdashboard/bookingdashboard.component';

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
        path: 'room',
        component: RoomComponent
      },

      {
        path: 'bookingdashboard',
        component:BookingdashboardComponent
      },
      {
        path: 'timekeeping',
        loadChildren: () => import('./timekeeping/timekeeping.module').then(m => m.TimekeepingModule)
      }
    ]
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
