# Github Notifications
Chrome Extension for displaying open pull-requests in the browser

https://chrome.google.com/webstore/detail/github-notifications/mpieedhmialhnfbpdhlcjnbdjdcckipd

## Development

### Version 2 (Current)
The current version is built with Angular and located in the `v2/` directory.

#### Building the Extension
```bash
cd v2
npm install
npm run build:prod
```

#### Development
```bash
cd v2
npm run dev:main    # Development server for popup
npm run dev:options # Development server for options page
```

## Automated Publishing

This repository includes a GitHub Action that automatically builds and publishes the extension to the Chrome Web Store. See [GITHUB_ACTION_SETUP.md](GITHUB_ACTION_SETUP.md) for detailed setup instructions.

The action will:
- Build the extension automatically on pushes to main branches
- Create a ZIP package ready for Chrome Web Store
- Upload to Chrome Web Store (when properly configured)

## Manual Installation

1. Build the extension (see instructions above)
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the `v2/dist` folder
