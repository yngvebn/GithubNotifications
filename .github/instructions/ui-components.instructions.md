---
applyTo: "v2/projects/main/src/app/**/*.{html,css,ts}"
---

# UI Components & Styling Standards

## Main App Component Structure
Located in `projects/main/src/app/`

### Template Patterns (`app.component.html`)
- **Repository Grouping**: Display PRs grouped by repository name
- **Draft Indicators**: Show "Draft" badge for draft PRs
- **Conditional Rendering**: Use `@if (pr.draft)` for draft-specific elements
- **PR Navigation**: Click handlers to open PRs in new tabs

### Draft PR Support
```html
<!-- Draft PR template pattern -->
<div class="pr-title">
  {{ pr.title }}
  @if (pr.draft) {
    <span class="draft-badge">Draft</span>
  }
</div>
```

### Styling Standards (`app.component.css`)
- **GitHub-like Design**: Follow GitHub's visual patterns
- **Component-scoped CSS**: All styles scoped to component
- **Draft PR Styling**:
  - `.draft-badge`: Small, subtle badge styling
  - `.pull-request-draft`: Muted colors, left border indicator
  - Different hover states for draft vs regular PRs

### CSS Classes for Draft PRs
```css
.draft-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 6px;
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: #f6f8fa;
  color: #656d76;
  border: 1px solid #d1d9e0;
  border-radius: 12px;
  flex-shrink: 0;
}

.pull-request-draft {
  background: #fafbfc;
  border-left: 3px solid #d1d9e0;
}

.pull-request-draft .pr-title {
  color: #656d76;
}
```

## Component Logic (`app.component.ts`)
- **Signal-Based State**: Use signals instead of observables
- **Dependency Injection**: Use `inject()` function for services
- **Resource Integration**: Access data through service resources
- **Computed Properties**: Use `computed()` for derived state
- **Effects**: Use `effect()` for side effects

### Signal-Based Component Pattern
```typescript
@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  private githubService = inject(GitHubService);

  // Access service signals directly
  pullRequests = this.githubService.pullRequestsResource;
  isConfigured = this.githubService.isConfigured;

  // Local component state
  selectedRepository = signal<string | null>(null);

  // Computed properties for UI logic
  groupedPullRequests = computed(() => {
    const prs = this.pullRequests.value() || [];
    const selectedRepo = this.selectedRepository();

    if (selectedRepo) {
      return { [selectedRepo]: prs.filter(pr => pr.repository.name === selectedRepo) };
    }

    return prs.reduce((groups, pr) => {
      const repoName = pr.repository.name;
      if (!groups[repoName]) groups[repoName] = [];
      groups[repoName].push(pr);
      return groups;
    }, {} as Record<string, PullRequest[]>);
  });

  repositoryNames = computed(() => {
    const prs = this.pullRequests.value() || [];
    return [...new Set(prs.map(pr => pr.repository.name))].sort();
  });

  // Effects for side effects
  private badgeUpdateEffect = effect(() => {
    const count = (this.pullRequests.value() || []).length;
    this.updateBadge(count);
  });

  // Event handlers
  onPullRequestClick(pr: PullRequest): void {
    window.open(pr.url, '_blank');
  }

  onRepositoryFilter(repoName: string | null): void {
    this.selectedRepository.set(repoName);
  }

  onRefresh(): void {
    this.pullRequests.reload();
  }

  private updateBadge(count: number): void {
    if (typeof chrome !== 'undefined' && chrome.action) {
      chrome.action.setBadgeText({ text: count > 0 ? count.toString() : '' });
      chrome.action.setBadgeBackgroundColor({
        color: count <= 3 ? '#28a745' : count <= 8 ? '#ffc107' : '#dc3545'
      });
    }
  }
}
```

## Options Component (`projects/options/src/app/`)
- **Token Configuration**: GitHub Personal Access Token input
- **Validation**: Verify token with GitHub API
- **Separate Angular App**: Standalone application for extension options

---

## 📝 Maintenance Reminder
When adding new UI features, CSS classes, or component patterns, update this instruction file to keep Copilot informed of the latest UI standards and patterns.
