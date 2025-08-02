---
applyTo: "v2/background.js,v2/manifest.json"
---

# Chrome Extension Manifest V3 Standards

## Manifest V3 Patterns
- Use `chrome.action` (NOT `chrome.browserAction`)
- Service Worker background script (NOT background page)
- Declarative permissions in manifest.json

## Background Script Standards
- **Plain JavaScript** (not TypeScript) for `background.js`
- **Badge Logic**: Green(1-3), Orange(4-8), Red(9+) PRs
- **Periodic Tasks**: 1-minute refresh cycle using alarms
- **Message Handling**: Respond to popup communications via `chrome.runtime.onMessage`

## Chrome APIs Usage
- **Storage**: `chrome.storage.local` for config persistence
- **Runtime**: `chrome.runtime.sendMessage()` for communication
- **Action**: `chrome.action.setBadgeText()` for PR count display
- **Alarms**: `chrome.alarms` for periodic background tasks

## Chrome Storage Schema
```javascript
// Key: 'github_config'
{
  username: string,
  token: string // GitHub Personal Access Token
}
```

## Badge Color Logic
- **Green**: 1-3 open PRs
- **Orange**: 4-8 open PRs
- **Red**: 9+ open PRs
- **Gray**: 0 PRs or error state
