import { Routes } from '@angular/router';
import { DetailsPageComponent } from './details-page.component';
import { HomePageComponent } from './home-page.component';

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'details', component: DetailsPageComponent },
  { path: '**', redirectTo: '' },
];
