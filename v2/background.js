// Service Worker for GitHub Notifications Chrome Extension
// Handles badge updates and storage management

const ALARM_NAME = 'github-refresh';

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason !== "install" && details.reason !== "update") return;

  // Set initial badge
  chrome.action.setBadgeText({ text: "?" });

  // Set up the alarm for periodic refresh
  setupPeriodicRefresh();

  console.log('GitHub Notifications extension installed/updated');
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'REFRESH_BADGE') {
    refreshBadge();
    sendResponse({ success: true });
  }

  if (request.type === 'CONFIG_UPDATED') {
    // Restart refresh cycle when config is updated
    setupPeriodicRefresh();
    sendResponse({ success: true });
  }
});

// Handle alarm events - this will wake up the service worker
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) {
    refreshBadge();
  }
});

async function refreshBadge() {
  try {
    const result = await chrome.storage.local.get(['github_config']);
    const config = result.github_config;

    if (!config?.username || !config?.token) {
      chrome.action.setBadgeText({ text: "?" });
      chrome.action.setBadgeBackgroundColor({ color: "#9E9E9E" }); // Gray for unconfigured
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
      chrome.action.setBadgeBackgroundColor({ color: "#9E9E9E" }); // Gray for error
      return;
    }

    const data = await response.json();
    const count = data.total_count;

    const countText = count > 0 ? count.toString() : "";
    chrome.action.setBadgeText({ text: countText });

    // Badge color logic: Green(1-3), Orange(4-8), Red(9+)
    let color = "#4CAF50"; // Green
    if (count >= 4 && count <= 8) color = "#FF9800"; // Orange
    if (count >= 9) color = "#F44336"; // Red

    chrome.action.setBadgeBackgroundColor({ color });

    console.log(`🔄 Badge updated: ${count} PRs, color: ${color}`);

  } catch (error) {
    console.error('❌ Error refreshing badge:', error);
    chrome.action.setBadgeText({ text: "!" });
    chrome.action.setBadgeBackgroundColor({ color: "#9E9E9E" });
  }
}

function setupPeriodicRefresh() {
  // Clear any existing alarm
  chrome.alarms.clear(ALARM_NAME);

  // Create a new alarm that fires every minute
  chrome.alarms.create(ALARM_NAME, {
    delayInMinutes: 1,      // First alarm in 1 minute
    periodInMinutes: 1      // Then every minute
  });

  // Do an initial refresh immediately
  refreshBadge();

  console.log('🔄 Periodic refresh alarm set up');
}

// Set up the refresh cycle when the service worker starts
setupPeriodicRefresh();
