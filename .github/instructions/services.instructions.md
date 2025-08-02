---
applyTo: "v2/projects/shared/services/**/*.ts"
---

# Service Layer Standards

## GitHubService Pattern (Signal-Based)
Located in `projects/shared/services/github.service.ts`

### Signal-Based Architecture
- **NO RxJS**: Use signal-based patterns instead of observables
- **Internal State**: Private writable signals for state management
- **Public APIs**: Readonly signals and resource objects
- **Async Operations**: Use `resource()` for data fetching

### Core Signal Methods
- `config: Signal<GitHubConfig | null>`: Readonly signal for current config
- `isConfigured: Signal<boolean>`: Computed signal for config state
- `pullRequestsResource: Resource<PullRequest[]>`: Resource for PR data
- `saveConfig(config)`: Method to update config signal and storage
- `getUserInfo(token)`: Resource-based user validation

### Error Handling & Logging
- **Console Logging**: Use emoji prefixes for debugging
  - 🔧 (config operations)
  - 🌐 (API calls)
  - 📥 (data processing)
  - ✅ (success)
  - ❌ (error)
  - 📝 (draft PR detection)
- **API Failures**: Log errors and throw for resource error handling
- **Chrome Storage**: Always check availability, fallback to localStorage

### Signal-Based Service Structure
```typescript
@Injectable({ providedIn: 'root' })
export class GitHubService {
  private http = inject(HttpClient);

  // Private writable signals
  private _config = signal<GitHubConfig | null>(null);

  // Public readonly signals
  readonly config = this._config.asReadonly();
  readonly isConfigured = computed(() => this._config() !== null);

  // Resource for PR fetching
  readonly pullRequestsResource = resource({
    params: () => this._config(),
    loader: async ({ params, abortSignal }) => {
      if (!params) return [];

      console.log('🌐 Fetching PRs for:', params.username);

      try {
        const response = await fetch(
          `https://api.github.com/search/issues?q=involves:${params.username}+state:open+type:pr`,
          {
            headers: { 'Authorization': `TOKEN ${params.token}` },
            signal: abortSignal
          }
        );

        if (!response.ok) {
          throw new Error(`GitHub API error: ${response.status}`);
        }

        const data = await response.json();
        console.log(`📥 Received ${data.items.length} PRs`);

        return data.items.map(this.mapToPullRequest);
      } catch (error) {
        console.error('❌ Failed to fetch PRs:', error);
        throw error;
      }
    }
  });

  // Config management methods
  async saveConfig(config: GitHubConfig): Promise<void> {
    console.log('🔧 Saving GitHub config');

    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.local.set({ github_config: config });
      } else {
        localStorage.setItem('github_config', JSON.stringify(config));
      }

      this._config.set(config);
      console.log('✅ Config saved successfully');
    } catch (error) {
      console.error('❌ Failed to save config:', error);
      throw error;
    }
  }

  async loadConfig(): Promise<void> {
    console.log('🔧 Loading GitHub config');

    try {
      let config: GitHubConfig | null = null;

      if (typeof chrome !== 'undefined' && chrome.storage) {
        const result = await chrome.storage.local.get(['github_config']);
        config = result.github_config || null;
      } else {
        const stored = localStorage.getItem('github_config');
        config = stored ? JSON.parse(stored) : null;
      }

      this._config.set(config);
      console.log('✅ Config loaded:', config ? 'configured' : 'not configured');
    } catch (error) {
      console.error('❌ Failed to load config:', error);
      this._config.set(null);
    }
  }

  private mapToPullRequest = (item: any): PullRequest => ({
    id: item.id,
    title: item.title,
    number: `#${item.number}`,
    createdAt: this.formatTimeAgo(item.created_at),
    url: item.html_url,
    draft: item.draft || false, // Draft support
    repository: {
      id: item.repository?.id || 0,
      name: item.repository?.name || 'Unknown'
    },
    openedBy: {
      name: item.user?.login || 'Unknown',
      avatar: item.user?.avatar_url || ''
    }
  });
```

## Mock Service Pattern (Signal-Based)
Located in `projects/shared/services/github.service.mock.ts`

### Signal-Based Mock Structure
```typescript
@Injectable()
export class MockGitHubService implements GitHubService {
  // Mock signals that match the real service
  private _config = signal<GitHubConfig | null>({
    username: 'testuser',
    token: 'mock-token'
  });

  readonly config = this._config.asReadonly();
  readonly isConfigured = computed(() => this._config() !== null);

  // Mock resource with static data
  readonly pullRequestsResource = {
    value: signal<PullRequest[]>([
      {
        id: 1,
        title: 'Add new feature',
        number: '#123',
        createdAt: '2 hours ago',
        url: 'https://github.com/test/repo/pull/123',
        draft: false,
        repository: { id: 1, name: 'test-repo' },
        openedBy: { name: 'testuser', avatar: 'avatar.jpg' }
      },
      {
        id: 2,
        title: 'Draft: Work in progress',
        number: '#124',
        createdAt: '1 day ago',
        url: 'https://github.com/test/repo/pull/124',
        draft: true, // Mock draft PR
        repository: { id: 1, name: 'test-repo' },
        openedBy: { name: 'testuser', avatar: 'avatar.jpg' }
      }
    ]),
    hasValue: () => true,
    isLoading: signal(false),
    error: signal(null),
    status: signal('resolved' as const),
    reload: vi.fn()
  };

  // Mock methods
  async saveConfig(config: GitHubConfig): Promise<void> {
    this._config.set(config);
  }

  async loadConfig(): Promise<void> {
    // Mock already has config loaded
  }
}
```

### Mock Data Requirements
- **Mixed Draft States**: Include both draft and regular PRs
- **Realistic Scenarios**: Various repositories, timeframes, users
- **Signal Compliance**: All mock data must use signal patterns
- **Vitest Integration**: Use `vi.fn()` for method mocks

## 📝 Maintenance Reminder
When adding new service methods, API endpoints, or data mapping patterns, update this instruction file to ensure Copilot understands the latest signal-based service layer standards.
```

## Mock Service Pattern
Located in `projects/shared/services/github.service.mock.ts`

- **Storybook Integration**: Provide realistic test data
- **Draft PR Scenarios**: Include mix of draft and regular PRs
- **Repository Variety**: Multiple repos for testing grouping
- **Vitest Mocking**: Use `fn()` from 'storybook/test'

### Mock Data Standards
```typescript
// Always include draft property in mock PRs
{
  id: 1,
  title: 'Feature implementation',
  draft: false, // or true for draft PRs
  // ... other properties
}
```

---

## 📝 Maintenance Reminder
When adding new service methods, API endpoints, or data mapping patterns, update this instruction file to ensure Copilot understands the latest service layer standards.
