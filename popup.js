const statsDiv = document.getElementById('stats');
const today = new Date().toISOString().split('T')[0];

const delaySlider = document.getElementById('delaySlider');
const delayValue = document.getElementById('delayValue');

chrome.storage.sync.get(['delay'], (result) => {
    const delay = result.delay || 3;
    delaySlider.value = delay;
    delayValue.textContent = delay + 's';
});

delaySlider.addEventListener('input', () => {
    const delay = delaySlider.value;
    delayValue.textContent = delay + 's';

    chrome.storage.sync.set({ delay: parseInt(delay) });
});

const input = document.getElementById('siteInput');
const addBtn = document.getElementById('addBtn');
const siteList = document.getElementById('siteList');

function loadSites() {
    chrome.storage.sync.get(['blockedSites'], (result) => {
        const sites = result.blockedSites || [];
        siteList.innerHTML = '';

        sites.forEach((site, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${site}</span>
                <button data-index="${index}">✕</button>
            `;
            siteList.appendChild(li);
        });
    });
}

addBtn.addEventListener('click', () => {
    let newSite = input.value.trim().toLowerCase();

    if (!newSite) return;

    // Normalize input
    newSite = newSite
        .replace(/^https?:\/\//, '')
        .replace('www.', '')
        .split('/')[0];

    chrome.storage.sync.get(['blockedSites'], (result) => {
        const sites = result.blockedSites || [];

        // Prevent duplicates
        if (sites.includes(newSite)) return;

        sites.push(newSite);

        chrome.storage.sync.set({ blockedSites: sites }, () => {
            input.value = '';
            loadSites();
        });
    });
});

siteList.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
        const index = e.target.dataset.index;

        chrome.storage.sync.get(['blockedSites'], (result) => {
            const sites = result.blockedSites || [];
            sites.splice(index, 1);

            chrome.storage.sync.set({ blockedSites: sites }, loadSites);
        });
    }
});

input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addBtn.click();
});

loadSites(); // Load sites when the popup is opened

function renderStats() {
    chrome.storage.local.get([today, 'stats', 'timeSaved'], (res) => {
        const dailyData = res[today] || {};
        const stats = res.stats || {};
        const timeSaved = res.timeSaved || 0;

        let html = `<p><strong>Time Saved:</strong> ${timeSaved}s</p>`;

        // Daily visits
        html += `<h4>Today's Visits:</h4>`;
        if (Object.keys(dailyData).length > 0) {
            for (const site in dailyData) {
                const visits = dailyData[site].visits || dailyData[site]; // handle different formats
                html += `<p>${site}: ${visits} visit${visits !== 1 ? 's' : ''}</p>`;
            }
        } else {
            html += `<p>No visits today!</p>`;
        }

        // Total visits & times blocked
        html += `<h4>Total Stats:</h4>`;
        if (Object.keys(stats).length > 0) {
            for (const site in stats) {
                const siteStats = stats[site];
                html += `<p>
                    ${site}: ${siteStats.visits || 0} visit${siteStats.visits !== 1 ? 's' : ''}` +
                    `${siteStats.timesBlockedToday ? ` | Blocked Today: ${siteStats.timesBlockedToday}` : ''}</p>`;
            }
        } else {
            html += `<p>No total stats yet.</p>`;
        }

        statsDiv.innerHTML = html;
    });
}

// Call on popup load
document.addEventListener('DOMContentLoaded', renderStats);
