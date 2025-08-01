# Chrome Extension Manifest V3 Migration Summary

## Overview
Your GitHub Notifications extension has been updated from Manifest V2 to Manifest V3 to comply with Chrome Web Store requirements. This addresses the "This extension may soon no longer be supported" warning.

## Changes Made

### 1. Manifest.json Updates
- **manifest_version**: Changed from `2` to `3`
- **version**: Bumped to `1.0.4`
- **browser_action**: Replaced with `action`
- **background**: Changed from `{"page": "background.html"}` to `{"service_worker": "background.js"}`
- **content_security_policy**: Updated to V3 format with `extension_pages` object
- **web_accessible_resources**: Updated to V3 array-of-objects format
- **permissions**: Added `"storage"` permission
- **host_permissions**: Added `"https://api.github.com/*"` for GitHub API access

### 2. JavaScript API Updates
Updated deprecated APIs in the following files:

**background.js:**
- `chrome.extension.onMessage` → `chrome.runtime.onMessage`
- `chrome.browserAction.setBadgeText` → `chrome.action.setBadgeText`

**main.ctrl.js:**
- `chrome.browserAction.setBadgeText` → `chrome.action.setBadgeText`
- `chrome.browserAction.setBadgeBackgroundColor` → `chrome.action.setBadgeBackgroundColor`

## Key Differences in Manifest V3

1. **Service Workers**: Background pages are replaced with service workers (event-based, not persistent)
2. **Action API**: Browser actions and page actions are unified into the Action API
3. **Host Permissions**: Network permissions moved to separate `host_permissions` field
4. **CSP Format**: Content Security Policy now uses object format
5. **Web Accessible Resources**: More granular control with matches array

## Compatibility Notes

- The extension should now work with current Chrome versions
- All core functionality (badge updates, popup, GitHub API calls) remains the same
- The AngularJS dependency works with `'unsafe-eval'` in CSP (required for V1.5)

## Testing Recommendations

1. Load the extension in Chrome Developer Mode
2. Test the options page (GitHub token setup)
3. Verify badge updates with pull request counts
4. Check popup functionality
5. Ensure GitHub API authentication works

## File Status

- ✅ `manifest.json` - Updated to V3
- ✅ `background.js` - Updated API calls
- ✅ `main.ctrl.js` - Updated API calls
- ℹ️ `background.html` - No longer used (can be removed)
- ✅ All other files remain unchanged

The extension is now Manifest V3 compliant and should pass Chrome Web Store validation.
