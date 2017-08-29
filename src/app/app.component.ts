import { environment } from './../environments/environment';
import { GITHUB_TOKEN } from './app.module';
import { Component, Inject } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor( ) {

  }
  title = 'app';
}
