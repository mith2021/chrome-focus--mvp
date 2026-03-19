// content.js
(function () {

    // Prevent multiple overlays per tab
    if (sessionStorage.getItem('siteBlocked')) return;

    chrome.storage.sync.get(['blockedSites', 'delay'], (result) => {
        const sites = result.blockedSites || [];
        const delay = result.delay || 3;

        const currentSite = window.location.hostname;

        // Better matching (exact domain or subdomain)
        const isBlocked = sites.some(site =>
            currentSite === site || currentSite.endsWith('.' + site)
        );

        if (!isBlocked) return;

        // Extra safeguard
        if (document.getElementById('focus-extension-overlay')) return;

        // Create overlay
        const overlay = document.createElement('div');
        overlay.id = 'focus-extension-overlay';

        overlay.style = `
            position: fixed;
            top:0; left:0;
            width:100%; height:100%;
            background: rgba(0,0,0,0.85);
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
            <button id="continueBtn" disabled style="margin-top:20px; padding:10px 20px; font-size:18px;">
                Wait ${delay}s
            </button>
        `;

        document.body.appendChild(overlay);

        const button = overlay.querySelector('#continueBtn');
        const text = overlay.querySelector('#countdownText');

        let timeLeft = delay;

        const interval = setInterval(() => {
            timeLeft--;

            button.textContent = `Wait ${timeLeft}s`;

            if (timeLeft <= 0) {
                clearInterval(interval);
                button.disabled = false;
                button.textContent = "Continue";
                text.textContent = "You’re in control.";
            }
        }, 1000);

        button.onclick = () => {
            overlay.remove();
            sessionStorage.setItem('siteBlocked', 'true');

            chrome.runtime.sendMessage({
                site: currentSite,
                action: 'visit'
            });
        };
    });

})();
