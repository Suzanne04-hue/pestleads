/* ============================================
   PESTLEADS — WIDGET.JS
   All widget state logic
   ============================================ */

/* ─── ELEMENTS ─── */
const uploadZone     = document.getElementById('upload-zone');
const fileInput      = document.getElementById('file-input');
const pestDesc       = document.getElementById('pest-description');
const identifyBtn    = document.getElementById('identify-btn');
const privacyLine    = document.getElementById('privacy-line');
const loadingText    = document.getElementById('loading-text');
const connectBtn     = document.getElementById('connect-btn');
const postcodeInput  = document.getElementById('postcode-input');
const widgetCard     = document.getElementById('widget-card');

/* ─── STATE ELEMENTS ─── */
const stateIdle      = document.getElementById('state-idle');
const stateLoading   = document.getElementById('state-loading');
const stateResult    = document.getElementById('state-result');
const stateEmergency = document.getElementById('state-emergency');
const stateConnected = document.getElementById('state-connected');

/* ─── DATA ─── */
let uploadedFile = null;

/* ─── LOADING MESSAGES ─── */
const loadingMessages = [
  'Analysing your pest…',
  'Checking species and behaviour…',
  'Assessing risk level…',
  'Finding local experts near you…'
];

/* ─── SHOW STATE ─── */
function showState(stateName) {
  const states = [stateIdle, stateLoading, stateResult, stateEmergency, stateConnected];
  states.forEach(s => { if (s) s.style.display = 'none'; });

  widgetCard.classList.remove('state-loading', 'state-result', 'state-emergency');

  if (stateName === 'idle') {
    stateIdle.style.display = 'block';
  } else if (stateName === 'loading') {
    stateLoading.style.display = 'block';
    widgetCard.classList.add('state-loading');
    cycleLoadingMessages();
  } else if (stateName === 'result') {
    stateResult.style.display = 'block';
    widgetCard.classList.add('state-result');
  } else if (stateName === 'emergency') {
    stateEmergency.style.display = 'block';
    widgetCard.classList.add('state-emergency');
  } else if (stateName === 'connected') {
    stateConnected.style.display = 'block';
    widgetCard.classList.add('state-result');
  }
}

/* ─── CYCLE LOADING MESSAGES ─── */
function cycleLoadingMessages() {
  let i = 0;
  if (loadingText) loadingText.textContent = loadingMessages[0];
  const interval = setInterval(() => {
    i++;
    if (i >= loadingMessages.length) { clearInterval(interval); return; }
    if (loadingText) loadingText.textContent = loadingMessages[i];
  }, 1800);
}

/* ─── CHECK INPUT ─── */
function checkInput() {
  const hasText = pestDesc && pestDesc.value.trim().length > 2;
  const hasFile = uploadedFile !== null;
  if (identifyBtn) identifyBtn.disabled = !(hasText || hasFile);
}

/* ─── UPLOAD ZONE CLICK ─── */
if (uploadZone) {
  uploadZone.addEventListener('click', () => fileInput.click());
}

/* ─── FILE INPUT CHANGE ─── */
if (fileInput) {
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    uploadedFile = file;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const uploadIcon = uploadZone.querySelector('.upload-icon');
      const uploadTitle = uploadZone.querySelector('.upload-title');
      const uploadSub = uploadZone.querySelector('.upload-sub');

      if (uploadIcon) uploadIcon.innerHTML = `<img src="${ev.target.result}" style="width:80px;height:80px;object-fit:cover;border-radius:8px;" />`;
      if (uploadTitle) uploadTitle.textContent = 'Looking good. Hit Identify Now when you\'re ready.';
      if (uploadSub) uploadSub.style.display = 'none';
      if (privacyLine) privacyLine.style.display = 'block';

      uploadZone.style.borderColor = 'var(--teal-1)';
    };
    reader.readAsDataURL(file);
    checkInput();
  });
}

/* ─── TEXT INPUT ─── */
if (pestDesc) {
  pestDesc.addEventListener('input', checkInput);
}

/* ─── IDENTIFY BUTTON ─── */
if (identifyBtn) {
  identifyBtn.addEventListener('click', async () => {
    showState('loading');
    try {
      let body;

      if (uploadedFile) {
        const base64 = await fileToBase64(uploadedFile);
        body = JSON.stringify({
          type: 'image',
          image: base64,
          mimeType: uploadedFile.type
        });
      } else {
        body = JSON.stringify({
          type: 'text',
          description: pestDesc.value.trim()
        });
      }
const response = await fetch('/.netlify/functions/identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body
      });

      if (!response.ok) throw new Error('API error');

      const data = await response.json();
      handleResult(data);

    } catch (err) {
      console.error(err);
      showFallback();
    }
  });
}

/* ─── FILE TO BASE64 ─── */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ─── HANDLE RESULT ─── */
function handleResult(data) {
  const { pestName, latinName, severity, timeframe, description, emergency } = data;

  if (emergency) {
    document.getElementById('emergency-name').textContent = `🐛 ${pestName}`;
    document.getElementById('emergency-desc').textContent = description;
    showState('emergency');
    return;
  }

  const severityEmoji = {
    moderate: '🟡',
    high: '🔴',
    urgent: '⚫'
  }[severity] || '🔴';

  const timeframeText = {
    moderate: 'Act within the week',
    high: 'Act within 24–48 hours',
    urgent: 'Contact a professional today'
  }[severity] || 'Act within 24–48 hours';

  document.getElementById('result-name').textContent =
    `${severityEmoji} ${pestName}${latinName ? ' (' + latinName + ')' : ''}`;
  document.getElementById('result-severity').textContent =
    `${severityEmoji} ${severity.charAt(0).toUpperCase() + severity.slice(1)} — ${timeframeText}`;
  document.getElementById('result-desc').textContent = description;

  showState('result');
}

/* ─── CONNECT BUTTON ─── */
if (connectBtn) {
  connectBtn.addEventListener('click', () => {
    const postcode = postcodeInput ? postcodeInput.value.trim() : '';
    if (postcode.length < 4) {
      if (postcodeInput) postcodeInput.focus();
      return;
    }
    showState('connected');
  });
}

/* ─── FALLBACK ─── */
function showFallback() {
  document.getElementById('result-name').textContent = '🐛 Pest Detected';
  document.getElementById('result-severity').textContent = '🔴 High — Act within 24–48 hours';
  document.getElementById('result-desc').textContent =
    'We\'re not 100% certain — a local expert can confirm on-site.';
  showState('result');
}

/* ─── INIT ─── */
showState('idle');