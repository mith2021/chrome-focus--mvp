// ------------------- content.js -------------------
(function () {

    // Get current site
    const currentSite = window.location.hostname.replace('www.', '');

    // Fetch user settings
    chrome.storage.sync.get(['blockedSites', 'delay', 'overlayOnRefresh'], (res) => {
        const blockedSites = res.blockedSites || [];
        const delay = res.delay || 3;
        const overlayOnRefresh = res.overlayOnRefresh ?? true;

        // Check if site is blocked
        const isBlocked = blockedSites.some(site =>
            currentSite === site || currentSite.endsWith('.' + site)
        );

        if (!isBlocked) return; // Exit if site not blocked

        // Check if it's a page reload
        const navEntry = performance.getEntriesByType("navigation")[0];
        const isReload = navEntry && navEntry.type === "reload";

        if (isReload && !overlayOnRefresh) return; // Don't show overlay if disabled on refresh

        // ------------------- Create Overlay -------------------
        if (document.getElementById('focus-extension-overlay')) return; // Prevent duplicates

        const overlay = document.createElement('div');
        overlay.id = 'focus-extension-overlay';
        overlay.style = `
            position: fixed;
            top:0; left:0;
            width:100%; height:100%;
            background: rgba(0,0,0,0.4);
            backdrop-filter: blur(8px);
            color: white;
            display:flex;
            justify-content:center;
            align-items:center;
            flex-direction: column;
            z-index: 9999999;
            font-size: 24px;
        `;

        overlay.innerHTML = `
            <p id="countdownText">Take a deep breath 😌</p>
            <button id="closeTabBtn" style="margin-top:10px;">Close Tab</button>
            <button id="continueBtn" disabled style="margin-top:20px; padding:10px 20px; font-size:18px;">
                Wait ${delay}s
            </button>
        `;

        document.body.appendChild(overlay);

        // ------------------- Close Tab Button -------------------
        overlay.querySelector('#closeTabBtn').onclick = () => {
            chrome.runtime.sendMessage({
                action: 'closeTab',
                timeSaved: delay
            });
        };

        // ------------------- Countdown Timer -------------------
        const button = overlay.querySelector('#continueBtn');
        const text = overlay.querySelector('#countdownText');
        const quotes = [
            "You’re in control.",
            "Stay focused.",
            "Do you really need this?",
            "Your future self will thank you.",
            "Pause. Breathe. Decide."
        ];

        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        let timeLeft = delay;

        const interval = setInterval(() => {
            timeLeft--;
            button.textContent = `Wait ${timeLeft}s`;
            if (timeLeft <= 0) {
                clearInterval(interval);
                button.disabled = false;
                button.textContent = "Continue";
                text.textContent = randomQuote;
            }
        }, 1000);

        // ------------------- Continue Button -------------------
        button.onclick = () => {
            overlay.remove();

            // Track visit
            chrome.runtime.sendMessage({
                site: currentSite,
                action: 'visit'
            });
        };
    });
})();
