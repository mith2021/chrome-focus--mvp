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
