import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
 
import { DashboardComponent }   from './dashboard/dashboard.component';
import { TestComponent }   from './test/test.component';
 
const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard',  component: DashboardComponent },
  { path: 'test', component: TestComponent }
];
 
@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}