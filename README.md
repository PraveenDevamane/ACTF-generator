# AI Context Transfer (ACTF) Generator

Export AI conversations as structured ACTF JSON for seamless context transfer between AI platforms (ChatGPT, Claude, Gemini).

## Features
- Extracts conversation history directly from your AI chat interfaces.
- Uses Hugging Face's API to summarize and structure the conversation into JSON format.
- Easily copy the structured context or download it as a file.
- Generate continuation prompts to seamlessly resume conversations on other platforms.

## Installation & Setup

Since this extension is not yet published on the Chrome Web Store, you can install it manually:

1. **Clone or Download the Repository:**
   Download the source code as a ZIP file and extract it, or clone the repository using Git:
   ```bash
   git clone https://github.com/PraveenDevamane/ACTF-generator.git
   ```

2. **Load the Extension in Chrome:**
   - Open your Chromium-based browser (Chrome, Edge, Brave).
   - Navigate to the extensions page: `chrome://extensions/`.
   - Toggle **Developer mode** on (usually located in the top right corner).
   - Click **Load unpacked**.
   - Select the folder where you extracted or cloned the repository.

3. **Configure the API Token:**
   - Click the extension icon in your browser toolbar to open the popup.
   - Click the **Settings** gear icon.
   - Paste your **Hugging Face API Token**. You can get a free token by creating an account on [Hugging Face](https://huggingface.co/settings/tokens) and generating a new Access Token.
   - Click **Save**. You can also use the **Test Connection** button to verify it works.

## Security & Privacy 🔒

**Your API keys are completely safe.** 
- We **DO NOT** store, collect, or transmit your Hugging Face API token to any third-party servers. 
- Your token is saved securely and locally in your browser using `chrome.storage.sync`.
- The extension communicates directly with the Hugging Face API from your browser.
- There are no environment (`.env`) files needed or included in this repository, ensuring no accidental leaks of your personal API keys to GitHub.

## Usage

1. Open a conversation in [ChatGPT](https://chatgpt.com/), [Claude](https://claude.ai/), or [Gemini](https://gemini.google.com/).
2. A floating **"Export Context"** button will appear on the screen. Click it.
3. The extension will extract the visible conversation, process it, and convert it into a structured format.
4. Click the extension icon in your toolbar to view the generated context, copy it, or download it as a JSON file!

## License

MIT License
