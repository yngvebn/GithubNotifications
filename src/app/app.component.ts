import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Rx';
import { IPullRequest } from './models/IPullRequest';
import { environment } from './../environments/environment';
import { GITHUB_TOKEN } from './app.module';
import { Component, Inject } from '@angular/core';
import * as fromRoot from './app.store';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  public repositories: string[];
  public pullRequests$: Observable<IPullRequest[]>;

  constructor(store: Store<fromRoot.RootState>) {
    this.pullRequests$ = store.select(fromRoot.getInvolvedInPullRequests).map(prs => prs.sort((a, b) => a.number > b.number ? 1 : a.number < b.number ? -1 : 0));
  }
  title = 'app';
}
