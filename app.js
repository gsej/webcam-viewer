const MIN_WIDTHS = { s: '280px', m: '560px', l: '900px' };

const elements = {
  grantBtn:  document.getElementById('grant-btn'),
  select:    document.getElementById('camera-select'),
  addBtn:    document.getElementById('add-btn'),
  status:    document.getElementById('status'),
  grid:      document.getElementById('grid'),
  sizeBtns:  document.querySelectorAll('.size-btn'),
};

let cardCounter = 0;
const cards = new Map(); // cardId -> { stream }

function setStatus(msg, isError = false) {
  elements.status.textContent = msg;
  elements.status.className = isError ? 'error' : '';
}

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

function setSize(size) {
  document.documentElement.style.setProperty('--card-min-width', MIN_WIDTHS[size]);
  elements.sizeBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.size === size);
  });
}

async function onGrantClick() {
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
}

elements.grantBtn.addEventListener('click', onGrantClick);
elements.addBtn.addEventListener('click', addCamera);
elements.sizeBtns.forEach(btn => btn.addEventListener('click', () => setSize(btn.dataset.size)));

setSize('m');
