const today = new Date().toISOString().split('T')[0];

const delaySlider   = document.getElementById('delaySlider');
const delayValue    = document.getElementById('delayValue');
const siteInput     = document.getElementById('siteInput');
const siteList      = document.getElementById('siteList');
const settingsBtn   = document.getElementById('settingsBtn');
const statTimeSaved = document.getElementById('statTimeSaved');
const statVisits    = document.getElementById('statVisits');

// ── Slider ──────────────────────────────────────
function updateSlider() {
    const val = parseInt(delaySlider.value);
    const pct = ((val - 1) / 9) * 100;
    delayValue.textContent = `${val}s`;
    delaySlider.style.background =
        `linear-gradient(to right, var(--accent) ${pct}%, var(--surface-2) ${pct}%)`;
}

chrome.storage.sync.get(['delay'], (res) => {
    delaySlider.value = res.delay || 3;
    updateSlider();
});

delaySlider.addEventListener('input', () => {
    updateSlider();
    chrome.storage.sync.set({ delay: parseInt(delaySlider.value) });
});

// ── Blocked sites ────────────────────────────────
function loadSites() {
    chrome.storage.sync.get(['blockedSites'], (res) => {
        const sites = res.blockedSites || [];
        siteList.innerHTML = '';

        if (sites.length === 0) {
            siteList.innerHTML = '<li class="empty-state">No sites blocked yet</li>';
            return;
        }

        sites.forEach((site, i) => {
            const li = document.createElement('li');
            li.className = 'site-item';
            li.innerHTML = `
                <span class="site-name">${site}</span>
                <button class="remove-btn" data-index="${i}" title="Remove">
                    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
                        <path d="M1 1l10 10M11 1L1 11"/>
                    </svg>
                </button>
            `;
            siteList.appendChild(li);
        });
    });
}

document.getElementById('siteForm').addEventListener('submit', (e) => {
    e.preventDefault();
    let site = siteInput.value.trim().toLowerCase();
    if (!site) return;
    site = site.replace(/^https?:\/\//, '').replace('www.', '').split('/')[0];

    chrome.storage.sync.get(['blockedSites'], (res) => {
        const sites = res.blockedSites || [];
        if (sites.includes(site)) { siteInput.value = ''; return; }
        sites.push(site);
        chrome.storage.sync.set({ blockedSites: sites }, () => {
            siteInput.value = '';
            loadSites();
        });
    });
});

siteList.addEventListener('click', (e) => {
    const btn = e.target.closest('.remove-btn');
    if (!btn) return;
    const index = parseInt(btn.dataset.index);
    chrome.storage.sync.get(['blockedSites'], (res) => {
        const sites = res.blockedSites || [];
        sites.splice(index, 1);
        chrome.storage.sync.set({ blockedSites: sites }, loadSites);
    });
});

// ── Stats ────────────────────────────────────────
function formatTime(seconds) {
    if (!seconds) return '0m';
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    const h = Math.floor(seconds / 3600);
    const m = Math.round((seconds % 3600) / 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function renderStats() {
    chrome.storage.local.get(['daily'], (res) => {
        const todayData = (res.daily || {})[today] || {};
        statTimeSaved.textContent = formatTime(todayData.timeSaved || 0);
        statVisits.textContent    = todayData.timesBlocked || 0;
    });
}

// ── Settings ─────────────────────────────────────
settingsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
});

// ── Init ─────────────────────────────────────────
loadSites();
renderStats();
