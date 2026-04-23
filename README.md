# Focus Extension

A minimal Chrome extension that helps reduce distractions by introducing a short delay before accessing selected websites.

Instead of blocking sites outright, it creates a small pause so you can make a more intentional decision about whether to continue.

---

## Overview

When you open a site you’ve marked as distracting, the extension shows a full-screen overlay with a short countdown. After the delay, you can either proceed or close the tab.

The goal is simple: reduce impulsive behavior without being overly restrictive.

---

## Features

* Delay-based blocking (1–10 seconds)
* Full-screen overlay with countdown
* Option to close the tab or continue
* Per-site visit tracking
* Estimated time saved
* Simple controls for adding/removing sites
* Toggle for showing overlay on refresh

---

## How it works

1. Add a site (e.g. `youtube.com`) in the popup
2. Visit the site
3. A delay overlay appears
4. Choose to continue or close the tab

---

## Tech stack

* JavaScript
* Chrome Extension APIs (Manifest V3)
* HTML / CSS
* chrome.storage (local + sync)

---

## Project structure

```
manifest.json
background.js     // handles messaging + stats
content.js        // injects overlay
popup.html        // main UI
popup.js          // UI logic + stats
options.html      // settings page
options.js        // settings logic
styles.css        // styling
```

---

## Installation

1. Clone the repo
2. Go to `chrome://extensions/`
3. Enable Developer Mode
4. Click "Load unpacked"
5. Select the project folder

---

## Notes

* Time saved is an estimate, not an exact measurement
* The extension is designed to encourage awareness, not enforce strict blocking

---

## Future improvements

* Better time estimation
* Daily streak tracking
* Improved stats visualization
* Sync across devices

---

## License

MIT
