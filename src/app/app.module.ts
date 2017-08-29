import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { InitGithubAction } from './store/actions';
import { ConfigService } from './config.service';
import { AuthorizationInterceptor } from './authorizationInterceptor.service';
import { Effects } from './store/effects';
import { EffectsModule } from '@ngrx/effects';
import * as fromStore from './store/reducer';
import { ActionReducerMap, Store, createSelector, StoreModule } from '@ngrx/store';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { environment } from '../environments/environment';
import { GithubService } from './github.service';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { MdListModule, MdIconModule, MdCardModule } from '@angular/material';
import { AppComponent } from './app.component';
import { PullRequestsComponent } from './pull-requests/pull-requests.component';
export const GITHUB_TOKEN = 'GITHUB_TOKEN';
import * as fromRoot from './app.store';

@NgModule({
  declarations: [
    AppComponent,
    PullRequestsComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    StoreModule.forRoot(fromRoot.reducers, {}),
    EffectsModule.forRoot([Effects]),
    StoreDevtoolsModule.instrument(),
    MdListModule,
    MdIconModule,
    MdCardModule
  ],
  providers: [
    GithubService,
    { provide: GITHUB_TOKEN, useValue: environment.githubToken },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthorizationInterceptor,
      multi: true,
    },
    ConfigService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {

  constructor(store: Store<fromRoot.RootState>) {
    store.dispatch(new InitGithubAction())
  }
}
