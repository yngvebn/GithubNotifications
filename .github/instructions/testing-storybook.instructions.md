---
applyTo: "v2/**/*.spec.ts,v2/**/*.stories.ts,v2/**/*.mock.ts"
---

# Testing & Storybook Standards

## Storybook Development
Located in `projects/main/src/app/app.component.stories.ts`

### Story Categories
- **Default**: Standard PR scenarios with mixed draft/regular PRs
- **Loading**: Show loading spinner states
- **Empty**: No PRs found scenarios
- **Error**: API failure and configuration error states
- **Draft Focus**: Specific stories showcasing draft PR functionality
- **Repository Variants**: Single repo vs multiple repos
- **Stress Testing**: Many PRs for performance testing

### Mock Data Requirements
- **Draft Property**: All mock PRs must include `draft: boolean`
- **Repository Variety**: Multiple repositories for grouping tests
- **PR States**: Mix of draft and regular PRs in realistic scenarios
- **Edge Cases**: Empty states, API failures, malformed data

```typescript
// Example story with draft PRs
const draftPRs: PullRequest[] = [
  {
    id: 1,
    title: 'Work in progress: New feature',
    draft: true, // Always include draft property
    // ... other properties
  },
  {
    id: 2,
    title: 'Complete feature implementation',
    draft: false,
    // ... other properties
  }
];
```

### Interactive Testing
- **UI Elements**: Test that draft badges are rendered
- **Repository Grouping**: Verify repo headers appear correctly
- **Navigation**: Test PR click functionality (limited in Storybook)
- **Options Integration**: Test options button behavior
- **Signal State**: Test component reactivity to signal changes

### Signal-Based Story Structure
```typescript
import type { Meta, StoryObj } from '@storybook/angular';
import { signal } from '@angular/core';
import { AppComponent } from './app.component';
import { MockGitHubService } from '../../../shared/services/github.service.mock';

const meta: Meta<AppComponent> = {
  title: 'Main/AppComponent',
  component: AppComponent,
  providers: [
    { provide: GitHubService, useClass: MockGitHubService }
  ]
};

// Story with reactive mock service
export const WithDraftPRs: StoryObj<AppComponent> = {
  play: async ({ canvasElement }) => {
    // Test signal-based interactions
    const canvas = within(canvasElement);

    // Verify draft badges are rendered
    const draftBadges = canvas.getAllByText('Draft');
    expect(draftBadges).toHaveLength(2);

    // Test repository grouping
    const repoHeaders = canvas.getAllByRole('heading');
    expect(repoHeaders.length).toBeGreaterThan(0);
  }
};
```

## Mock Service Updates (Signal-Based)
When updating `PullRequest` interface:
1. **Update Mock Signals**: Add new properties to all mock signal data
2. **Update Resource Mocks**: Ensure resource objects have proper signals
3. **Update Stories**: Ensure all stories reflect new interface with signals
4. **Test Scenarios**: Add stories for new signal-based functionality
5. **Validation**: Verify no TypeScript errors in signal-based stories

### Signal Mock Pattern
```typescript
@Injectable()
export class MockGitHubService {
  // Signal-based mocks that match real service
  private _config = signal<GitHubConfig | null>({
    username: 'testuser',
    token: 'test-token'
  });

  readonly config = this._config.asReadonly();
  readonly isConfigured = computed(() => this._config() !== null);

  readonly pullRequestsResource = {
    value: signal<PullRequest[]>([
      // Mock data with signal updates
    ]),
    hasValue: () => true,
    isLoading: signal(false),
    error: signal(null),
    status: signal('resolved' as const),
    reload: vi.fn()
  };
}
```

## Testing Signal Components
- **Component Testing**: Use Angular Testing Library for signal components
- **Signal Assertions**: Test signal values and computed signals
- **Effect Testing**: Verify effects run correctly with signal changes
- **Resource Testing**: Mock resource states (loading, error, success)
- **User Interactions**: Test signal updates from user actions

## Angular Testing (Limited)
- **Standard Setup**: Angular testing but no Chrome extension APIs
- **Manual Testing**: Chrome extension loading required for full testing
- **Component Logic**: Test Angular-specific functionality only
- **Service Mocking**: Use mock services for unit tests

## Console Logging for Testing
Use emoji prefixes for debug visibility:
- 🔧 Configuration operations
- 🌐 API calls and responses
- 📥 Data processing and mapping
- ✅ Successful operations
- ❌ Errors and failures
- 📝 Draft PR detection and handling

---

## 📝 Maintenance Reminder
When adding new Storybook stories, test scenarios, or mock data patterns, update this instruction file to ensure Copilot knows about the latest testing standards and practices.
