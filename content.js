/**
 * AI Context Transfer — Content Script
 * Injects the floating "Export Context" button and extracts conversations
 * from ChatGPT, Claude, and Gemini.
 */

(function () {
  'use strict';

  // Prevent double injection
  if (document.getElementById('actf-export-btn')) return;

  // ─── Detect Platform ───────────────────────────────────────────────
  function detectPlatform() {
    const host = window.location.hostname;
    if (host.includes('chat.openai.com') || host.includes('chatgpt.com')) return 'chatgpt';
    if (host.includes('claude.ai')) return 'claude';
    if (host.includes('gemini.google.com')) return 'gemini';
    return null;
  }

  // ─── Extract Conversation ──────────────────────────────────────────
  function extractConversation(platform) {
    const messages = [];

    switch (platform) {
      case 'chatgpt': {
        // ChatGPT uses data-message-author-role on message containers
        const msgElements = document.querySelectorAll('[data-message-author-role]');
        msgElements.forEach((el) => {
          const role = el.getAttribute('data-message-author-role');
          const text = el.innerText.trim();
          if (text) {
            const label = role === 'user' ? 'Human' : 'AI';
            messages.push(`${label}: ${text}`);
          }
        });
        break;
      }

      case 'claude': {
        // Claude uses data-testid for message containers
        // Try multiple selector strategies for robustness
        const humanTurns = document.querySelectorAll(
          '[data-testid="human-turn"], .human-turn, [class*="human"], [data-role="user"]'
        );
        const aiTurns = document.querySelectorAll(
          '[data-testid="ai-turn"], .ai-turn, [class*="assistant"], [data-role="assistant"]'
        );

        // If specific selectors work, pair them up
        if (humanTurns.length > 0 || aiTurns.length > 0) {
          // Collect all turns with their DOM position for proper ordering
          const allTurns = [];
          humanTurns.forEach((el) => allTurns.push({ role: 'Human', el }));
          aiTurns.forEach((el) => allTurns.push({ role: 'AI', el }));

          // Sort by DOM position
          allTurns.sort((a, b) => {
            const pos = a.el.compareDocumentPosition(b.el);
            if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
            if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
            return 0;
          });

          allTurns.forEach(({ role, el }) => {
            const text = el.innerText.trim();
            if (text) messages.push(`${role}: ${text}`);
          });
        } else {
          // Fallback: grab the conversation thread container
          const threadContainer = document.querySelector(
            '[class*="conversation"], [class*="thread"], main'
          );
          if (threadContainer) {
            // Look for alternating message blocks
            const blocks = threadContainer.querySelectorAll(
              'div[class*="message"], div[class*="turn"], div[class*="msg"]'
            );
            blocks.forEach((block, i) => {
              const text = block.innerText.trim();
              if (text) {
                const label = i % 2 === 0 ? 'Human' : 'AI';
                messages.push(`${label}: ${text}`);
              }
            });
          }
        }
        break;
      }

      case 'gemini': {
        // Gemini uses specific classes for query and response
        const queryEls = document.querySelectorAll(
          '.query-text, [class*="query-text"], [data-text-query], .user-query'
        );
        const responseEls = document.querySelectorAll(
          '.response-text, [class*="response-text"], .model-response-text, .response-container-content'
        );

        if (queryEls.length > 0 || responseEls.length > 0) {
          const allTurns = [];
          queryEls.forEach((el) => allTurns.push({ role: 'Human', el }));
          responseEls.forEach((el) => allTurns.push({ role: 'AI', el }));

          allTurns.sort((a, b) => {
            const pos = a.el.compareDocumentPosition(b.el);
            if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
            if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
            return 0;
          });

          allTurns.forEach(({ role, el }) => {
            const text = el.innerText.trim();
            if (text) messages.push(`${role}: ${text}`);
          });
        } else {
          // Fallback: look for turn containers
          const turns = document.querySelectorAll(
            'message-content, .conversation-turn, [class*="turn"]'
          );
          turns.forEach((turn, i) => {
            const text = turn.innerText.trim();
            if (text) {
              const label = i % 2 === 0 ? 'Human' : 'AI';
              messages.push(`${label}: ${text}`);
            }
          });
        }
        break;
      }
    }

    return messages.join('\n\n');
  }

  // ─── Create Floating Button ────────────────────────────────────────
  function createExportButton() {
    const btn = document.createElement('button');
    btn.id = 'actf-export-btn';
    btn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
      <span>Export Context</span>
    `;

    btn.addEventListener('click', handleExportClick);
    document.body.appendChild(btn);
  }

  // ─── Toast Notification ────────────────────────────────────────────
  function showToast(message, type = 'info') {
    // Remove existing toast
    const existing = document.getElementById('actf-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'actf-toast';
    toast.className = `actf-toast actf-toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('actf-toast-show');
    });

    setTimeout(() => {
      toast.classList.remove('actf-toast-show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // ─── Handle Export Click ───────────────────────────────────────────
  async function handleExportClick() {
    const btn = document.getElementById('actf-export-btn');
    const platform = detectPlatform();

    if (!platform) {
      showToast('Unsupported platform.', 'error');
      return;
    }

    // Show loading state
    btn.classList.add('actf-loading');
    btn.innerHTML = `
      <div class="actf-spinner"></div>
      <span>Extracting...</span>
    `;

    try {
      const conversation = extractConversation(platform);

      if (!conversation || conversation.length < 20) {
        showToast('No conversation found on this page. Make sure messages are visible.', 'error');
        resetButton();
        return;
      }

      // Truncate very long conversations to stay within model limits
      const maxChars = 6000;
      const truncated =
        conversation.length > maxChars
          ? conversation.substring(0, maxChars) + '\n\n[...conversation truncated for processing]'
          : conversation;

      // Send to background script for API processing
      chrome.runtime.sendMessage(
        {
          type: 'PROCESS_CONVERSATION',
          conversation: truncated,
          platform: platform,
        },
        (response) => {
          resetButton();

          if (chrome.runtime.lastError) {
            showToast('Extension error. Try reloading the page.', 'error');
            return;
          }

          if (response && response.success) {
            showToast('Context exported! Open the extension popup to view.', 'success');
          } else if (response && response.needsToken) {
            showToast('Please set your HuggingFace API token in extension settings.', 'error');
          } else {
            showToast(response?.error || 'Failed to process conversation.', 'error');
          }
        }
      );
    } catch (err) {
      console.error('ACTF Export Error:', err);
      showToast('Error extracting conversation: ' + err.message, 'error');
      resetButton();
    }
  }

  // ─── Reset Button State ────────────────────────────────────────────
  function resetButton() {
    const btn = document.getElementById('actf-export-btn');
    if (!btn) return;
    btn.classList.remove('actf-loading');
    btn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
      <span>Export Context</span>
    `;
  }

  // ─── Initialize ────────────────────────────────────────────────────
  const platform = detectPlatform();
  if (platform) {
    // Wait for page to fully render
    const initDelay = platform === 'gemini' ? 3000 : 1500;
    setTimeout(createExportButton, initDelay);
  }
})();
