import { CommonModule } from '@angular/common';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { of } from 'rxjs';
import { expect } from 'storybook/test';

import { GitHubService } from '../../../shared/services/github.service';
import {
  emptyPullRequests,
  mockConfig,
  mockGitHubService,
  mockPullRequests,
  type PullRequest
} from '../../../shared/services/github.service.mock';
import { AppComponent } from './app.component';

const meta: Meta<AppComponent> = {
  component: AppComponent,
  decorators: [
    moduleMetadata({
      imports: [CommonModule],
      providers: [
        {
          provide: GitHubService,
          useValue: mockGitHubService
        }
      ]
    })
  ],
  parameters: {
    // Disable Chrome extension API warnings in Storybook
    docs: {
      description: {
        component: 'GitHub Notifications extension popup component that displays pull requests for a configured user.'
      }
    }
  }
};

export default meta;
type Story = StoryObj<AppComponent>;

// Story: Default state with pull requests
export const Default: Story = {
  name: 'Default - With Pull Requests',
  beforeEach: async () => {
    // Reset mocks
    mockGitHubService.getConfig.mockResolvedValue(mockConfig);
    mockGitHubService.getPullRequests.mockReturnValue(of(mockPullRequests));
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the default state with pull requests grouped by repository.'
      }
    }
  }
};

// Story: Loading state
export const Loading: Story = {
  name: 'Loading State',
  beforeEach: async () => {
    mockGitHubService.getConfig.mockResolvedValue(mockConfig);
    // Create a delayed observable to simulate loading
    mockGitHubService.getPullRequests.mockReturnValue(
      new Promise(resolve => setTimeout(() => resolve(of(mockPullRequests)), 2000)) as any
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the loading spinner while fetching pull requests.'
      }
    }
  }
};

// Story: No configuration
export const NoConfiguration: Story = {
  name: 'No Configuration',
  beforeEach: async () => {
    mockGitHubService.getConfig.mockResolvedValue(null);
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the state when no GitHub configuration is found.'
      }
    }
  }
};

// Story: Empty pull requests
export const EmptyPullRequests: Story = {
  name: 'No Pull Requests',
  beforeEach: async () => {
    mockGitHubService.getConfig.mockResolvedValue(mockConfig);
    mockGitHubService.getPullRequests.mockReturnValue(of(emptyPullRequests));
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the state when no open pull requests are found.'
      }
    }
  }
};

// Story: Error state
export const ErrorState: Story = {
  name: 'Error State',
  beforeEach: async () => {
    mockGitHubService.getConfig.mockRejectedValue(new Error('Failed to load configuration'));
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the error state when configuration fails to load.'
      }
    }
  }
};

// Story: Single repository
export const SingleRepository: Story = {
  name: 'Single Repository',
  beforeEach: async () => {
    const singleRepoPRs: PullRequest[] = [
      {
        id: 1,
        title: 'Add new feature to handle user authentication',
        number: '#123',
        createdAt: '2 days ago',
        url: 'https://github.com/testorg/single-repo/pull/123',
        draft: false,
        repository: {
          id: 1,
          name: 'single-repo'
        },
        openedBy: {
          name: 'johndoe',
          avatar: 'https://avatars.githubusercontent.com/u/1?v=4'
        }
      },
      {
        id: 2,
        title: 'Fix critical bug in payment processing',
        number: '#124',
        createdAt: '1 day ago',
        url: 'https://github.com/testorg/single-repo/pull/124',
        draft: true,
        repository: {
          id: 1,
          name: 'single-repo'
        },
        openedBy: {
          name: 'janedoe',
          avatar: 'https://avatars.githubusercontent.com/u/2?v=4'
        }
      }
    ];

    mockGitHubService.getConfig.mockResolvedValue(mockConfig);
    mockGitHubService.getPullRequests.mockReturnValue(of(singleRepoPRs));
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows pull requests from a single repository.'
      }
    }
  }
};

// Story: Many pull requests (stress test)
export const ManyPullRequests: Story = {
  name: 'Many Pull Requests',
  beforeEach: async () => {
    const manyPRs: PullRequest[] = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      title: `Pull request ${i + 1}: Feature implementation #${i + 1}`,
      number: `#${100 + i}`,
      createdAt: `${Math.floor(Math.random() * 7) + 1} days ago`,
      url: `https://github.com/testorg/repo${(i % 3) + 1}/pull/${100 + i}`,
      draft: i % 3 === 0, // Make every third PR a draft for variety
      repository: {
        id: (i % 3) + 1,
        name: `repo${(i % 3) + 1}`
      },
      openedBy: {
        name: `user${i + 1}`,
        avatar: `https://avatars.githubusercontent.com/u/${i + 1}?v=4`
      }
    }));

    mockGitHubService.getConfig.mockResolvedValue(mockConfig);
    mockGitHubService.getPullRequests.mockReturnValue(of(manyPRs));
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows many pull requests across multiple repositories to test performance and layout.'
      }
    }
  }
};

// Story: Draft Pull Requests
export const DraftPullRequests: Story = {
  name: 'Draft Pull Requests',
  beforeEach: async () => {
    const draftPRs: PullRequest[] = [
      {
        id: 1,
        title: 'Work in progress: New user dashboard',
        number: '#101',
        createdAt: '1 day ago',
        url: 'https://github.com/testorg/repo1/pull/101',
        draft: true,
        repository: {
          id: 1,
          name: 'repo1'
        },
        openedBy: {
          name: 'developer1',
          avatar: 'https://avatars.githubusercontent.com/u/10?v=4'
        }
      },
      {
        id: 2,
        title: 'Complete authentication system',
        number: '#102',
        createdAt: '2 days ago',
        url: 'https://github.com/testorg/repo1/pull/102',
        draft: false,
        repository: {
          id: 1,
          name: 'repo1'
        },
        openedBy: {
          name: 'developer2',
          avatar: 'https://avatars.githubusercontent.com/u/11?v=4'
        }
      },
      {
        id: 3,
        title: 'Draft: API refactoring',
        number: '#103',
        createdAt: '3 days ago',
        url: 'https://github.com/testorg/repo2/pull/103',
        draft: true,
        repository: {
          id: 2,
          name: 'repo2'
        },
        openedBy: {
          name: 'developer3',
          avatar: 'https://avatars.githubusercontent.com/u/12?v=4'
        }
      }
    ];

    mockGitHubService.getConfig.mockResolvedValue(mockConfig);
    mockGitHubService.getPullRequests.mockReturnValue(of(draftPRs));
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows a mix of draft and regular pull requests to demonstrate the draft indicator styling.'
      }
    }
  }
};

// Interactive story to test click functionality
export const InteractiveTest: Story = {
  name: 'Interactive Test',
  beforeEach: async () => {
    mockGitHubService.getConfig.mockResolvedValue(mockConfig);
    mockGitHubService.getPullRequests.mockReturnValue(of(mockPullRequests));
  },
  play: async ({ canvas, userEvent }) => {
    // Test that pull requests are rendered
    const pullRequestElements = canvas.getAllByText(/Add new feature|Fix bug|Update dependencies|Refactor component/);
    await expect(pullRequestElements.length).toBeGreaterThan(0);

    // Test repository grouping
    const repoHeaders = canvas.getAllByText(/repo[12]/);
    await expect(repoHeaders.length).toBe(2);

    // Test draft badge visibility
    const draftBadges = canvas.getAllByText('Draft');
    await expect(draftBadges.length).toBeGreaterThan(0);

    // Test options button functionality (note: won't actually open options in Storybook)
    const optionsButton = canvas.getByTitle('Options');
    await userEvent.click(optionsButton);
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive story that tests the component functionality and user interactions.'
      }
    }
  }
};
