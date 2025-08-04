// Service Worker for GitHub Notifications Chrome Extension
// Handles badge updates and storage management

const ALARM_NAME = 'github-refresh';

chrome.runtime.onInstalled.addListener((details) => {
  console.log('🔧 Extension installed/updated:', details.reason);

  // Set initial badge
  chrome.action.setBadgeText({ text: "?" });

  // Set up the alarm for periodic refresh
  setupPeriodicRefresh();

  console.log('GitHub Notifications extension installed/updated');
});

// Handle browser startup - this ensures the service worker activates on browser start
chrome.runtime.onStartup.addListener(() => {
  console.log('🚀 Browser started, setting up periodic refresh');

  // Set up the alarm for periodic refresh
  setupPeriodicRefresh();
});

// This is the key fix: Listen for when any alarm fires, which will wake up the service worker
// Even if the service worker was terminated, this will revive it when the alarm fires
chrome.alarms.onAlarm.addListener((alarm) => {
  console.log('⏰ Alarm fired:', alarm.name);

  if (alarm.name === ALARM_NAME) {
    refreshBadge();
  } else {
    // If it's our alarm but service worker was restarted, ensure it's set up
    console.log('🔄 Unknown alarm, ensuring periodic refresh is set up');
    setupPeriodicRefresh();
  }
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

async function refreshBadge() {
  try {
    // Keep the service worker alive during this operation
    const keepAlive = setInterval(() => chrome.runtime.getPlatformInfo(), 25 * 1000);

    const result = await chrome.storage.local.get(['github_config']);
    const config = result.github_config;

    if (!config?.username || !config?.token) {
      chrome.action.setBadgeText({ text: "?" });
      chrome.action.setBadgeBackgroundColor({ color: "#9E9E9E" }); // Gray for unconfigured
      clearInterval(keepAlive);
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
      clearInterval(keepAlive);
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

    clearInterval(keepAlive);

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

// This is the KEY FIX: Check for existing alarms when service worker starts
// This handles the case where the browser was restarted
async function ensureAlarmExists() {
  const existingAlarm = await chrome.alarms.get(ALARM_NAME);

  if (!existingAlarm) {
    console.log('🚨 No existing alarm found, setting up periodic refresh');
    setupPeriodicRefresh();
  } else {
    console.log('✅ Existing alarm found, service worker ready');
    // Do an immediate refresh to update the badge
    refreshBadge();
  }
}

// Set up the refresh cycle when the service worker starts
// This runs every time the service worker is created/restarted
ensureAlarmExists();
