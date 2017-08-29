import { IPullRequest } from '../models/IPullRequest';
import { Action } from '@ngrx/store';

export const INIT_GITHUB = "[Github] init";
export const FETCH_PULLREQUESTS_WITH_INVOLVEMENT = "[Github] Fetch pr:involvement";
export const FETCH_PULLREQUESTS_WITH_AUTHOR = "[Github] Fetch pr:author";

export const FETCH_PULLREQUESTS_WITH_INVOLVEMENT_COMPLETE = "[Github] Fetch pr:involvement - Complete";
export const FETCH_PULLREQUESTS_WITH_AUTHOR_COMPLETE = "[Github] Fetch pr:author - Complete";

export const FETCH_PULL_REQEUST_FOR_INVOLVED_DETAILS = '[Github] Fetch involved pr details';
export const FETCH_PULL_REQEUST_DETAILS_FOR_INVOLVED_COMPLETE = '[Github] Fetch involved pr details - Complete';

export const FETCH_PULL_REQEUST_FOR_AUTHOR_DETAILS = '[Github] Fetch author pr details';
export const FETCH_PULL_REQEUST_DETAILS_FOR_AUTHOR_COMPLETE = '[Github] Fetch author pr details - Complete';


export class InitGithubAction implements Action {
    readonly type = INIT_GITHUB;
}

export class FetchInvolvedPullRequests implements Action {
    readonly type = FETCH_PULLREQUESTS_WITH_INVOLVEMENT;
}
export class FetchAuthoredPullRequests implements Action {
    readonly type = FETCH_PULLREQUESTS_WITH_AUTHOR;
}

export class FetchAuthoredPullRequestsComplete implements Action {
    readonly type = FETCH_PULLREQUESTS_WITH_AUTHOR_COMPLETE;

    constructor(public pullRequests: IPullRequest[]) { }
}

export class FetchPullRequestForInvolvedDetails implements Action {
    readonly type = FETCH_PULL_REQEUST_FOR_INVOLVED_DETAILS;

    constructor(public url: string) { }
}

export class FetchPullRequestDetailsForAuthorComplete implements Action {
    readonly type = FETCH_PULL_REQEUST_DETAILS_FOR_AUTHOR_COMPLETE;

    constructor(public pullRequest: IPullRequest) { }
}


export class FetchPullRequestForAuthordDetails implements Action {
    readonly type = FETCH_PULL_REQEUST_FOR_AUTHOR_DETAILS;

    constructor(public url: string) { }
}

export class FetchPullRequestDetailsForInvolvedComplete implements Action {
    readonly type = FETCH_PULL_REQEUST_DETAILS_FOR_INVOLVED_COMPLETE;

    constructor(public pullRequest: IPullRequest) { }
}

export class FetchInvolvedPullRequestsComplete implements Action {
    readonly type = FETCH_PULLREQUESTS_WITH_INVOLVEMENT_COMPLETE;
    
    constructor(public pullRequests: IPullRequest[]) { }
}

export type Actions = 
        FetchPullRequestForInvolvedDetails | 
        FetchPullRequestDetailsForAuthorComplete |
        FetchPullRequestForAuthordDetails |
        FetchPullRequestDetailsForInvolvedComplete |
        FetchInvolvedPullRequests |
        FetchInvolvedPullRequestsComplete |
        FetchAuthoredPullRequests |
        FetchAuthoredPullRequestsComplete;