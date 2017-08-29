import { IPullRequest } from './models/IPullRequest';
import { Observable } from 'rxjs/Rx';
import { ConfigService } from './config.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class GithubService {
  constructor(public http: HttpClient, public configService: ConfigService) {

  }

  public getInvolvedPullRequests(): Observable<IPullRequest[]> {
    const involvedInUrl = `https://api.github.com/search/issues?q=involves:${this.configService.getUsername()}+state:open+type:pr`;
    return this.http.get<{ items: IPullRequest[] }>(involvedInUrl).map(resp => resp.items);
  }

  public getPullRequestDetails(url: string): Observable<IPullRequest> {
    return this.http.get<IPullRequest>(url);
  }
}
