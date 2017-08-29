import { ActionReducerMap, createSelector } from '@ngrx/store';
import * as fromStore from './store/reducer';

export interface RootState {
    main: fromStore.State
  }
  
  export const reducers: ActionReducerMap<RootState> = {
    main: fromStore.reducer
  }
  
  export const getMainState = (state: RootState) => state.main;
  
  export const getInvolvedInPullRequests = createSelector(getMainState, fromStore.getInvolvedInPullRequests);
  
  export const getAsAuthorPullRequests = createSelector(getMainState, fromStore.getAsAuthorPullRequests);
  