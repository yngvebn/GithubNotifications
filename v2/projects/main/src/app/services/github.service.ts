import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

// Chrome API availability check
declare let chrome: any;

export interface GitHubConfig {
  username: string;
  token: string;
}

export interface PullRequest {
  id: number;
  title: string;
  number: string;
  createdAt: string;
  url: string;
  repository: {
    id: number;
    name: string;
  };
  openedBy: {
    name: string;
    avatar: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class GitHubService {
  private http = inject(HttpClient);

  async getConfig(): Promise<GitHubConfig | null> {
    console.log('🔧 GitHubService: Getting config from Chrome storage...');
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        console.log('✅ GitHubService: Chrome storage available');
        const result = await chrome.storage.local.get(['github_config']);
        console.log('📥 GitHubService: Raw storage result:', result);
        const config = result.github_config || null;
        console.log('✅ GitHubService: Parsed config:', config ? 'Config found' : 'No config found');
        return config;
      } else {
        console.warn('⚠️ GitHubService: Chrome storage not available');
        return null;
      }
    } catch (error) {
      console.error('❌ GitHubService: Error getting config:', error);
      return null;
    }
  }

  async saveConfig(config: GitHubConfig): Promise<void> {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.local.set({ github_config: config });
        // Notify background script that config was updated
        if (chrome.runtime) {
          chrome.runtime.sendMessage({ type: 'CONFIG_UPDATED' });
        }
      }
    } catch (error) {
      console.error('Error saving config:', error);
      throw error;
    }
  }

  getPullRequests(config: GitHubConfig): Observable<PullRequest[]> {
    console.log('🌐 GitHubService: Starting to fetch pull requests for user:', config.username);
    const url = `https://api.github.com/search/issues?q=involves:${config.username}+state:open+type:pr`;
    console.log('🌐 GitHubService: API URL:', url);

    const headers = new HttpHeaders({
      'Authorization': `TOKEN ${config.token}`
    });
    console.log('🔑 GitHubService: Using token:', config.token ? 'Token provided' : 'No token');

    return this.http.get<any>(url, { headers }).pipe(
      map(response => {
        console.log('📥 GitHubService: Raw API response:', response);
        const items = response.items || [];
        console.log('📋 GitHubService: Found items:', items.length);
        return items;
      }),
      map(items => {
        console.log('🔄 GitHubService: Mapping items to PullRequest objects...');
        const mapped = items.map((item: any) => this.mapToPullRequest(item));
        console.log('✅ GitHubService: Mapped pull requests:', mapped.length);
        return mapped;
      }),
      catchError(error => {
        console.error('❌ GitHubService: Error fetching pull requests:', error);
        console.error('❌ GitHubService: Error details:', error.status, error.statusText, error.error);
        return of([]);
      })
    );
  }

  async getUserInfo(token: string): Promise<any> {
    const headers = new HttpHeaders({
      'Authorization': `TOKEN ${token}`
    });

    return this.http.get('https://api.github.com/user', { headers }).toPromise();
  }

  private async mapToPullRequest(item: any): Promise<PullRequest> {
    console.log('🔄 GitHubService: Mapping PR item:', item.title, '#' + item.number);
    try {
      const headers = new HttpHeaders({
        'Authorization': `TOKEN ${(await this.getConfig())?.token}`
      });

      console.log('🌐 GitHubService: Fetching detailed PR info from:', item.pull_request?.url);
      const prResponse = await this.http.get<any>(item.pull_request.url, { headers }).toPromise();

      if (!prResponse) {
        throw new Error('Failed to fetch PR details');
      }

      console.log('✅ GitHubService: Got detailed PR info for:', prResponse.title);

      const createdAt = new Date(prResponse.created_at);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - createdAt.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let timeAgo: string;
      if (diffDays === 1) {
        timeAgo = '1 day ago';
      } else if (diffDays < 7) {
        timeAgo = `${diffDays} days ago`;
      } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        timeAgo = weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
      } else {
        const months = Math.floor(diffDays / 30);
        timeAgo = months === 1 ? '1 month ago' : `${months} months ago`;
      }

      const mappedPR = {
        id: prResponse.id,
        title: prResponse.title,
        number: `#${prResponse.number}`,
        createdAt: timeAgo,
        url: prResponse.html_url,
        repository: {
          id: prResponse.head.repo.id,
          name: prResponse.head.repo.name
        },
        openedBy: {
          name: prResponse.user.login,
          avatar: prResponse.user.avatar_url
        }
      };

      console.log('✅ GitHubService: Successfully mapped PR:', mappedPR);
      return mappedPR;
    } catch (error) {
      console.error('❌ GitHubService: Error mapping pull request:', error);
      console.log('🔄 GitHubService: Falling back to basic PR data for:', item.title);
      // Return minimal PR data if detailed fetch fails
      const fallbackPR = {
        id: item.id,
        title: item.title,
        number: `#${item.number}`,
        createdAt: 'unknown',
        url: item.html_url,
        repository: {
          id: 0,
          name: 'Unknown'
        },
        openedBy: {
          name: item.user?.login || 'Unknown',
          avatar: item.user?.avatar_url || ''
        }
      };
      console.log('⚠️ GitHubService: Using fallback PR data:', fallbackPR);
      return fallbackPR;
    }
  }
}
