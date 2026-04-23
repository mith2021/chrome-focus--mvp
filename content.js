(function () {
    const currentSite = window.location.hostname.replace('www.', '');

    chrome.storage.sync.get(['blockedSites', 'delay', 'overlayOnRefresh'], (res) => {
        const blockedSites    = res.blockedSites || [];
        const delay           = res.delay || 3;
        const overlayOnRefresh = res.overlayOnRefresh ?? true;

        const isBlocked = blockedSites.some(
            s => currentSite === s || currentSite.endsWith('.' + s)
        );
        if (!isBlocked) return;

        const navEntry = performance.getEntriesByType('navigation')[0];
        if (navEntry && navEntry.type === 'reload' && !overlayOnRefresh) return;
        if (document.getElementById('focus-extension-overlay')) return;

        // ── Inject styles ──────────────────────────────────
        const style = document.createElement('style');
        style.textContent = `
            #focus-extension-overlay {
                position: fixed !important;
                inset: 0 !important;
                z-index: 2147483647 !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
                background: rgba(0, 0, 0, 0) !important;
                backdrop-filter: blur(0px) saturate(1) !important;
                -webkit-backdrop-filter: blur(0px) saturate(1) !important;
                transition: background 0.7s ease, backdrop-filter 0.7s ease, -webkit-backdrop-filter 0.7s ease !important;
            }
            #focus-extension-overlay.fo-in {
                background: rgba(0, 0, 0, 0.9) !important;
                backdrop-filter: blur(32px) saturate(0.08) !important;
                -webkit-backdrop-filter: blur(32px) saturate(0.08) !important;
            }
            #focus-extension-overlay .fo-card {
                background: rgba(20, 20, 24, 0.96) !important;
                border: 1px solid rgba(255, 255, 255, 0.08) !important;
                border-radius: 28px !important;
                padding: 52px 44px !important;
                width: 380px !important;
                max-width: calc(100vw - 40px) !important;
                text-align: center !important;
                box-shadow: 0 48px 96px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03) !important;
                opacity: 0 !important;
                transform: translateY(16px) scale(0.96) !important;
                transition: opacity 0.5s ease 0.2s, transform 0.5s ease 0.2s !important;
            }
            #focus-extension-overlay.fo-in .fo-card {
                opacity: 1 !important;
                transform: translateY(0) scale(1) !important;
            }
            #focus-extension-overlay .fo-site {
                font-size: 11px !important;
                font-weight: 500 !important;
                color: rgba(167, 139, 250, 0.65) !important;
                letter-spacing: 0.1em !important;
                text-transform: uppercase !important;
                margin-bottom: 20px !important;
                display: block !important;
            }
            #focus-extension-overlay .fo-headline {
                font-size: 32px !important;
                font-weight: 300 !important;
                letter-spacing: -0.03em !important;
                color: #f2f2f4 !important;
                line-height: 1.1 !important;
                margin-bottom: 36px !important;
            }
            #focus-extension-overlay .fo-ring-wrap {
                position: relative !important;
                width: 100px !important;
                height: 100px !important;
                margin: 0 auto 32px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                animation: fo-breathe 3s ease-in-out infinite !important;
            }
            #focus-extension-overlay .fo-ring-svg {
                position: absolute !important;
                inset: 0 !important;
                width: 100% !important;
                height: 100% !important;
                transform: rotate(-90deg) !important;
            }
            #focus-extension-overlay .fo-num {
                font-size: 38px !important;
                font-weight: 200 !important;
                color: #a78bfa !important;
                letter-spacing: -0.04em !important;
                line-height: 1 !important;
                font-variant-numeric: tabular-nums !important;
                position: relative !important;
                z-index: 1 !important;
            }
            #focus-extension-overlay .fo-quote {
                font-size: 14px !important;
                color: rgba(242, 242, 244, 0.45) !important;
                line-height: 1.55 !important;
                margin-bottom: 36px !important;
                min-height: 22px !important;
                font-weight: 400 !important;
                letter-spacing: 0.01em !important;
                transition: opacity 0.4s ease !important;
            }
            #focus-extension-overlay .fo-quote.fo-hidden {
                opacity: 0 !important;
            }
            #focus-extension-overlay .fo-actions {
                display: flex !important;
                flex-direction: column !important;
                gap: 10px !important;
                opacity: 0 !important;
                transform: translateY(10px) !important;
                transition: opacity 0.4s ease, transform 0.4s ease !important;
                pointer-events: none !important;
            }
            #focus-extension-overlay .fo-actions.fo-ready {
                opacity: 1 !important;
                transform: translateY(0) !important;
                pointer-events: auto !important;
            }
            #focus-extension-overlay .fo-btn-continue {
                background: #a78bfa !important;
                color: white !important;
                border: none !important;
                border-radius: 14px !important;
                padding: 14px 24px !important;
                font-size: 14px !important;
                font-weight: 500 !important;
                cursor: pointer !important;
                font-family: inherit !important;
                letter-spacing: 0.01em !important;
                transition: opacity 0.15s, transform 0.15s !important;
                width: 100% !important;
            }
            #focus-extension-overlay .fo-btn-continue:hover {
                opacity: 0.88 !important;
                transform: scale(1.02) !important;
            }
            #focus-extension-overlay .fo-btn-close {
                background: transparent !important;
                color: rgba(242, 242, 244, 0.35) !important;
                border: none !important;
                padding: 10px 24px !important;
                font-size: 13px !important;
                cursor: pointer !important;
                font-family: inherit !important;
                transition: color 0.15s !important;
                transform: none !important;
                width: 100% !important;
            }
            #focus-extension-overlay .fo-btn-close:hover {
                color: rgba(242, 242, 244, 0.65) !important;
                transform: none !important;
            }
            @keyframes fo-breathe {
                0%, 100% { transform: scale(1); }
                50%       { transform: scale(1.04); }
            }
        `;
        document.head.appendChild(style);

        // ── Build overlay ──────────────────────────────────
        const r    = 40;
        const circ = +(2 * Math.PI * r).toFixed(2);

        const overlay = document.createElement('div');
        overlay.id = 'focus-extension-overlay';
        overlay.innerHTML = `
            <div class="fo-card">
                <span class="fo-site">${currentSite}</span>
                <h1 class="fo-headline">Take a breath.</h1>
                <div class="fo-ring-wrap">
                    <svg class="fo-ring-svg" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="${r}"
                            fill="none"
                            stroke="rgba(255,255,255,0.06)"
                            stroke-width="2"/>
                        <circle id="fo-ring-fill" cx="50" cy="50" r="${r}"
                            fill="none"
                            stroke="#a78bfa"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-dasharray="${circ}"
                            stroke-dashoffset="0"
                            style="transition: stroke-dashoffset 0.95s linear;"/>
                    </svg>
                    <span class="fo-num" id="fo-num">${delay}</span>
                </div>
                <p class="fo-quote fo-hidden" id="fo-quote"></p>
                <div class="fo-actions" id="fo-actions">
                    <button class="fo-btn-continue" id="fo-continue">Continue to site</button>
                    <button class="fo-btn-close"    id="fo-close">Close tab</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        // Trigger entrance animation on next paint
        requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.add('fo-in')));

        const numEl     = overlay.querySelector('#fo-num');
        const ringFill  = overlay.querySelector('#fo-ring-fill');
        const quoteEl   = overlay.querySelector('#fo-quote');
        const actions   = overlay.querySelector('#fo-actions');

        const quotes = [
            'You\'re in control.',
            'Is this worth your time?',
            'Your future self will thank you.',
            'Pause. Breathe. Decide.',
            'What matters more right now?',
            'Stay intentional.',
        ];

        let timeLeft = delay;

        const interval = setInterval(() => {
            timeLeft--;
            const progress = ((delay - timeLeft) / delay) * circ;
            ringFill.style.strokeDashoffset = progress;

            if (timeLeft > 0) {
                numEl.textContent = timeLeft;
            } else {
                clearInterval(interval);
                numEl.textContent = '✓';
                quoteEl.textContent = quotes[Math.floor(Math.random() * quotes.length)];
                quoteEl.classList.remove('fo-hidden');
                actions.classList.add('fo-ready');
            }
        }, 1000);

        // ── Buttons ───────────────────────────────────────
        overlay.querySelector('#fo-continue').addEventListener('click', () => {
            overlay.style.transition = 'opacity 0.3s ease';
            overlay.style.opacity = '0';
            setTimeout(() => { overlay.remove(); style.remove(); }, 320);
            chrome.runtime.sendMessage({ site: currentSite, action: 'visit' });
        });

        overlay.querySelector('#fo-close').addEventListener('click', () => {
            chrome.runtime.sendMessage({ action: 'closeTab', site: currentSite });
        });
    });
})();
