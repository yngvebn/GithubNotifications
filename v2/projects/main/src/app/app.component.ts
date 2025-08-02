
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { GitHubConfig, GitHubService, PullRequest } from '@shared/services';
import { Subject, takeUntil, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';

// Chrome API availability check
declare let chrome: any;

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private githubService = inject(GitHubService);

  config: GitHubConfig | null = null;
  pullRequests: PullRequest[] = [];
  groupedPullRequests: { [key: string]: PullRequest[] } = {};
  loading = true;
  error: string | null = null;

  async ngOnInit() {
    console.log('🚀 AppComponent: Initializing...');
    await this.loadConfig();
    if (this.config) {
      console.log('✅ AppComponent: Config loaded, starting PR fetch', this.config);
      this.loadPullRequests();
      this.startPeriodicRefresh();
    } else {
      console.warn('⚠️ AppComponent: No config found, stopping here');
      this.loading = false;
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async loadConfig() {
    console.log('🔧 AppComponent: Loading config...');
    try {
      this.config = await this.githubService.getConfig();
      console.log('✅ AppComponent: Config loaded successfully:', this.config ? 'Config found' : 'No config');
    } catch (error) {
      console.error('❌ AppComponent: Error loading config:', error);
      this.error = 'Failed to load configuration';
    }
  }

  private loadPullRequests() {
    if (!this.config) {
      console.warn('⚠️ AppComponent: No config available, cannot load PRs');
      return;
    }

    console.log('📥 AppComponent: Starting to load pull requests...');
    this.loading = true;
    this.error = null;

    this.githubService.getPullRequests(this.config)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: async (pullRequests) => {
          console.log('📋 AppComponent: Received pull requests from service:', pullRequests.length, 'items');
          console.log('📋 AppComponent: Raw pull requests:', pullRequests);

          // Process each pull request to get detailed information
          const processedPRs: PullRequest[] = [];
          for (const pr of pullRequests) {
            try {
              const detailedPR = await this.processPullRequest(pr);
              processedPRs.push(detailedPR);
            } catch (error) {
              console.error('❌ AppComponent: Error processing PR:', error);
              processedPRs.push(pr); // Use basic PR data if detailed processing fails
            }
          }

          console.log('✅ AppComponent: Processed pull requests:', processedPRs.length, 'items');
          this.pullRequests = processedPRs;
          this.groupPullRequests();
          console.log('📊 AppComponent: Grouped pull requests:', this.groupedPullRequests);
          this.loading = false;
        },
        error: (error) => {
          console.error('❌ AppComponent: Error loading pull requests:', error);
          this.error = 'Failed to load pull requests';
          this.loading = false;
        }
      });
  }

  private async processPullRequest(pr: PullRequest): Promise<PullRequest> {
    // The GitHub service already processes the PR details
    return pr;
  }

  private groupPullRequests() {
    console.log('📊 AppComponent: Grouping pull requests...');
    this.groupedPullRequests = this.pullRequests.reduce((groups, pr) => {
      const repoName = pr.repository.name;
      if (!groups[repoName]) {
        groups[repoName] = [];
      }
      groups[repoName].push(pr);
      return groups;
    }, {} as { [key: string]: PullRequest[] });
    console.log('📊 AppComponent: Grouped result:', this.groupedPullRequests);
  }

  private startPeriodicRefresh() {
    // Refresh every minute
    timer(60000, 60000)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => {
          if (this.config) {
            return this.githubService.getPullRequests(this.config);
          }
          return [];
        })
      )
      .subscribe({
        next: async (pullRequests) => {
          // Process pull requests
          const processedPRs: PullRequest[] = [];
          for (const pr of pullRequests) {
            try {
              const detailedPR = await this.processPullRequest(pr);
              processedPRs.push(detailedPR);
            } catch (error) {
              console.error('Error processing PR:', error);
              processedPRs.push(pr);
            }
          }

          this.pullRequests = processedPRs;
          this.groupPullRequests();
        },
        error: (error) => {
          console.error('Error during periodic refresh:', error);
        }
      });
  }

  openPullRequest(pr: PullRequest) {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url: pr.url });
    } else {
      window.open(pr.url, '_blank');
    }
  }

  openOptions() {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.openOptionsPage();
    }
  }

  getRepositoryNames(): string[] {
    return Object.keys(this.groupedPullRequests);
  }
}
