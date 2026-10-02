const elements = {
  select:   document.getElementById('camera-select'),
  grantBtn: document.getElementById('grant-btn'),
  stopBtn:  document.getElementById('stop-btn'),
  status:   document.getElementById('status'),
  video:    document.getElementById('preview'),
};

let activeStream = null;

function setStatus(msg, isError = false) {
  elements.status.textContent = msg;
  elements.status.className = isError ? 'error' : '';
}

async function populateCameras() {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const cameras = devices.filter(d => d.kind === 'videoinput');

  elements.select.innerHTML = '<option value="">-- select a camera --</option>';
  cameras.forEach((cam, i) => {
    const opt = document.createElement('option');
    opt.value = cam.deviceId;
    opt.textContent = cam.label || `Camera ${i + 1}`;
    elements.select.appendChild(opt);
  });

  elements.select.disabled = cameras.length === 0;

  if (cameras.length === 0) {
    setStatus('No cameras found.', true);
  } else if (cameras.length === 1) {
    elements.select.value = cameras[0].deviceId;
    await startCamera(cameras[0].deviceId);
  } else {
    setStatus(`${cameras.length} cameras found. Select one to preview.`);
  }
}

async function startCamera(deviceId) {
  stopCamera();
  try {
    const constraints = {
      video: deviceId ? { deviceId: { exact: deviceId } } : true,
      audio: false,
    };
    activeStream = await navigator.mediaDevices.getUserMedia(constraints);
    elements.video.srcObject = activeStream;
    elements.video.hidden = false;
    setStatus('');
    elements.stopBtn.disabled = false;
  } catch (err) {
    setStatus(`Could not start camera: ${err.message}`, true);
  }
}

function stopCamera() {
  if (activeStream) {
    activeStream.getTracks().forEach(t => t.stop());
    activeStream = null;
  }
  elements.video.srcObject = null;
  elements.video.hidden = true;
  elements.stopBtn.disabled = true;
}

async function onGrantClick() {
  setStatus('Requesting permission…');
  try {
    // A temporary stream is needed to trigger the permission prompt;
    // only after that will enumerateDevices() return labelled device names.
    const tempStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    tempStream.getTracks().forEach(t => t.stop());
    elements.grantBtn.disabled = true;
    elements.grantBtn.textContent = 'Access granted';
    await populateCameras();
  } catch (err) {
    setStatus(`Permission denied: ${err.message}`, true);
  }
}

function onSelectChange() {
  if (elements.select.value) {
    startCamera(elements.select.value);
  } else {
    stopCamera();
  }
}

function onStopClick() {
  stopCamera();
  setStatus('Camera stopped.');
}

elements.grantBtn.addEventListener('click', onGrantClick);
elements.select.addEventListener('change', onSelectChange);
elements.stopBtn.addEventListener('click', onStopClick);
