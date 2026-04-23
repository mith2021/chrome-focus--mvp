// Realistic estimate of a typical distraction session
const TIME_SAVED_PER_BLOCK = 15 * 60; // 15 minutes in seconds

function getToday() {
    return new Date().toISOString().split('T')[0];
}

// Single listener — no duplicate handlers, no race-prone split logic
chrome.runtime.onMessage.addListener((msg, sender) => {
    if (msg.action === 'visit') {
        recordVisit(msg.site);
    } else if (msg.action === 'closeTab') {
        recordBlock(msg.site, sender.tab.id);
    }
});

// User pressed "Continue" — they chose to visit anyway
function recordVisit(site) {
    if (!site) return;
    const today = getToday();

    chrome.storage.local.get(['stats', 'daily'], (res) => {
        const stats = res.stats || {};
        const daily = res.daily || {};

        if (!stats[site]) stats[site] = { visits: 0, timesBlocked: 0, timeSaved: 0 };
        stats[site].visits++;

        if (!daily[today]) daily[today] = { visits: 0, timesBlocked: 0, timeSaved: 0 };
        daily[today].visits++;

        chrome.storage.local.set({ stats, daily });
    });
}

// User pressed "Close tab" — a true focus decision
function recordBlock(site, tabId) {
    if (!site) return;
    const today = getToday();

    chrome.storage.local.get(['stats', 'daily', 'totalTimeSaved', 'streak'], (res) => {
        const stats          = res.stats || {};
        const daily          = res.daily || {};
        const streak         = res.streak || { current: 0, best: 0, lastDate: null };
        let   totalTimeSaved = res.totalTimeSaved || 0;

        // Per-site
        if (!stats[site]) stats[site] = { visits: 0, timesBlocked: 0, timeSaved: 0 };
        stats[site].timesBlocked++;
        stats[site].timeSaved += TIME_SAVED_PER_BLOCK;

        // Daily
        if (!daily[today]) daily[today] = { visits: 0, timesBlocked: 0, timeSaved: 0 };
        daily[today].timesBlocked++;
        daily[today].timeSaved += TIME_SAVED_PER_BLOCK;

        // Running total
        totalTimeSaved += TIME_SAVED_PER_BLOCK;

        // Streak — only count each day once
        if (streak.lastDate !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            streak.current = streak.lastDate === yesterdayStr ? streak.current + 1 : 1;
            streak.best    = Math.max(streak.best, streak.current);
            streak.lastDate = today;
        }

        chrome.storage.local.set({ stats, daily, totalTimeSaved, streak }, () => {
            chrome.tabs.remove(tabId);
        });
    });
}
