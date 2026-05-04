/**
 * AI Context Transfer — Settings Script
 */

document.addEventListener('DOMContentLoaded', () => {
  const tokenInput = document.getElementById('hf-token');
  const toggleBtn = document.getElementById('toggle-visibility');
  const saveBtn = document.getElementById('save-btn');
  const testBtn = document.getElementById('test-btn');
  const statusMsg = document.getElementById('status-msg');

  let tokenVisible = false;

  // Load existing token
  chrome.storage.sync.get(['hf_token'], (data) => {
    if (data.hf_token) {
      tokenInput.value = data.hf_token;
    }
  });

  // Toggle visibility
  toggleBtn.addEventListener('click', () => {
    tokenVisible = !tokenVisible;
    tokenInput.type = tokenVisible ? 'text' : 'password';
    document.getElementById('eye-icon').innerHTML = tokenVisible
      ? '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>'
      : '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
  });

  // Save token
  saveBtn.addEventListener('click', () => {
    const token = tokenInput.value.trim();
    if (!token) {
      showStatus('Please enter a token.', 'error');
      return;
    }
    if (!token.startsWith('hf_')) {
      showStatus('Token should start with "hf_". Please check your token.', 'error');
      return;
    }
    chrome.storage.sync.set({ hf_token: token }, () => {
      showStatus('Token saved successfully!', 'success');
    });
  });

  // Test connection
  testBtn.addEventListener('click', () => {
    const token = tokenInput.value.trim();
    if (!token) {
      showStatus('Please enter a token first.', 'error');
      return;
    }

    testBtn.disabled = true;
    testBtn.innerHTML = '<div style="width:14px;height:14px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin 0.8s linear infinite"></div> Testing...';

    // Add spin animation if not exists
    if (!document.getElementById('actf-settings-style')) {
      const style = document.createElement('style');
      style.id = 'actf-settings-style';
      style.textContent = '@keyframes spin{to{transform:rotate(360deg)}}';
      document.head.appendChild(style);
    }

    chrome.runtime.sendMessage({ type: 'TEST_CONNECTION', token }, (response) => {
      testBtn.disabled = false;
      testBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Test Connection';

      if (chrome.runtime.lastError) {
        showStatus('Could not reach background service. Reload the extension.', 'error');
        return;
      }

      if (response && response.success) {
        showStatus(response.message, 'success');
      } else {
        showStatus(response?.error || 'Connection test failed.', 'error');
      }
    });
  });

  function showStatus(message, type) {
    statusMsg.textContent = message;
    statusMsg.className = 'status-msg';
    statusMsg.classList.add(type === 'success' ? 'status-success' : 'status-error');
  }
});
