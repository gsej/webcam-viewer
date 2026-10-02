const SIZE_PRESETS = { s: 280, m: 560, l: 900 };
const SIZE_STEP = 40;
const SIZE_MIN  = 200;
const SIZE_MAX  = 1400;

const elements = {
  grantBtn:   document.getElementById('grant-btn'),
  select:     document.getElementById('camera-select'),
  addBtn:     document.getElementById('add-btn'),
  status:     document.getElementById('status'),
  grid:       document.getElementById('grid'),
  sizeDec:    document.getElementById('size-dec'),
  sizeInc:    document.getElementById('size-inc'),
  sizeBtns:   document.querySelectorAll('.size-btn'),
  themeBtns:  document.querySelectorAll('.theme-btn'),
};

let cardCounter = 0;
const cards = new Map(); // cardId -> { stream }

// ── status ──────────────────────────────────────────────────────────────────

function setStatus(msg, isError = false) {
  elements.status.textContent = msg;
  elements.status.className = isError ? 'error' : '';
}

// ── cameras ─────────────────────────────────────────────────────────────────

async function populateCameras() {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const cameras = devices.filter(d => d.kind === 'videoinput');

  elements.select.innerHTML = '<option value="">-- select camera --</option>';
  cameras.forEach((cam, i) => {
    const opt = document.createElement('option');
    opt.value = cam.deviceId;
    opt.textContent = cam.label || `Camera ${i + 1}`;
    elements.select.appendChild(opt);
  });

  if (cameras.length === 0) {
    setStatus('No cameras found.', true);
    return;
  }

  elements.select.hidden = false;
  elements.select.disabled = false;
  elements.addBtn.hidden = false;
  elements.addBtn.disabled = false;
  setStatus(`${cameras.length} camera${cameras.length !== 1 ? 's' : ''} available.`);
}

async function addCamera() {
  const deviceId = elements.select.value;
  if (!deviceId) return;

  const label = elements.select.options[elements.select.selectedIndex].text;
  const id = ++cardCounter;

  const card = document.createElement('div');
  card.className = 'card';
  card.id = `card-${id}`;

  const video = document.createElement('video');
  video.autoplay = true;
  video.playsInline = true;
  video.muted = true;

  const labelEl = document.createElement('div');
  labelEl.className = 'card-label';
  labelEl.textContent = label;

  const removeBtn = document.createElement('button');
  removeBtn.className = 'remove-btn';
  removeBtn.setAttribute('aria-label', `Remove ${label}`);
  removeBtn.textContent = '×';
  removeBtn.addEventListener('click', () => removeCamera(id));

  card.append(video, labelEl, removeBtn);
  elements.grid.appendChild(card);

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: { exact: deviceId } },
      audio: false,
    });
    video.srcObject = stream;
    cards.set(id, { stream });
    setStatus('');
  } catch (err) {
    setStatus(`Could not open camera: ${err.message}`, true);
    card.remove();
  }
}

function removeCamera(id) {
  const entry = cards.get(id);
  if (entry) {
    entry.stream.getTracks().forEach(t => t.stop());
    cards.delete(id);
  }
  document.getElementById(`card-${id}`)?.remove();
}

// ── size ─────────────────────────────────────────────────────────────────────

let currentSize = SIZE_PRESETS.m;

function applySize(px) {
  currentSize = Math.max(SIZE_MIN, Math.min(SIZE_MAX, px));
  document.documentElement.style.setProperty('--card-width', `${currentSize}px`);
  elements.sizeBtns.forEach(btn => {
    btn.classList.toggle('active', SIZE_PRESETS[btn.dataset.size] === currentSize);
  });
  elements.sizeDec.disabled = currentSize <= SIZE_MIN;
  elements.sizeInc.disabled = currentSize >= SIZE_MAX;
}

// ── theme ────────────────────────────────────────────────────────────────────

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  elements.themeBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === theme);
  });
}

// ── event listeners ──────────────────────────────────────────────────────────

elements.grantBtn.addEventListener('click', async () => {
  setStatus('Requesting permission…');
  try {
    // A temporary stream is needed to trigger the permission prompt;
    // only after that will enumerateDevices() return labelled device names.
    const tempStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    tempStream.getTracks().forEach(t => t.stop());
    elements.grantBtn.hidden = true;
    await populateCameras();
  } catch (err) {
    setStatus(`Permission denied: ${err.message}`, true);
  }
});

elements.addBtn.addEventListener('click', addCamera);

elements.sizeDec.addEventListener('click', () => applySize(currentSize - SIZE_STEP));
elements.sizeInc.addEventListener('click', () => applySize(currentSize + SIZE_STEP));
elements.sizeBtns.forEach(btn => btn.addEventListener('click', () => applySize(SIZE_PRESETS[btn.dataset.size])));

elements.themeBtns.forEach(btn => btn.addEventListener('click', () => applyTheme(btn.dataset.theme)));

// ── init ─────────────────────────────────────────────────────────────────────

applySize(SIZE_PRESETS.m);
applyTheme('dark');
