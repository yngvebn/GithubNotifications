---
applyTo: "v2/package.json,v2/angular.json,v2/scripts/**"
---

# Build System & Development Workflow

## Custom Build Process
**IMPORTANT**: The build system is complex and NOT standard Angular CLI

### Build Flow
1. **Two Angular builds**: `ng build main` + `ng build options`
2. **File flattening**: Custom Node.js scripts flatten Angular outputs
3. **Asset copying**: Icons and static files moved to correct locations
4. **Structure transformation**:
   - `dist/main/browser/index.html` → `dist/index.html` (popup)
   - `dist/options/browser/index.html` → `dist/options.html`
   - All JS/CSS files flattened to root `dist/`
5. **Cleanup**: Remove intermediate Angular build folders

### Key Commands
```bash
# Development
npm run dev:main       # Popup dev server (http://localhost:4200)
npm run dev:options    # Options dev server (http://localhost:4201)

# Production
npm run build:prod     # Full clean production build for Chrome

# Testing
npm run storybook      # Component development
npm run test           # Angular unit tests
```

## Project Structure
```
v2/
├── manifest.json           # Chrome extension manifest (copied to dist)
├── background.js          # Service worker (copied to dist)
├── package.json           # Root workspace dependencies
├── angular.json           # Angular workspace configuration
├── projects/
│   ├── main/              # Extension popup Angular app
│   ├── options/           # Options page Angular app
│   └── shared/            # Shared services and interfaces
└── dist/                  # Final Chrome extension output
```

## Development Workflow
1. **Start Development**: `npm run dev:main` or `npm run dev:options`
2. **Component Development**: Use Storybook for isolated component work
3. **Chrome Testing**: Build and load `v2/dist` in `chrome://extensions`
4. **Production Build**: `npm run build:prod` before deployment

## File Locations
- **Services**: `projects/shared/services/` (shared across apps)
- **Components**: `projects/main/src/app/` and `projects/options/src/app/`
- **Assets**: `projects/main/src/assets/` (icons: 16px, 48px, 128px)
- **Static Files**: `projects/*/public/` directories
- **Build Scripts**: Custom Node.js scripts handle file flattening
