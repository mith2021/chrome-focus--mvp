const toggle = document.getElementById('refreshToggle');

// Load setting
chrome.storage.sync.get(['overlayOnRefresh'], (res) => {
    toggle.checked = res.overlayOnRefresh ?? true;
});

// Save setting
toggle.addEventListener('change', () => {
    chrome.storage.sync.set({
        overlayOnRefresh: toggle.checked
    });
});
