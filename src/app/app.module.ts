import { HttpClientModule } from '@angular/common/http';
import { environment } from '../environments/environment';
import { GithubService } from './github.service';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
export const GITHUB_TOKEN = 'GITHUB_TOKEN';
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule
  ],
  providers: [
    GithubService,
    { provide: GITHUB_TOKEN, useValue: environment.githubToken }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
