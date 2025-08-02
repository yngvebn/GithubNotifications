---
applyTo: "**"
---

# GitHub Notifications Chrome Extension - Project Overview

## Project Architecture
This is a **GitHub Notifications Chrome Extension** with dual architecture:
- **v1 (Legacy)**: AngularJS-based extension in `/src` (Manifest V2, deprecated, DO NOT MODIFY)
- **v2 (Active)**: Angular 20-based extension in `/v2` (Manifest V3, current development)

**ALWAYS focus on v2** - the active codebase using modern Angular and Manifest V3.

## Key Technologies
- **Angular 20** with standalone components (NO NgModules)
- **TypeScript** throughout (except background.js)
- **Chrome Extension Manifest V3** APIs
- **RxJS** for async operations and state management
- **Chrome Storage API** for persistence
- **GitHub REST API** integration
- **Storybook** for component development

## Migration Context
- **Legacy v1**: AngularJS/Manifest V2 in `/src` (DO NOT MODIFY)
- **Current v2**: Angular 20/Manifest V3 in `/v2` (ACTIVE DEVELOPMENT)
- **API Evolution**: GitHub API integration patterns evolved from v1 to v2
- **Chrome API**: Migrated from Manifest V2 to V3 patterns

## Key Reminders
1. **Always work in `/v2` directory** - never modify `/src` (legacy)
2. **Build system is custom** - understand the flattening process
3. **Chrome Extension + Angular** - consider both paradigms
4. **Mock services** must be updated when interfaces change
5. **Console logging** with emoji prefixes for debugging
6. **Chrome API checks** required for cross-environment compatibility
7. **📝 IMPORTANT: Update Instructions** - When making architectural changes, updating interfaces, or changing patterns, remember to update the corresponding `.instructions.md` files in `.github/instructions/` to keep Copilot's knowledge current
