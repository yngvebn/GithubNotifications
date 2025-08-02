---
applyTo: "v2/projects/shared/**/*.ts"
---

# Data Models & Interfaces

## Core Interfaces

### PullRequest Interface
```typescript
export interface PullRequest {
  id: number;
  title: string;
  number: string;           // Format: "#123"
  createdAt: string;        // Human-readable: "2 days ago"
  url: string;              // GitHub HTML URL
  draft: boolean;           // NEW: Draft PR indicator
  repository: {
    id: number;
    name: string;           // Repository name only
  };
  openedBy: {
    name: string;           // GitHub username
    avatar: string;         // Avatar URL
  };
}
```

### GitHubConfig Interface
```typescript
export interface GitHubConfig {
  username: string;         // GitHub username
  token: string;           // Personal Access Token
}
```

## Data Mapping Patterns

### GitHub API Response Mapping
```typescript
// Map GitHub API response to internal PullRequest interface
const mappedPR: PullRequest = {
  id: prResponse.id,
  title: prResponse.title,
  number: `#${prResponse.number}`,
  createdAt: calculateTimeAgo(prResponse.created_at),
  url: prResponse.html_url,
  draft: prResponse.draft || false,  // Handle draft property
  repository: {
    id: prResponse.head.repo.id,
    name: prResponse.head.repo.name
  },
  openedBy: {
    name: prResponse.user.login,
    avatar: prResponse.user.avatar_url
  }
};
```

### Time Calculation
Convert GitHub timestamps to human-readable format:
- "1 day ago", "3 days ago"
- "1 week ago", "2 weeks ago"
- "1 month ago", "3 months ago"

## Interface Evolution
When adding new properties to interfaces:
1. **Update Core Interface**: Add property with appropriate type
2. **Update Service Mapping**: Extract property from GitHub API response
3. **Update Mock Data**: Add property to all mock objects
4. **Update UI Components**: Handle new property in templates
5. **Update Stories**: Reflect new property in Storybook scenarios

## GitHub API Integration
- **Search Endpoint**: `/search/issues?q=involves:{username}+state:open+type:pr`
- **PR Details**: Use `pull_request.url` from search results for detailed info
- **Authentication**: `Authorization: TOKEN {token}` header format
- **Rate Limiting**: Handle API rate limits gracefully
- **Error Responses**: Always provide fallback data structures

---

## 📝 Maintenance Reminder
When modifying interfaces, adding new data fields, or changing API mapping patterns, update this instruction file to keep Copilot's understanding of the data model current.
