import { Injectable } from '@angular/core';
import { IConfig } from './models/IConfig';

@Injectable()
export class ConfigService {

  constructor() { }
  public getAuthHeader() {
    return `TOKEN ${this.getConfigObject().token}`;
  }

  public getUsername() {
    return this.getConfigObject().username;
  }

  private getConfigObject(): IConfig {
    var config = localStorage.getItem('_github_pullrequests');
    if (!config) {
      return {
        username: 'yngvebn',
        token: '65ad8e02ccbcc2615fbbf5fa4dbf7e8aadf3c74c '
      }
    }
    return (<IConfig>JSON.parse(config));
  }

}
