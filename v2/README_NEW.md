# GitHub Notifications Chrome Extension v2

A modern Chrome extension built with Angular 20 that monitors your GitHub pull requests and displays notifications in the browser toolbar.

## Features

- **Real-time PR monitoring**: Automatically checks for assigned pull requests every minute
- **Visual badge indicators**: Color-coded badge showing PR count (Green: 1-3, Orange: 4-8, Red: 9+)
- **Popup interface**: Click the extension icon to view all your open PRs grouped by repository
- **Options page**: Easy setup with GitHub personal access token
- **Modern architecture**: Built with Angular 20 and Manifest V3

## Development Setup

### Prerequisites

- Node.js 18+
- npm
- Chrome browser

### Installation

1. Clone the repository
2. Navigate to the v2 directory
3. Install dependencies:
   ```bash
   npm install
   ```

### Development

#### Building the Extension

```bash
# Clean build (recommended for production)
npm run build:prod

# Regular build
npm run build
```

The built extension will be available in the `dist/` directory with a flattened structure for easy Chrome loading.

#### Development Workflow

```bash
# Develop main popup component
npm run dev:main

# Develop options page
npm run dev:options

# Clean dist directory
npm run clean
```

#### Loading in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select the `dist/` directory
4. The extension will be loaded and available in your toolbar

### Project Structure

```
v2/
├── manifest.json           # Extension manifest (root level)
├── background.js          # Service worker script
├── projects/
│   ├── main/              # Main popup Angular project
│   │   └── src/
│   │       ├── app/
│   │       └── assets/
│   └── options/           # Options page Angular project
│       └── src/
│           └── app/
├── dist/                  # Built extension (generated)
│   ├── manifest.json      # Copied manifest
│   ├── background.js      # Copied background script
│   ├── index.html         # Main popup (from main project)
│   ├── options.html       # Options page (from options project)
│   ├── assets/            # Extension icons
│   ├── *.js               # Compiled Angular bundles
│   └── *.css              # Compiled stylesheets
└── package.json
```

### Configuration

1. Click the extension icon in Chrome
2. Click "Open Options" if no configuration exists
3. Go to [GitHub Personal Access Tokens](https://github.com/settings/tokens/new)
4. Create a token with `repo` and `user` scopes
5. Paste the token in the options page and save

### Build Scripts

- `npm run build` - Build both Angular projects and copy files
- `npm run build:prod` - Clean build from scratch
- `npm run build:main` - Build only the main popup project
- `npm run build:options` - Build only the options page project
- `npm run clean` - Remove dist directory
- `npm run dev:main` - Serve main project for development
- `npm run dev:options` - Serve options project for development

### Architecture

- **Main Project**: Angular standalone component for the popup interface
- **Options Project**: Angular standalone component for the configuration page
- **Service Worker**: Background script handling badge updates and periodic PR checks
- **GitHub Service**: Angular service handling API communication and data management
- **Chrome Storage**: Persistent storage for configuration and caching

### Migration from v1

This v2 version migrates from AngularJS to Angular 20 while maintaining the same functionality:

- ✅ Pull request monitoring and display
- ✅ Badge notifications with color coding
- ✅ Options page for GitHub token configuration
- ✅ Periodic refresh (1-minute intervals)
- ✅ Repository grouping in popup
- ✅ Chrome extension APIs integration
- ✅ Manifest V3 compliance

### Contributing

1. Make changes to the Angular components in `projects/main/` or `projects/options/`
2. Test locally using `npm run dev:main` or `npm run dev:options`
3. Build the extension with `npm run build:prod`
4. Test the extension by loading the `dist/` directory in Chrome
5. Submit a pull request

### License

MIT License - see the root repository for details.
