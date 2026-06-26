# Sorsa Score 

Bring Sorsa analytics directly into your X (Twitter) timeline. This extension seamlessly injects user credibility and alpha scores right next to handles on X, ensuring you never interact with or follow an unverified account blindly.

Built entirely with modern architecture (Manifest V3), focused on high performance and maximum privacy.

## ✨ Features

- **Seamless Injection:** Displays scores right next to @username handles in your timeline, tweets, and profile cards.
- **Lightning Fast & Lightweight:** Uses smart DOM scanning coupled with a dual-layer caching mechanism to ensure zero lag or layout shifts while scrolling X.
- **Privacy First:** Requires zero dangerous permissions. No tracking, no wallet connection requests, no data harvesting.
- **Official API Integration:** Fetches accurate, real-time metrics safely from api.sorsa.io.

## 🛠️ Tech Stack & Architecture

- **Manifest Version:** 3 (Chrome Extension Standard)
- **Background Worker:** background.js (Asynchronous event-driven score fetching)
- **Content Script:** Efficient DOM polling (content.js) with defensive execution to prevent layout breakage or duplicate badges.
- **Storage:** Local Chrome storage caching to prevent redundant API calls and rate-limiting.

## 🚀 Installation

### Option 1: Manual Installation (For Developers / Beta Testers)
Since the extension is built in public, you can run it locally before it hits the official Chrome Web Store:

1. Clone the repository:
   git clone https://github.com/banzaan/Sorsa-score.git
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** (toggle switch in the top right corner).
4. Click **Load unpacked** (top left corner).
5. Select the cloned repository folder (the one containing manifest.json).
6. Open x.com and enjoy real-time scores!

### Option 2: Chrome Web Store (Coming Soon)
*Link will be added here once approved by Google.*

## 🔒 Security & Privacy (Why you can trust this)

In Web3, extension security is paramount. This extension is **100% open-source** and inspectable. 
- **Permissions requested:** Only `storage` (used solely for caching scores locally to save your bandwidth).
- **No Injection into Wallets:** The code does not interact with any injected providers (like MetaMask or Phantom).
- **Data Policy:** We do not track, collect, or sell your browsing history.

## 🤝 Contributing

This is a #BuildInPublic project! Contributions, issues, and feature requests are more than welcome.
If you want to add custom CSS themes, color-coded badges based on scores, or support for more platforms:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---
Follow the journey on X: [@_banzaan](https://x.com/_banzaan) 🧵 #BuildInPublic