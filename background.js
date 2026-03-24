chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === 'visit') {
        const today = new Date().toISOString().split('T')[0];
        chrome.storage.local.get([today], (result) => {
            const data = result[today] || {};
            data[msg.site] = (data[msg.site] || 0) + 1;
            chrome.storage.local.set({[today]: data});
        });
    }
});

chrome.runtime.onMessage.addListener((msg, sender) => {
    if (msg.action === 'closeTab') {
        chrome.tabs.remove(sender.tab.id);

        // Track time saved
        chrome.storage.local.get(['timeSaved'], (res) => {
            const total = res.timeSaved || 0;
            chrome.storage.local.set({
                timeSaved: total + msg.timeSaved
            });
        });
    }
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === 'visit') {
        const today = new Date().toISOString().split('T')[0];

        chrome.storage.local.get(['stats', today, 'timeSaved'], (res) => {
            const stats = res.stats || {};
            const daily = res[today] || {};
            let timeSaved = res.timeSaved || 0;

            // Normalize site
            const site = msg.site.replace('www.', '');

            // ---------- TOTAL ----------
            if (!stats[site]) {
                stats[site] = { visits: 0, timesBlockedToday: 0 };
            }

            stats[site].visits++;

            // ---------- DAILY ----------
            if (!daily[site]) {
                daily[site] = 0;
            }

            daily[site]++;

            // ---------- TIME SAVED ----------
            if (msg.timeSaved) {
                timeSaved += msg.timeSaved;
            }

            chrome.storage.local.set({
                stats: stats,
                [today]: daily,
                timeSaved: timeSaved
            });
        });
    }
});
