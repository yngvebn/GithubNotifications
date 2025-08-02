---
applyTo: "v2/**/*.ts,v2/**/*.js"
---

# Angular & TypeScript Development Standards

## Component Architecture
- **Standalone Components**: NO NgModules, use Angular 20+ patterns
- **Dependency Injection**: Use `inject()` function, not constructor injection
- **Component Structure**: Single responsibility, clear focused purpose
- **Template Logic**: Use Angular control flow (`@if`, `@for`) not structural directives

## TypeScript Standards
- **Reactive Patterns**: Signal-based reactivity (NO RxJS), async/await for Chrome APIs
- **Type Safety**: Always include TypeScript types and interfaces
- **Error Handling**: Try/catch with detailed logging, fallback to empty arrays
- **Chrome API Types**: Use `declare let chrome: any;` in TypeScript files

## Angular Signal Patterns
```typescript
// Signal-based state management
import { signal, computed, effect, resource } from '@angular/core';

@Component({
  selector: 'app-component',
  imports: [],
  templateUrl: './component.html',
  styleUrl: './component.css'
})
export class Component {
  // Use inject() for services
  private githubService = inject(GitHubService);

  // Writable signals for state
  private searchQuery = signal('');

  // Computed signals for derived state
  filteredResults = computed(() =>
    this.results().filter(item =>
      item.title.includes(this.searchQuery())
    )
  );

  // Resource for async data fetching
  pullRequests = resource({
    params: () => ({ query: this.searchQuery() }),
    loader: async ({ params, abortSignal }) => {
      return this.githubService.getPullRequests(params.query, abortSignal);
    }
  });

  // Effects for side effects
  private loggingEffect = effect(() => {
    console.log(`Found ${this.filteredResults().length} results`);
  });
}

## Chrome API Integration
```typescript
// Always check Chrome API availability
if (typeof chrome !== 'undefined' && chrome.storage) {
  // Chrome extension context
  await chrome.storage.local.get(['github_config']);
} else {
  // Development/testing context (use localStorage)
  localStorage.getItem('github_config');
}
```

## Signal-Based Service Patterns
```typescript
// Service with signal-based state
@Injectable({ providedIn: 'root' })
export class GitHubService {
  private http = inject(HttpClient);

  // Internal signal state
  private _config = signal<GitHubConfig | null>(null);
  private _pullRequests = signal<PullRequest[]>([]);

  // Public readonly signals
  readonly config = this._config.asReadonly();
  readonly pullRequests = this._pullRequests.asReadonly();

  // Computed signals for derived state
  readonly isConfigured = computed(() => this._config() !== null);
  readonly prCount = computed(() => this._pullRequests().length);

  // Resource for data fetching
  readonly pullRequestsResource = resource({
    params: () => this._config(),
    loader: async ({ params, abortSignal }) => {
      if (!params) return [];

      try {
        const response = await fetch(
          `https://api.github.com/search/issues?q=involves:${params.username}+state:open+type:pr`,
          {
            headers: { Authorization: `TOKEN ${params.token}` },
            signal: abortSignal
          }
        );

        if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);

        const data = await response.json();
        return data.items.map(this.mapToPullRequest);
      } catch (error) {
        console.error('❌ Failed to fetch PRs:', error);
        throw error;
      }
    }
  });

  // Methods to update state
  async saveConfig(config: GitHubConfig): Promise<void> {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.local.set({ github_config: config });
      } else {
        localStorage.setItem('github_config', JSON.stringify(config));
      }
      this._config.set(config);
    } catch (error) {
      console.error('❌ Failed to save config:', error);
      throw error;
    }
  }

  private mapToPullRequest = (item: any): PullRequest => ({
    id: item.id,
    title: item.title,
    number: item.number.toString(),
    createdAt: item.created_at,
    url: item.html_url,
    draft: item.draft || false,
    repository: {
      id: item.repository?.id || 0,
      name: item.repository?.name || 'Unknown'
    },
    openedBy: {
      name: item.user?.login || 'Unknown',
      avatar: item.user?.avatar_url || ''
    }
  });
}
```

## Component Integration Patterns
```typescript
@Component({
  selector: 'app-pull-requests',
  template: `
    @if (githubService.pullRequestsResource.isLoading()) {
      <div class="loading">Loading pull requests...</div>
    } @else if (githubService.pullRequestsResource.error()) {
      <div class="error">Error: {{ githubService.pullRequestsResource.error() }}</div>
    } @else if (githubService.pullRequestsResource.hasValue()) {
      <div class="pr-list">
        @for (pr of filteredPullRequests(); track pr.id) {
          <div class="pr-item" [class.draft]="pr.draft">
            <h3>{{ pr.title }}</h3>
            @if (pr.draft) {
              <span class="draft-badge">Draft</span>
            }
          </div>
        }
      </div>
    }
  `
})
export class PullRequestsComponent {
  githubService = inject(GitHubService);

  // Local component state
  searchTerm = signal('');
  selectedRepository = signal<string | null>(null);

  // Computed filtered results
  filteredPullRequests = computed(() => {
    const prs = this.githubService.pullRequestsResource.value() || [];
    const search = this.searchTerm().toLowerCase();
    const repo = this.selectedRepository();

    return prs.filter(pr => {
      const matchesSearch = !search || pr.title.toLowerCase().includes(search);
      const matchesRepo = !repo || pr.repository.name === repo;
      return matchesSearch && matchesRepo;
    });
  });

  // Repository options for filtering
  repositoryOptions = computed(() => {
    const prs = this.githubService.pullRequestsResource.value() || [];
    const repos = new Set(prs.map(pr => pr.repository.name));
    return Array.from(repos).sort();
  });

  // Effects for logging/analytics
  private analyticsEffect = effect(() => {
    const count = this.filteredPullRequests().length;
    console.log(`📊 Showing ${count} pull requests`);
  });

  // Event handlers
  onSearch(term: string): void {
    this.searchTerm.set(term);
  }

  onRepositorySelect(repo: string | null): void {
    this.selectedRepository.set(repo);
  }

  onRefresh(): void {
    this.githubService.pullRequestsResource.reload();
  }
}
```

## Signal Best Practices
- **NO RxJS**: Use signal-based patterns instead of observables
- **Resource API**: Use `resource()` for async data fetching
- **Computed Signals**: Derive state with `computed()` functions
- **Effects**: Use `effect()` for side effects, not subscriptions
- **Signal Updates**: Use `.set()` and `.update()` for state changes
- **AbortSignal**: Always handle cancellation in resource loaders
- **Error Handling**: Wrap resource loaders in try/catch blocks
- **Type Safety**: Define proper TypeScript interfaces for all signals

## Testing Signal-Based Code
```typescript
// Mock services should return signals
@Injectable()
export class MockGitHubService {
  readonly config = signal<GitHubConfig | null>(null);
  readonly pullRequests = signal<PullRequest[]>([]);
  readonly isConfigured = computed(() => this.config() !== null);

  readonly pullRequestsResource = {
    value: signal<PullRequest[]>([]),
    hasValue: () => true,
    isLoading: signal(false),
    error: signal(null),
    status: signal('resolved' as const),
    reload: vi.fn()
  };
}
```

## Migration from RxJS
- Replace `Observable<T>` with `Signal<T>`
- Replace `BehaviorSubject<T>` with `signal<T>(initialValue)`
- Replace `combineLatest()` with `computed()`
- Replace `map()` with `computed()`
- Replace `subscribe()` with `effect()`
- Replace `startWith()` with signal initial values
- Replace `switchMap()` with `resource()` for HTTP calls
- Use `untracked()` for non-reactive reads

## 📝 Maintenance Reminder
When adopting new Angular signal patterns, updating service architectures, or changing component patterns, update this instruction file to ensure Copilot understands the latest signal-based development standards and best practices.
