import { Routes } from '@angular/router';
import { ConfigurationPageComponent } from './configuration-page.component';
import { ConversationPageComponent } from './conversation-page.component';
import { CreateConfigurationPageComponent } from './create-configuration-page.component';
import { DetailsPageComponent } from './details-page.component';
import { HomePageComponent } from './home-page.component';

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'conversation/:id', component: ConversationPageComponent },
  { path: 'conversation', component: ConversationPageComponent },
  { path: 'details/:conversationId/:messageId', component: DetailsPageComponent },
  { path: 'details', component: DetailsPageComponent },
  { path: 'configurations/create', component: CreateConfigurationPageComponent },
  { path: 'configurations', component: ConfigurationPageComponent },
  { path: 'configurations/:id', component: ConfigurationPageComponent },
  { path: '**', redirectTo: '' },
];
