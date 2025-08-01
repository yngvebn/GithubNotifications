# GitHub Action Setup for Chrome Extension Publishing

This document explains how to set up the GitHub Action to automatically build and publish your Chrome extension to the Chrome Web Store.

## Prerequisites

1. **Chrome Web Store Developer Account**: You need a Chrome Web Store developer account
2. **Chrome Extension Listed**: Your extension should already be listed in the Chrome Web Store
3. **Google Cloud Project**: You need access to the Google Cloud Console (which you already have)

## Setup Instructions

### Step 1: Get Chrome Extension ID

1. Go to your [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Find your extension and copy its ID from the URL or the dashboard
3. The ID looks like: `abcdefghijklmnopqrstuvwxyzabcdef`

### Step 2: Set up OAuth2 Credentials

Unfortunately, the Chrome Web Store API doesn't work with service accounts directly. You need to set up OAuth2 credentials instead. Here's how:

1. **Go to Google Cloud Console**:
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Select your project: `githubnotifications`

2. **Enable Chrome Web Store API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Chrome Web Store API"
   - Click on it and enable it

3. **Create OAuth2 Credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Desktop application" as the application type
   - Name it something like "GitHub Actions Publisher"
   - Download the JSON file

4. **Get Refresh Token**:
   You'll need to generate a refresh token. Here's a Node.js script to help:

   ```javascript
   // Save this as get-refresh-token.js and run with Node.js
   const https = require('https');
   const { execSync } = require('child_process');

   const CLIENT_ID = 'your-client-id-here';
   const CLIENT_SECRET = 'your-client-secret-here';
   const REDIRECT_URI = 'urn:ietf:wg:oauth:2.0:oob';

   console.log('1. Visit this URL to authorize the application:');
   console.log(`https://accounts.google.com/o/oauth2/auth?response_type=code&scope=https://www.googleapis.com/auth/chromewebstore&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}`);
   console.log('2. After authorization, you will get an authorization code.');
   console.log('3. Run this script again with the code as an argument: node get-refresh-token.js YOUR_AUTH_CODE');

   if (process.argv[2]) {
     const authCode = process.argv[2];
     const postData = `code=${authCode}&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&redirect_uri=${REDIRECT_URI}&grant_type=authorization_code`;

     const req = https.request({
       hostname: 'oauth2.googleapis.com',
       port: 443,
       path: '/token',
       method: 'POST',
       headers: {
         'Content-Type': 'application/x-www-form-urlencoded',
         'Content-Length': Buffer.byteLength(postData)
       }
     }, (res) => {
       let data = '';
       res.on('data', (chunk) => data += chunk);
       res.on('end', () => {
         const response = JSON.parse(data);
         console.log('Your refresh token:', response.refresh_token);
       });
     });

     req.write(postData);
     req.end();
   }
   ```

### Step 3: Set up GitHub Secrets

In your GitHub repository, go to Settings > Secrets and variables > Actions, and add these secrets:

1. **CHROME_EXTENSION_ID**: Your Chrome extension ID
2. **GOOGLE_CLIENT_ID**: The client ID from your OAuth2 credentials
3. **GOOGLE_CLIENT_SECRET**: The client secret from your OAuth2 credentials
4. **GOOGLE_REFRESH_TOKEN**: The refresh token you generated

### Step 4: Test the Workflow

1. Push a commit to the `version2`, `main`, or `master` branch
2. Or create a tag starting with 'v' (e.g., `v2.0.1`)
3. The workflow will run automatically

## How the Workflow Works

1. **Build Job**:
   - Checks out the code
   - Sets up Node.js
   - Installs dependencies in the `v2` folder
   - Builds the extension using `npm run build:prod`
   - Creates a ZIP file of the built extension
   - Uploads the ZIP as an artifact

2. **Publish Job** (only runs on main/master branch or tags):
   - Downloads the built extension
   - Installs the Chrome Web Store upload CLI
   - Uploads the extension to the Chrome Web Store
   - Optionally publishes it (currently commented out for safety)

## Important Notes

- **Publishing is commented out**: The workflow currently only uploads the extension but doesn't automatically publish it. This is for safety - you can manually publish from the Chrome Web Store dashboard, or uncomment the publish lines in the workflow.

- **Branch triggers**: The publish job only runs on pushes to main/master branches or version tags. Adjust the branch names in the workflow if needed.

- **Manual approval**: Consider setting up environment protection rules in GitHub for additional approval steps before publishing.

## Troubleshooting

- **Build fails**: Check that all dependencies are properly listed in `package.json`
- **Upload fails**: Verify your credentials and extension ID
- **API errors**: Make sure the Chrome Web Store API is enabled in your Google Cloud project

## Alternative: Manual Upload

If you prefer not to auto-publish, you can:
1. Let the action build and create the ZIP
2. Download the artifact from the GitHub Actions page
3. Manually upload to Chrome Web Store dashboard
