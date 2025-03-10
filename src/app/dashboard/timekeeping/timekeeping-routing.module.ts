import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TimekeepingComponent } from './timekeeping.component';
import { ScheduleComponent } from './schedule/schedule.component';
import { WorkingSchedComponent } from './working-sched/working-sched.component';

const routes: Routes = [
  {
    path: '', component:TimekeepingComponent,   //landing page
    children: [
    {
      path:'schedule', component:ScheduleComponent
    },
    {
      path:'workingsched', component:WorkingSchedComponent
    }
  ] 
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TimekeepingRoutingModule { }
