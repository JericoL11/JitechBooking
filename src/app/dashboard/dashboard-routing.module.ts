import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { BookingComponent } from './booking/booking.component';

const routes: Routes = [
  {
    path:'', component:DashboardComponent,
    children: [
    {
        path: 'timekeeping',
        loadChildren: () => import('./timekeeping/timekeeping.module').then(m => m.TimekeepingModule)
    },
    {
      path: 'booking',
      component:BookingComponent
    },
  ]
  } 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
