import { IPullRequest } from './models/IPullRequest';
import { environment } from './../environments/environment';
import { GITHUB_TOKEN } from './app.module';
import { Component, Inject } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  public repositories: string[];
  public pullRequests: { [repository: string]: IPullRequest[] };

  constructor( ) {

  }
  title = 'app';
}
