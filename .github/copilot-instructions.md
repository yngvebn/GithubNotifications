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

Both are **standalone Angular components** (no NgModules), using Angular 20+ patterns.

### Chrome Extension Structure
```
v2/
├── manifest.json           # Root manifest (copied to dist)
├── background.js          # Service worker (copied to dist)
├── projects/main/         # Popup Angular app
├── projects/options/      # Options Angular app
└── dist/                  # Flattened build output
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
// Pattern: GitHubService (projects/main/src/app/services/github.service.ts)
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

### Development Workflow Specifics

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

**GitHub Service** (`projects/main/src/app/services/github.service.ts`):
- Handles Chrome storage get/set operations
- Maps GitHub API responses to internal PR interface
- Extensive console logging for debugging (search for emoji prefixes 🔧 🌐 📥)

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

## Project-Specific Conventions

### File Naming & Structure
- Angular components use standard patterns (`app.component.ts`)
- Service worker is plain `background.js` (not TypeScript)
- Manifest and assets at v2 root level (not in Angular projects)

### Error Handling
- Extensive console logging with emoji prefixes for debugging
- GitHub API errors fall back to empty arrays
- Chrome API availability checks: `typeof chrome !== 'undefined' && chrome.storage`

### Testing
- Standard Angular testing setup but **no extension-specific tests**
- Manual testing by loading in Chrome required for Chrome APIs

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

## Migration Context
- This codebase migrated from v1 (AngularJS) to v2 (Angular 20)
- Manifest V2 → V3 migration completed
- Legacy v1 code in `/src` should not be modified
