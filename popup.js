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


chrome.storage.local.get([today], (result) => {
    const data = result[today] || {};
    let html = '';
    for (const site in data) {
        html += `<p>${site}: ${data[site]} visits</p>`;
    }
    statsDiv.innerHTML = html || '<p>No visits today!</p>';
});
