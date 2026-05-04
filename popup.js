/**
 * AI Context Transfer — Popup Script
 */

document.addEventListener('DOMContentLoaded', () => {
  const loadingState = document.getElementById('loading-state');
  const emptyState = document.getElementById('empty-state');
  const resultState = document.getElementById('result-state');
  const errorState = document.getElementById('error-state');
  const settingsBtn = document.getElementById('settings-btn');
  const copyPromptBtn = document.getElementById('copy-prompt-btn');
  const copyJsonBtn = document.getElementById('copy-json-btn');
  const downloadBtn = document.getElementById('download-btn');
  const retryBtn = document.getElementById('retry-btn');
  const collapseBtn = document.getElementById('collapse-btn');
  const jsonPreview = document.getElementById('json-preview');

  let currentACTF = null;

  // Settings button
  settingsBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('settings.html') });
  });

  // Load last result
  loadLastResult();

  // Listen for new results while popup is open
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'ACTF_UPDATED') {
      loadLastResult();
    }
  });

  function loadLastResult() {
    chrome.runtime.sendMessage({ type: 'GET_LAST_RESULT' }, (response) => {
      if (chrome.runtime.lastError) {
        showEmpty();
        return;
      }
      if (response && response.success && response.data) {
        showResult(response.data);
      } else {
        showEmpty();
      }
    });
  }

  function showState(state) {
    [loadingState, emptyState, resultState, errorState].forEach(s => s.style.display = 'none');
    state.style.display = 'flex';
  }

  function showEmpty() { showState(emptyState); }
  function showLoading() { showState(loadingState); }

  function showError(msg) {
    document.getElementById('error-message').textContent = msg;
    showState(errorState);
  }

  function showResult(data) {
    currentACTF = data.actf;
    showState(resultState);

    // Meta info
    const platformNames = { chatgpt: 'ChatGPT', claude: 'Claude', gemini: 'Gemini' };
    document.getElementById('meta-platform').textContent = platformNames[data.platform] || data.platform;
    document.getElementById('meta-status').textContent = currentACTF.current_status || 'ongoing';

    const time = new Date(data.timestamp);
    document.getElementById('meta-time').textContent = time.toLocaleString();

    // JSON preview
    const jsonStr = JSON.stringify(currentACTF, null, 2);
    jsonPreview.querySelector('code').textContent = jsonStr;

    // Prompt preview
    document.getElementById('prompt-text').textContent = buildContinuationPrompt(currentACTF);
  }

  function buildContinuationPrompt(actf) {
    return `You are continuing a previous conversation. Use the context below to pick up exactly where we left off. Do NOT re-introduce yourself. Jump straight to the next_step field.\n\n--- AI CONTEXT START ---\n${JSON.stringify(actf, null, 2)}\n--- AI CONTEXT END ---\n\nContinue now.`;
  }

  // Copy continuation prompt
  copyPromptBtn.addEventListener('click', async () => {
    if (!currentACTF) return;
    const text = buildContinuationPrompt(currentACTF);
    try {
      await navigator.clipboard.writeText(text);
      flashButton(copyPromptBtn, 'Copied!');
    } catch {
      fallbackCopy(text);
      flashButton(copyPromptBtn, 'Copied!');
    }
  });

  // Copy raw JSON
  copyJsonBtn.addEventListener('click', async () => {
    if (!currentACTF) return;
    const text = JSON.stringify(currentACTF, null, 2);
    try {
      await navigator.clipboard.writeText(text);
      flashButton(copyJsonBtn, 'Copied!');
    } catch {
      fallbackCopy(text);
      flashButton(copyJsonBtn, 'Copied!');
    }
  });

  // Download JSON
  downloadBtn.addEventListener('click', () => {
    if (!currentACTF) return;
    const blob = new Blob([JSON.stringify(currentACTF, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'actf_context.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    flashButton(downloadBtn, 'Downloaded!');
  });

  // Collapse toggle
  let collapsed = false;
  collapseBtn.addEventListener('click', () => {
    collapsed = !collapsed;
    jsonPreview.style.maxHeight = collapsed ? '60px' : '280px';
    collapseBtn.style.transform = collapsed ? 'rotate(180deg)' : 'rotate(0deg)';
  });

  // Retry
  retryBtn.addEventListener('click', () => showEmpty());

  // Flash button text
  function flashButton(btn, text) {
    const orig = btn.innerHTML;
    btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> ${text}`;
    btn.classList.add('btn-success');
    setTimeout(() => { btn.innerHTML = orig; btn.classList.remove('btn-success'); }, 1500);
  }

  // Fallback copy
  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }
});
