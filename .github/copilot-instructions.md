---
applyTo: "**"
---

# GitHub Copilot Instructions

## Project Overview
This is a GitHub Notifications Chrome Extension with dual architecture:
- **v1** (legacy): AngularJS-based extension in `/src` (Manifest V2, deprecated)
- **v2** (active): Angular 20-based extension in `/v2` (Manifest V3, current development)

**Focus on v2** - the active codebase using modern Angular and Manifest V3.

## Architecture Patterns

### Multi-Project Angular Workspace (`/v2`)
Two separate Angular applications in one workspace:
- `projects/main/` - Extension popup (main user interface)
- `projects/options/` - Configuration page for GitHub token setup
- `projects/shared/` - Shared services and interfaces

Both are **standalone Angular components** (no NgModules), using Angular 20+ patterns.

### Chrome Extension Structure
```
v2/
├── manifest.json           # Root manifest (copied to dist)
├── background.js          # Service worker (copied to dist)
├── package.json           # Root workspace dependencies
├── angular.json           # Angular workspace configuration
├── projects/
│   ├── main/              # Extension popup (main UI)
│   │   ├── src/app/       # Angular components, services
│   │   ├── src/assets/    # Icons (16px, 48px, 128px)
│   │   └── public/        # Static files
│   ├── options/           # Configuration page
│   │   ├── src/app/       # Angular components
│   │   └── src/options.html
│   └── shared/            # Shared services across projects
│       └── services/      # GitHubService, mocks, interfaces
└── dist/                  # Flattened build output (for Chrome)
```

### Build System (Critical Understanding)
The build process is **complex** and not standard Angular CLI:

1. **Two Angular builds**: `ng build main` + `ng build options`
2. **File flattening**: Angular outputs go to `dist/main/browser` and `dist/options/browser`
3. **Custom copy scripts**: Node.js scripts flatten the structure:
   - `dist/main/browser/index.html` → `dist/index.html` (popup)
   - `dist/options/browser/index.html` → `dist/options.html`
   - All other files copied to root `dist/`
4. **Asset copying**: Icons from `projects/main/src/assets` → `dist/assets`
5. **Cleanup**: Intermediate `dist/main` and `dist/options` folders removed

**Key Build Commands**:
- `npm run build:prod` - Full clean build (use for production)
- `npm run dev:main` - Development server for popup only
- `npm run dev:options` - Development server for options page only

### Data Flow & Communication

**GitHub API Integration**:
```typescript
// Pattern: GitHubService (projects/shared/services/github.service.ts)
// Uses Chrome storage for persistence, HTTP client for API calls
const config = await this.getConfig(); // Chrome storage
this.http.get(`https://api.github.com/search/issues?q=involves:${username}+state:open+type:pr`)
```

**Chrome Extension Communication**:
- **Storage**: `chrome.storage.local` for GitHub token/config persistence
- **Background-Popup**: `chrome.runtime.sendMessage()` for badge updates
- **Service Worker**: `background.js` handles periodic PR checks and badge updates

**State Management Pattern**:
- No NgRx/state management library
- Services handle state + Chrome storage persistence
- Components use async patterns with RxJS observables

## Core Interfaces & Types

### PullRequest Interface
```typescript
export interface PullRequest {
  id: number;
  title: string;
  number: string;
  createdAt: string;
  url: string;
  draft: boolean;        // Indicates if PR is a draft
  repository: {
    id: number;
    name: string;
  };
  openedBy: {
    name: string;
    avatar: string;
  };
}
```

### GitHubConfig Interface
```typescript
export interface GitHubConfig {
  username: string;
  token: string; // GitHub Personal Access Token
}
```

## Service Patterns

### GitHubService (`projects/shared/services/github.service.ts`)
- **Chrome Storage Operations**: `getConfig()`, `saveConfig()`
- **GitHub API Integration**: `getPullRequests()`, `getUserInfo()`
- **Error Handling**: Extensive console logging with emoji prefixes (🔧 🌐 📥 ✅ ❌ 📝)
- **Response Mapping**: Maps GitHub API to internal `PullRequest` interface
- **Draft Support**: Handles `draft` property from GitHub API responses

### Mock Service (`projects/shared/services/github.service.mock.ts`)
- **Storybook Integration**: Provides test data for component stories
- **Test Scenarios**: Mix of draft/regular PRs, different repositories
- **Vitest Mocking**: Uses `fn()` from 'storybook/test'

## UI Components & Styling

### Main App Component (`projects/main/src/app/`)
- **Template**: `app.component.html` - displays grouped PRs by repository
- **Styles**: `app.component.css` - GitHub-like styling with draft indicators
- **Logic**: `app.component.ts` - handles PR fetching, grouping, navigation

### Draft PR Support
- **Badge**: "Draft" badge in PR title with subtle styling
- **Visual Distinction**: Muted colors, left border for draft PRs
- **CSS Classes**: `.draft-badge`, `.pull-request-draft`
- **Template Logic**: `@if (pr.draft)` conditional rendering

### Options Component (`projects/options/src/app/`)
- **Purpose**: GitHub token configuration
- **Standalone**: Separate Angular app for extension options page

## Development Workflow Specifics

**Local Development**:
```bash
cd v2
npm run dev:main     # Popup at http://localhost:4200
npm run dev:options  # Options at http://localhost:4201 (different port)
```

**Extension Testing**:
1. `npm run build:prod`
2. Load `v2/dist` folder in `chrome://extensions`
3. **Critical**: The built extension requires GitHub Personal Access Token via options page

**Chrome APIs Usage**:
- Manifest V3 patterns throughout
- `chrome.action` (NOT `chrome.browserAction`)
- Service Worker background script (NOT background page)
- Requires `declare let chrome: any;` in TypeScript files

### Key Integration Points

**GitHub Service** (`projects/shared/services/github.service.ts`):
- Handles Chrome storage get/set operations
- Maps GitHub API responses to internal PR interface
- Extensive console logging for debugging (search for emoji prefixes 🔧 🌐 📥 ✅ ❌ 📝)

**Background Script** (`background.js`):
- Plain JavaScript (not Angular)
- Handles badge color logic: Green(1-3), Orange(4-8), Red(9+) PRs
- 1-minute periodic refresh cycle
- Communicates with popup via `chrome.runtime.onMessage`

**Chrome Storage Schema**:
```javascript
// Key: 'github_config'
{
  username: string,
  token: string // GitHub Personal Access Token
}
```

## Testing & Quality Assurance

### Storybook Development
- **Stories**: `app.component.stories.ts` with comprehensive scenarios
- **Mock Data**: Various PR states including drafts
- **Interactive Tests**: Automated UI testing with user events
- **Draft Scenarios**: Specific stories showcasing draft PR functionality

### Console Logging Strategy
- **Emoji Prefixes**: 🔧 (config), 🌐 (API), 📥 (data), ✅ (success), ❌ (error), 📝 (draft)
- **Detailed Logging**: All API calls, storage operations, error conditions
- **Debug-Friendly**: Clear context and data in all log messages

### Error Handling Patterns
- **API Failures**: Log and return empty arrays (graceful degradation)
- **Chrome API**: Check availability before use, fallback to localStorage
- **User Feedback**: Clear error messages in UI for configuration issues

## Project-Specific Conventions

### File Naming & Structure
- Angular components use standard patterns (`app.component.ts`)
- Service worker is plain `background.js` (not TypeScript)
- Manifest and assets at v2 root level (not in Angular projects)
- Shared services in `projects/shared/services/`

### Coding Standards
- **TypeScript**: Standalone components, NO NgModules
- **Dependency Injection**: Use `inject()` function, not constructor injection
- **Async Patterns**: RxJS observables, async/await for Chrome APIs
- **Chrome API Checks**: Always verify Chrome API availability

### Chrome Extension Patterns
```typescript
// Chrome API availability check
if (typeof chrome !== 'undefined' && chrome.storage) {
  // Chrome extension context
} else {
  // Development/testing context (use localStorage)
}
```

### Component Structure
- **Single Responsibility**: Each component has clear, focused purpose
- **Template Logic**: Use Angular control flow (`@if`, `@for`)
- **Styling**: Component-scoped CSS, GitHub-inspired design system

## Testing
- Standard Angular testing setup but **no extension-specific tests**
- Manual testing by loading in Chrome required for Chrome APIs
- Storybook for component development and visual testing
- Mock services for development and testing scenarios

## Automated Publishing
- **GitHub Actions** workflows:
  - `.github/workflows/build-and-publish.yml` - Automated build with build number versioning
  - `.github/workflows/release.yml` - Manual release workflow with version bumping
- Publishing process uses OAuth2 credentials (NOT service account)
- **Version Strategy**: Build number used as patch version (e.g., 2.1.{BUILD_NUMBER})

### Versioning Strategy
**Automatic Patch Versioning**:
- Every CI build automatically sets patch version to GitHub Actions run number
- Example: Build #123 creates version 2.1.123
- No manual patch version management needed

**Manual Major/Minor Versioning**:
```bash
cd v2
npm run version:minor    # 2.1.123 -> 2.2.0 (next build will be 2.2.{BUILD_NUM})
npm run version:major    # 2.1.123 -> 3.0.0 (next build will be 3.0.{BUILD_NUM})
npm run version          # Show current version
```

**Local Scripts**:
```bash
cd scripts
node bump-version-manual.js minor --git   # Bump minor and commit
node bump-version-manual.js major --git   # Bump major and commit
node bump-version-build.js 123           # Set patch to specific build number
```

### Release Workflow
**Automatic Publishing**:
1. Push to master branch
2. GitHub Actions automatically:
   - Sets patch version to build number
   - Builds extension
   - Publishes to Chrome Web Store

**Manual Version Bumps**:
1. Run `npm run version:minor` or `npm run version:major`
2. Commit and push changes
3. Next CI build will use new major.minor with automatic patch number

## GitHub API Integration Details

### API Endpoints
- **Search**: `https://api.github.com/search/issues?q=involves:{username}+state:open+type:pr`
- **PR Details**: `{pull_request.url}` from search results for detailed information
- **Authentication**: `Authorization: TOKEN {token}` header format

### Response Mapping
- **Time Calculation**: Converts GitHub timestamps to human-readable format
- **Draft Detection**: Extracts `draft` boolean from PR response
- **Fallback Handling**: Graceful degradation when detailed PR fetch fails

## Migration Context
- This codebase migrated from v1 (AngularJS) to v2 (Angular 20)
- Manifest V2 → V3 migration completed
- Legacy v1 code in `/src` should not be modified
- Modern Angular patterns: standalone components, inject() DI, control flow syntax

---

**Key Reminders for Development**:
1. **Always work in `/v2` directory** - never modify `/src` (legacy)
2. **Build system is custom** - understand the flattening process
3. **Chrome Extension + Angular** - consider both paradigms
4. **Mock services** must be updated when interfaces change
5. **Storybook stories** should reflect all UI states including drafts
6. **Console logging** with emoji prefixes for debugging
7. **Chrome API checks** required for cross-environment compatibility
