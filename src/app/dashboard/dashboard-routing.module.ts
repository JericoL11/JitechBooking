import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { BookingComponent } from './booking/booking.component';

const routes: Routes = [
  {
    path:'', component:DashboardComponent,
    children: [
    // {
    //   path: 'dashboard',component:DashboardComponent, 
    //   // redirectTo: 'dashboard',  //program start
    //   // pathMatch: 'full'
    // },
    
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
