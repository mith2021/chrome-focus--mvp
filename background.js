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

if (msg.action === 'visit') {
    chrome.storage.local.get(['stats'], (res) => {
        const stats = res.stats || {};

        if (!stats[msg.site]) {
            stats[msg.site] = { visits: 0 };
        }

        stats[msg.site].visits++;

        chrome.storage.local.set({ stats });
    });
}
