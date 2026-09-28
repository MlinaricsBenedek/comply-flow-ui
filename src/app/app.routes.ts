import { Routes } from '@angular/router';
import { ConversationPageComponent } from './conversation-page.component';
import { DetailsPageComponent } from './details-page.component';
import { HomePageComponent } from './home-page.component';

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'conversation/:id', component: ConversationPageComponent },
  { path: 'conversation', component: ConversationPageComponent },
  { path: 'details', component: DetailsPageComponent },
  { path: '**', redirectTo: '' },
];
