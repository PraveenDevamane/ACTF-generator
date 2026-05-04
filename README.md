<div align="center">

<br/>

```
 █████╗  ██████╗████████╗███████╗
██╔══██╗██╔════╝╚══██╔══╝██╔════╝
███████║██║        ██║   █████╗  
██╔══██║██║        ██║   ██╔══╝  
██║  ██║╚██████╗   ██║   ██║     
╚═╝  ╚═╝ ╚═════╝   ╚═╝   ╚═╝    
```

# AI Context Transfer Generator

**Export AI conversations as structured JSON. Resume anywhere.**

[![MIT License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)
[![Chrome Extension](https://img.shields.io/badge/Platform-Chrome%20%7C%20Edge%20%7C%20Brave-4285F4?style=flat-square&logo=googlechrome&logoColor=white)](https://github.com/PraveenDevamane/ACTF-generator)
[![Hugging Face](https://img.shields.io/badge/Powered%20by-Hugging%20Face-FF6B35?style=flat-square&logo=huggingface&logoColor=white)](https://huggingface.co)
[![Status](https://img.shields.io/badge/Status-Active-27c93f?style=flat-square)]()

<br/>

*Switch between ChatGPT, Claude, and Gemini without losing your train of thought.*

<br/>

---

</div>

## ✦ What is ACTF?

**ACTF (AI Context Transfer Format)** is a structured JSON schema designed to capture the full context of an AI conversation — topics, decisions, code, tone — so it can be reconstructed faithfully on any other AI platform.

No more copy-pasting walls of text. No more re-explaining your project from scratch.

<br/>

## ✦ Features

| | Feature | Description |
|---|---|---|
| ⚡ | **One-click export** | A floating button appears on any AI chat page — click to capture instantly |
| 🤗 | **AI-powered structuring** | Hugging Face API summarizes and structures the raw chat into clean ACTF JSON |
| 📋 | **Copy or download** | Get your context as a `.json` file or copy straight to clipboard |
| 🔁 | **Continuation prompts** | Auto-generates a ready-to-paste prompt so your next AI session picks up exactly where you left off |
| 🔒 | **Fully local & private** | Your API token never leaves your browser — ever |

<br/>

## ✦ Supported Platforms

<div align="center">

| Platform | Supported |
|---|:---:|
| 💬 ChatGPT (`chatgpt.com`) | ✅ |
| 🟠 Claude (`claude.ai`) | ✅ |
| 🔷 Gemini (`gemini.google.com`) | ✅ |

</div>

<br/>

---

## ✦ Installation

> Not yet on the Chrome Web Store — install manually in under 2 minutes.

<br/>

**Step 1 — Clone the repository**

```bash
git clone https://github.com/PraveenDevamane/ACTF-generator.git
```

Or [download the ZIP](https://github.com/PraveenDevamane/ACTF-generator/archive/refs/heads/main.zip) and extract it.

<br/>

**Step 2 — Load unpacked in your browser**

```
chrome://extensions/
```

1. Toggle **Developer mode** ON (top-right corner)
2. Click **Load unpacked**
3. Select the cloned / extracted folder

Works on Chrome, Edge, and Brave.

<br/>

**Step 3 — Add your Hugging Face token**

```
https://huggingface.co/settings/tokens
→ New token → Role: read → Generate
```

Then:
1. Click the extension icon in your toolbar
2. Open **Settings** ⚙️
3. Paste your token → **Save**
4. Hit **Test Connection** to verify it works

<br/>

---

## ✦ How to Use

```
  1. Open a chat          →    ChatGPT / Claude / Gemini
       ↓
  2. Click "Export"       →    Floating button on the page
       ↓
  3. Context structured   →    HF API converts to ACTF JSON
       ↓
  4. Copy or download     →    Paste into any new AI session
```

<br/>

---

## ✦ Security & Privacy

```
🔒  Your API token is stored locally via chrome.storage.sync
    It is NEVER sent to any third-party server.

✓   Extension talks directly to Hugging Face — no middlemen
✓   No .env files in the repo — zero risk of key leaks to GitHub  
✓   Fully open source — every line is auditable
```

> **Short version:** Your keys stay in your browser. Always.

<br/>

---

## ✦ Project Structure

```
ACTF-generator/
├── manifest.json          # Extension manifest (MV3)
├── popup/
│   ├── popup.html         # Extension popup UI
│   ├── popup.js           # Popup logic
│   └── popup.css          # Styles
├── content/
│   └── content.js         # Injected script — extracts chat content
├── background/
│   └── service-worker.js  # Background service worker
└── icons/                 # Extension icons
```

<br/>

---

## ✦ License

```
MIT License — free to use, modify, and distribute.
See LICENSE for full terms.
```

<br/>

---

<div align="center">

Made with focus by **[Praveen Devamane](https://github.com/PraveenDevamane)**

*If this helped you — drop a ⭐ on the repo.*

[![GitHub stars](https://img.shields.io/github/stars/PraveenDevamane/ACTF-generator?style=flat-square&color=yellow)](https://github.com/PraveenDevamane/ACTF-generator/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/PraveenDevamane/ACTF-generator?style=flat-square&color=blue)](https://github.com/PraveenDevamane/ACTF-generator/network)

</div>
