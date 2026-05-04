/**
 * AI Context Transfer — Background Service Worker
 * Handles HuggingFace API calls and stores ACTF results.
 */

const HF_API_URL = 'https://router.huggingface.co/v1/chat/completions';
const HF_MODEL = 'Qwen/Qwen2.5-72B-Instruct';

chrome.runtime.onInstalled.addListener(() => {
  console.log('ACTF Extension installed. Please configure your Hugging Face API token in the settings.');
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'PROCESS_CONVERSATION') {
    handleProcess(message.conversation, message.platform)
      .then(r => sendResponse(r))
      .catch(e => sendResponse({ success: false, error: e.message }));
    return true;
  }
  if (message.type === 'GET_LAST_RESULT') {
    chrome.storage.local.get(['lastACTF'], d => sendResponse({ success: true, data: d.lastACTF || null }));
    return true;
  }
  if (message.type === 'TEST_CONNECTION') {
    testHF(message.token).then(r => sendResponse(r)).catch(e => sendResponse({ success: false, error: e.message }));
    return true;
  }
});

async function handleProcess(conversation, platform) {
  const td = await new Promise(r => chrome.storage.sync.get(['hf_token'], r));
  const token = td.hf_token;
  if (!token) {
    chrome.tabs.create({ url: chrome.runtime.getURL('settings.html') });
    return { success: false, needsToken: true, error: 'HuggingFace API token not set.' };
  }

  const systemPrompt = `You are an AI context summarizer. Analyze the conversation and return ONLY a valid JSON object with this exact structure. No explanation, no markdown fences, just the raw JSON:
{"topic":"short title","domain":"subject area","goal":"what human wants","summary":"2-3 sentence overview","tech_stack":[],"key_points":["point1","point2"],"what_was_decided":["outcome1"],"current_status":"resolved / partial / ongoing","next_step":"what comes next"}`;

  const userPrompt = `Analyze this conversation and return the JSON:\n\nCONVERSATION:\n${conversation}\n\nReturn JSON only. Start with { end with }`;

  const actf = await callHF(token, systemPrompt, userPrompt);
  const resultData = { actf, platform, timestamp: new Date().toISOString(), conversationPreview: conversation.substring(0, 200) + '...' };
  await new Promise(r => chrome.storage.local.set({ lastACTF: resultData }, r));
  return { success: true, data: resultData };
}

async function callHF(token, systemPrompt, userPrompt) {
  let response, retries = 0;

  while (retries < 3) {
    response = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: HF_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 600,
        temperature: 0.3,
        top_p: 0.9
      })
    });

    if (response.status === 503) {
      const d = await response.json().catch(() => ({}));
      await new Promise(r => setTimeout(r, Math.min((d.estimated_time || 10) * 1000, 30000)));
      retries++; continue;
    }
    if (response.status === 401) throw new Error('Invalid API token. Check settings.');
    if (response.status === 429) throw new Error('Rate limited. Wait a moment and retry.');
    if (!response.ok) {
      const errBody = await response.text().catch(() => '');
      throw new Error(`API error (${response.status}): ${errBody}`);
    }
    break;
  }

  const data = await response.json();

  // Extract text from chat completions response
  let text = '';
  if (data.choices && data.choices[0]) {
    text = data.choices[0].message?.content || data.choices[0].text || '';
  } else if (data.error) {
    throw new Error(data.error.message || 'API returned an error.');
  } else {
    throw new Error('Unexpected API response format.');
  }

  // Extract JSON from response
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) throw new Error('Could not extract JSON from AI response. Try again.');
  try {
    return normalize(JSON.parse(m[0]));
  } catch {
    const fixed = m[0].replace(/,\s*}/g, '}').replace(/,\s*]/g, ']').replace(/'/g, '"');
    try { return normalize(JSON.parse(fixed)); }
    catch { throw new Error('Failed to parse AI JSON. Try again.'); }
  }
}

function normalize(p) {
  return {
    topic: p.topic || 'Untitled',
    domain: p.domain || 'General',
    goal: p.goal || 'Not specified',
    summary: p.summary || 'No summary.',
    tech_stack: Array.isArray(p.tech_stack) ? p.tech_stack : [],
    key_points: Array.isArray(p.key_points) ? p.key_points : [],
    what_was_decided: Array.isArray(p.what_was_decided) ? p.what_was_decided : [],
    current_status: p.current_status || 'ongoing',
    next_step: p.next_step || 'Continue conversation.'
  };
}

async function testHF(token) {
  try {
    const r = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: HF_MODEL,
        messages: [{ role: 'user', content: 'Say hello' }],
        max_tokens: 10
      })
    });
    if (r.status === 401) return { success: false, error: 'Invalid token.' };
    if (r.status === 503) return { success: true, message: 'Token valid! Model loading (~30s).' };
    if (r.ok) return { success: true, message: 'Connected successfully! Token is valid.' };
    const errBody = await r.json().catch(() => ({}));
    return { success: false, error: errBody?.error?.message || `Error: ${r.status}` };
  } catch (e) { return { success: false, error: e.message }; }
}
