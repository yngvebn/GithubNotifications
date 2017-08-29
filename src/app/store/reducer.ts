import { createSelector } from '@ngrx/store';
import { IPullRequest } from '../models/IPullRequest';
import * as fromActions from './actions';

export interface State {
    involvedIn: string[];
    asAuthor: string[];
    pullRequests: IPullRequest[];
    entities: {
        [id: string]: IPullRequest
    }
}

export const initialState: State = {
    involvedIn: [],
    asAuthor: [],
    pullRequests: [],
    entities: {}
}

export function reducer(state: State = initialState, action: fromActions.Actions): State {
    switch (action.type) {
        case (fromActions.FETCH_PULL_REQEUST_DETAILS_FOR_INVOLVED_COMPLETE): {
            console.log(action.pullRequest);
            const prs = state.pullRequests.filter(pr => `${pr.id}` !== `${action.pullRequest.id}`);
            const pullRequests = [...prs, action.pullRequest];
            const involvedIn = [...state.involvedIn.filter(i => i !== action.pullRequest.id), action.pullRequest.id]
            const entities = pullRequests.reduce((entities: { [id: string]: IPullRequest }, pr) => {
                return Object.assign({}, entities, { [pr.id]: pr });
            }, {});
            return {
                ...state,
                pullRequests: [...prs, action.pullRequest],
                involvedIn,
                entities
            }
        }
        case (fromActions.FETCH_PULL_REQEUST_DETAILS_FOR_AUTHOR_COMPLETE): {
            console.log(action.pullRequest);
            const prs = state.pullRequests.filter(pr => `${pr.id}` !== `${action.pullRequest.id}`);
            const pullRequests = [...prs, action.pullRequest];
            const asAuthor = [...state.asAuthor.filter(i => i !== action.pullRequest.id), action.pullRequest.id];
            const entities = pullRequests.reduce((entities: { [id: string]: IPullRequest }, pr) => {
                return Object.assign({}, entities, { [pr.id]: pr });
            }, {});
            return {
                ...state,
                pullRequests: [...prs, action.pullRequest],
                asAuthor,
                entities
            }
        }
        default:
            return state;
    }
}

export const getPullRequestsInvolvedIn = (state: State) => state.involvedIn;
export const getPullRequestsAsAuthor = (state: State) => state.asAuthor;
export const getEntities = (state: State) => state.entities;

export const getInvolvedInPullRequests = createSelector(getPullRequestsInvolvedIn, getEntities, (ids, entities) => {
    return ids.map(id => entities[id]);
});

export const getAsAuthorPullRequests = createSelector(getPullRequestsAsAuthor, getEntities, (ids, entities) => {
    return ids.map(id => entities[id]);
});