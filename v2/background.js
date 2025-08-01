// Service Worker for GitHub Notifications Chrome Extension
// Handles badge updates and storage management

let refreshInterval = null;

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason !== "install" && details.reason !== "update") return;

  // Set initial badge
  chrome.action.setBadgeText({ text: "?" });

  console.log('GitHub Notifications extension installed/updated');
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'REFRESH_BADGE') {
    refreshBadge();
    sendResponse({ success: true });
  }

  if (request.type === 'CONFIG_UPDATED') {
    // Restart refresh cycle when config is updated
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }
    startRefreshCycle();
    sendResponse({ success: true });
  }
});

async function refreshBadge() {
  try {
    const result = await chrome.storage.local.get(['github_config']);
    const config = result.github_config;

    if (!config?.username || !config?.token) {
      chrome.action.setBadgeText({ text: "?" });
      return;
    }

    const url = `https://api.github.com/search/issues?q=involves:${config.username}+state:open+type:pr`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `TOKEN ${config.token}`
      }
    });

    if (!response.ok) {
      chrome.action.setBadgeText({ text: "!" });
      return;
    }

    const data = await response.json();
    const count = data.total_count;

    const countText = count > 0 ? count.toString() : "";
    chrome.action.setBadgeText({ text: countText });

    let color = "#4CAF50";
    if (count >= 4) color = "#FF9800";
    if (count >= 9) color = "#F44336";

    chrome.action.setBadgeBackgroundColor({ color });

  } catch (error) {
    console.error('Error refreshing badge:', error);
    chrome.action.setBadgeText({ text: "!" });
  }
}

function startRefreshCycle() {
  refreshBadge(); // Initial refresh

  // Refresh every minute
  refreshInterval = setInterval(refreshBadge, 60000);
}

// Start the refresh cycle when the service worker starts
startRefreshCycle();
