import { of } from 'rxjs';
import { fn } from 'storybook/test';

// Import the original service for types
import type { GitHubConfig, PullRequest } from './github.service';
import * as actual from './github.service';

// Mock data for stories
export const mockConfig: GitHubConfig = {
  username: 'testuser',
  token: 'mock-token'
};

export const mockPullRequests: PullRequest[] = [
  {
    id: 1,
    title: 'Add new feature to handle user authentication',
    number: '#123',
    createdAt: '2 days ago',
    url: 'https://github.com/testorg/repo1/pull/123',
    draft: false,
    repository: {
      id: 1,
      name: 'repo1'
    },
    openedBy: {
      name: 'johndoe',
      avatar: 'https://avatars.githubusercontent.com/u/1?v=4'
    }
  },
  {
    id: 2,
    title: 'Fix bug in notification system',
    number: '#124',
    createdAt: '1 day ago',
    url: 'https://github.com/testorg/repo1/pull/124',
    draft: true,
    repository: {
      id: 1,
      name: 'repo1'
    },
    openedBy: {
      name: 'janedoe',
      avatar: 'https://avatars.githubusercontent.com/u/2?v=4'
    }
  },
  {
    id: 3,
    title: 'Update dependencies and security patches',
    number: '#45',
    createdAt: '3 days ago',
    url: 'https://github.com/testorg/repo2/pull/45',
    draft: false,
    repository: {
      id: 2,
      name: 'repo2'
    },
    openedBy: {
      name: 'bobsmith',
      avatar: 'https://avatars.githubusercontent.com/u/3?v=4'
    }
  },
  {
    id: 4,
    title: 'Refactor component architecture',
    number: '#67',
    createdAt: '1 week ago',
    url: 'https://github.com/testorg/repo2/pull/67',
    draft: true,
    repository: {
      id: 2,
      name: 'repo2'
    },
    openedBy: {
      name: 'alicejohnson',
      avatar: 'https://avatars.githubusercontent.com/u/4?v=4'
    }
  }
];

export const emptyPullRequests: PullRequest[] = [];

// Create mock class that implements the same interface as GitHubService
export class MockGitHubService {
  getConfig = fn(actual.GitHubService.prototype.getConfig).mockName('getConfig');
  saveConfig = fn(actual.GitHubService.prototype.saveConfig).mockName('saveConfig');
  getPullRequests = fn(actual.GitHubService.prototype.getPullRequests).mockName('getPullRequests');
  getUserInfo = fn(actual.GitHubService.prototype.getUserInfo).mockName('getUserInfo');

  constructor() {
    // Set default return values
    this.getConfig.mockResolvedValue(mockConfig);
    this.saveConfig.mockResolvedValue(undefined);
    this.getPullRequests.mockReturnValue(of(mockPullRequests));
    this.getUserInfo.mockResolvedValue({ login: 'testuser', name: 'Test User' });
  }
}

// Export the mock instance
export const mockGitHubService = new MockGitHubService();

// Re-export types for convenience
export type { GitHubConfig, PullRequest };
