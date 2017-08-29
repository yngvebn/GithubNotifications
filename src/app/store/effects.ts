import * as fromActions from './actions';
import { Injectable } from '@angular/core';
import { GithubService } from '../github.service';
import { Actions, Effect } from '@ngrx/effects';

@Injectable()
export class Effects {

    @Effect()
    initInvolvedIn$ = this.actions$
        .ofType(fromActions.INIT_GITHUB)
        .map(() => new fromActions.FetchInvolvedPullRequests());

    @Effect()
    fetchInvolved$ = this.actions$
        .ofType(fromActions.FETCH_PULLREQUESTS_WITH_INVOLVEMENT)
        .mergeMap(() => this.githubService
            .getInvolvedPullRequests()
            .mergeMap(resp => resp.map(pr => new fromActions.FetchPullRequestForInvolvedDetails(pr.pull_request.url))));

    @Effect()
    fetchDetails$ = this.actions$
        .ofType(fromActions.FETCH_PULL_REQEUST_FOR_INVOLVED_DETAILS)
        .mergeMap((action: fromActions.FetchPullRequestForInvolvedDetails) => 
                    this.githubService.getPullRequestDetails(action.url)
                            .map(resp => new fromActions.FetchPullRequestDetailsForInvolvedComplete(resp))
);
    
    constructor(public actions$: Actions, public githubService: GithubService) {

    }
}