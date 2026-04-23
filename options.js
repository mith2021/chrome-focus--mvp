// ── Refresh toggle ───────────────────────────────
const toggle = document.getElementById('refreshToggle');

chrome.storage.sync.get(['overlayOnRefresh'], (res) => {
    toggle.checked = res.overlayOnRefresh ?? true;
});

toggle.addEventListener('change', () => {
    chrome.storage.sync.set({ overlayOnRefresh: toggle.checked });
});

// ── All-time stats ───────────────────────────────
function formatTime(seconds) {
    if (!seconds) return '0m';
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    const h = Math.floor(seconds / 3600);
    const m = Math.round((seconds % 3600) / 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

const statsCard = document.getElementById('statsCard');

// Read blockedSites (sync) and stats (local) together so we can show
// every blocked site, not just ones that have already triggered the overlay.
chrome.storage.sync.get(['blockedSites'], (syncRes) => {
    const blockedSites = syncRes.blockedSites || [];

    chrome.storage.local.get(['stats', 'totalTimeSaved', 'streak'], (localRes) => {
        const stats          = localRes.stats || {};
        const totalTimeSaved = localRes.totalTimeSaved || 0;
        const streak         = localRes.streak || { current: 0, best: 0 };

        // Overview card
        const summaryEl = document.getElementById('statsSummary');
        if (summaryEl && (streak.current > 0 || totalTimeSaved > 0)) {
            summaryEl.innerHTML = `
                <div class="stat-row-item">
                    <span class="stat-row-site">Total time reclaimed</span>
                    <span class="badge">${formatTime(totalTimeSaved)}</span>
                </div>
                <div class="stat-row-item">
                    <span class="stat-row-site">Current streak</span>
                    <span class="badge">${streak.current} day${streak.current !== 1 ? 's' : ''}</span>
                </div>
                <div class="stat-row-item">
                    <span class="stat-row-site">Best streak</span>
                    <span class="badge">${streak.best} day${streak.best !== 1 ? 's' : ''}</span>
                </div>
            `;
        }

        // By site — show every blocked site; merge in stats if they exist
        if (blockedSites.length === 0) return;

        statsCard.innerHTML = blockedSites
            .map(site => {
                const s = stats[site];
                const hasStat = s && (s.timesBlocked > 0 || s.visits > 0);
                return `
                    <div class="stat-row-item">
                        <span class="stat-row-site">${site}</span>
                        <div class="stat-row-badges">
                            ${hasStat ? `
                                <span class="badge">${formatTime(s.timeSaved)} saved</span>
                                <span class="badge">${s.timesBlocked} blocked</span>
                                ${s.visits > 0 ? `<span class="badge">${s.visits} visited</span>` : ''}
                            ` : `<span class="badge" style="opacity:0.4">no data yet</span>`}
                        </div>
                    </div>
                `;
            }).join('');
    });
});
