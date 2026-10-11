import { state, notify } from '../state.js';
import { listGallery } from '../api/uploads.js';
import { analyzeImage, confirmAnalysis } from '../api/ai.js';
import { API_BASE } from '../api/client.js';

let activeStream = null;
let isStartingCamera = false;

/**
 * Generates tactile synthetic mechanical shutter sounds using Web Audio API.
 */
export function playShutterSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Primary click pulse
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(650, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.06);

    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.07);

    // Secondary subtle mechanical resonance
    setTimeout(() => {
      try {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(320, ctx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.05);

        gain2.gain.setValueAtTime(0.18, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.05);
      } catch (_) {}
    }, 45);
  } catch (_) {}
}

/**
 * Triggers tactile vibration if supported and enabled in settings.
 */
export function triggerHapticFeedback() {
  if (state.settings.hapticOn && typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate([18, 32, 22]);
    } catch (_) {}
  }
}

/**
 * Starts or restarts the on-device camera stream with secure-context verification.
 */
export async function startCamera() {
  if (isStartingCamera) return;

  // 1. Strict secure context check (Catches plain HTTP LAN or Tailscale IPs)
  if (typeof window !== 'undefined' && !window.isSecureContext) {
    state.camera.loading = false;
    state.camera.streaming = false;
    state.camera.isInsecureContext = true;
    state.camera.error = 'Camera access requires HTTPS. Open the app using its HTTPS address (or localhost).';
    notify();
    return;
  }

  // 2. Browser Web API support check
  if (!navigator?.mediaDevices?.getUserMedia) {
    state.camera.loading = false;
    state.camera.streaming = false;
    state.camera.isInsecureContext = false;
    state.camera.error = 'This browser does not support camera hardware streaming.';
    notify();
    return;
  }

  isStartingCamera = true;
  state.camera.loading = true;
  state.camera.error = null;
  state.camera.isInsecureContext = false;
  notify();

  // Stop any existing stream tracks first
  if (activeStream) {
    activeStream.getTracks().forEach(track => track.stop());
    activeStream = null;
  }

  const preferredFacing = state.camera.facingMode || 'environment';

  try {
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: preferredFacing },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
    } catch (idealErr) {
      console.warn('Preferred camera facingMode unavailable, falling back:', idealErr);
      stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: true
      });
    }

    activeStream = stream;
    state.camera.streaming = true;
    state.camera.loading = false;
    state.camera.error = null;
    isStartingCamera = false;
    notify();

    const videoEl = document.getElementById('camera-stream');
    if (videoEl) {
      videoEl.srcObject = stream;
      videoEl.play().catch(e => console.warn('Camera video play error:', e));
    }
  } catch (err) {
    console.error('Camera access error:', err);
    state.camera.loading = false;
    state.camera.streaming = false;
    isStartingCamera = false;

    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      state.camera.error = 'Camera permission denied. Please grant permission in your browser to use the viewfinder.';
    } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
      state.camera.error = 'No camera hardware found on this device.';
    } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
      state.camera.error = 'Camera is currently in use by another application.';
    } else {
      state.camera.error = err.message || 'Unable to access camera.';
    }
    notify();
  }
}

/**
 * Stops the on-device camera stream and releases hardware tracks.
 */
export function stopCamera() {
  if (activeStream) {
    activeStream.getTracks().forEach(track => {
      try {
        track.stop();
      } catch (_) {}
    });
    activeStream = null;
  }
  state.camera.streaming = false;
  state.camera.loading = false;
}

/**
 * Ensures the video element in DOM has the active camera stream attached.
 */
export function attachCameraStream() {
  const videoEl = document.getElementById('camera-stream');
  if (!videoEl) return;

  if (activeStream && activeStream.active && activeStream.getVideoTracks().some(t => t.readyState === 'live')) {
    if (videoEl.srcObject !== activeStream) {
      videoEl.srcObject = activeStream;
    }
    videoEl.play().catch(e => console.warn('Camera stream play catch:', e));
  } else if (!isStartingCamera && !state.camera.error) {
    startCamera();
  }
}

/**
 * Switches between front ('user') and back ('environment') camera.
 */
export async function toggleCameraFacing() {
  const current = state.camera.facingMode;
  state.camera.facingMode = current === 'environment' ? 'user' : 'environment';
  await startCamera();
}

/**
 * Captures a frame, flashes HUD, triggers audio/haptics, uploads to server,
 * then automatically kicks off AI analysis of the fresh capture.
 */
export async function captureSnapshot() {
  const videoEl = document.getElementById('camera-stream');
  let photoBlob = null;
  let previewUrl = null;

  if (videoEl && videoEl.videoWidth > 0 && videoEl.videoHeight > 0) {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoEl.videoWidth;
      canvas.height = videoEl.videoHeight;
      const ctx = canvas.getContext('2d');

      if (state.camera.facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }

      ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
      previewUrl = canvas.toDataURL('image/jpeg', 0.92);

      photoBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.92));
    } catch (err) {
      console.warn('Canvas frame capture error:', err);
    }
  }

  // Visual flash effect & haptics
  state.camera.flashing = true;
  state.camera.captureCount += 1;
  playShutterSound();
  triggerHapticFeedback();
  notify();

  setTimeout(() => {
    state.camera.flashing = false;
    notify();
  }, 120);

  // If frame was grabbed, upload to backend
  if (photoBlob) {
    state.camera.uploading = true;
    notify();

    try {
      const form = new FormData();
      form.append('file', photoBlob, `capture_${Date.now()}.jpg`);

      const res = await fetch(`${API_BASE}/api/uploads`, {
        method: 'POST',
        credentials: 'include',
        body: form,
      });

      if (res.ok) {
        const upload = await res.json();
        const photo = {
          id: upload.id,
          url: upload.url,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          date: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
          width: videoEl?.videoWidth || 1920,
          height: videoEl?.videoHeight || 1080,
          ratio: state.settings.ratios[state.settings.ratioIndex] || '4:3',
        };
        state.camera.lastCapturedPhoto = upload.url;
        state.camera.capturedPhotos.unshift(photo);
      } else {
        // Fallback local preview if offline
        const localPhoto = {
          id: 'local_' + Date.now(),
          url: previewUrl,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: 'Local Draft',
          ratio: state.settings.ratios[state.settings.ratioIndex] || '4:3',
        };
        state.camera.lastCapturedPhoto = previewUrl;
        state.camera.capturedPhotos.unshift(localPhoto);
      }
    } catch (err) {
      console.warn('Upload error, saved locally:', err);
      if (previewUrl) {
        state.camera.lastCapturedPhoto = previewUrl;
        state.camera.capturedPhotos.unshift({
          id: 'local_' + Date.now(),
          url: previewUrl,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: 'Local Draft',
        });
      }
    } finally {
      state.camera.uploading = false;
      notify();
    }

    // Auto-process the fresh capture with AI (no manual trigger needed).
    // Fire-and-forget: the analysis spinner/modal is driven by state.
    analyzeLastCapture(photoBlob);
  }
}

let aiRequestSeq = 0;

/**
 * Analyzes a captured photo using AI and shows the result in a modal.
 * Runs automatically after every capture; can also be retried manually
 * with an explicit blob. Only the most recent request is allowed to
 * publish its result (so quick successive captures don't clash).
 */
export async function analyzeLastCapture(blobOverride) {
  const seq = ++aiRequestSeq;

  // Resolve the image bytes: explicit blob first, otherwise fetch the URL
  let blob = blobOverride || null;
  if (!blob && state.camera.lastCapturedPhoto) {
    try {
      const res = await fetch(state.camera.lastCapturedPhoto);
      blob = await res.blob();
    } catch {
      const photo = state.camera.capturedPhotos.find(p => p.url === state.camera.lastCapturedPhoto);
      blob = photo?.blob || null;
    }
  }

  if (!blob) {
    state.camera.aiAnalyzing = false;
    state.camera.aiError = 'Could not load image for analysis';
    notify();
    return;
  }

  state.camera.aiAnalyzing = true;
  state.camera.aiError = null;
  state.camera.aiResult = null;
  notify();

  try {
    const result = await analyzeImage(blob);
    if (seq !== aiRequestSeq) return; // superseded by a newer capture
    state.camera.aiResult = result;
    state.camera.aiAnalyzing = false;
    notify();
  } catch (err) {
    console.warn('AI analysis error:', err);
    if (seq !== aiRequestSeq) return;
    state.camera.aiAnalyzing = false;
    state.camera.aiError = err.message || 'AI analysis failed';
    notify();
  }
}

/**
 * Confirms the AI analysis and creates the page.
 * Navigates to the created page on success.
 */
export async function confirmAIAnalysis() {
  const aiResult = state.camera.aiResult;
  if (!aiResult) return;

  const title = document.getElementById('ai-title-input')?.value.trim() || aiResult.analysis.title;
  const content = document.getElementById('ai-content-input')?.value || aiResult.analysis.extracted_text;
  const notebookSelect = document.getElementById('ai-notebook-select')?.value || '';
  const chapterSelect = document.getElementById('ai-chapter-select')?.value || '';

  const confirmBtn = document.getElementById('btn-confirm-ai');
  if (confirmBtn) {
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = '<span class="material-symbols-outlined text-[16px] animate-spin">progress_activity</span><span>SAVING...</span>';
  }

  try {
    const payload = {
      upload_id: aiResult.upload_id,
      title,
      content,
    };

    // Handle notebook
    if (notebookSelect === '__create__') {
      payload.create_notebook = true;
      payload.notebook_name = aiResult.analysis.suggested_notebook;
    } else if (notebookSelect) {
      payload.notebook_id = notebookSelect;
    }

    // Handle chapter
    if (chapterSelect === '__create__') {
      payload.create_chapter = true;
      payload.chapter_name = aiResult.analysis.suggested_chapter || 'AI Generated';
    } else if (chapterSelect) {
      payload.chapter_id = chapterSelect;
    }

    const page = await confirmAnalysis(payload);

    // Clear AI state
    state.camera.aiResult = null;
    state.camera.aiError = null;

    // Navigate to the created page
    const { setRoute } = await import('../state.js');
    const { getChapter } = await import('../api/chapters.js');
    const { listPages } = await import('../api/pages.js');

    // Get the chapter to find notebook_id and set up navigation state
    const chapter = await getChapter(page.chapter_id);
    const pages = await listPages(page.chapter_id);

    state.currentNotebook = { id: chapter.notebook_id };
    state.currentChapter = {
      id: page.chapter_id,
      name: chapter.name,
      pages: pages || [],
    };
    state.currentPage = page;
    state.saveStatus = 'saved';

    setRoute(`/notebooks/${chapter.notebook_id}/chapters/${page.chapter_id}`);
  } catch (err) {
    console.warn('AI confirm error:', err);
    if (confirmBtn) {
      confirmBtn.disabled = false;
      confirmBtn.innerHTML = '<span class="material-symbols-outlined text-[16px]">check</span><span>CONFIRM & SAVE</span>';
    }
    state.camera.aiError = err.message || 'Failed to save';
    notify();
  }
}

/**
 * Discards the AI analysis result and closes the modal.
 */
export function discardAIAnalysis() {
  state.camera.aiResult = null;
  state.camera.aiError = null;
  notify();
}

/**
 * Loads user gallery photos from the backend.
 */
export async function loadStoredPhotos() {
  if (!state.user) return;
  try {
    const uploads = await listGallery();
    if (Array.isArray(uploads)) {
      state.camera.capturedPhotos = uploads.map(u => ({
        id: u.id,
        url: u.url,
        timestamp: new Date(u.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date(u.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
        ratio: '4:3',
      }));
      if (state.camera.capturedPhotos.length > 0) {
        state.camera.lastCapturedPhoto = state.camera.capturedPhotos[0].url;
      }
      notify();
    }
  } catch (err) {
    console.warn('Failed to load gallery uploads from server:', err);
  }
}
