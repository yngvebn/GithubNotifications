import { IPullRequest } from '../models/IPullRequest';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-pull-requests',
  templateUrl: './pull-requests.component.html',
  styleUrls: ['./pull-requests.component.scss']
})
export class PullRequestsComponent implements OnInit {
  @Input() pullRequests: IPullRequest[]
  
  constructor() { }

  ngOnInit() {
  }

}
