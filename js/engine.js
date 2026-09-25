/**
 * Razel 360 - Three.js 360 Panoramic WebGL Engine
 * Handles rendering, seamless equirectangular textures,
 * responsive camera, Cardboard VR stereoscopic split, and 3D hotspots.
 */

let scene, camera, renderer, sphereMesh;
let portalMeshes = [];
let infoHotspotMeshes = [];
let lon = 0, lat = 0, phi = 0, theta = 0;
let isDragging = false, dragStartX = 0, dragStartY = 0, dragStartLon = 0, dragStartLat = 0;

let currentFov = 75;
let targetFov = 75;
let initialTouchDist = 0;
let initialTouchFov = 75;

let isCardboardVR = false;
let isGyroActive = false;
let isReticleVisible = true;
let targetedPortal = null;
let dwellStartTime = 0;
const DWELL_TIMEOUT_MS = 1300;

const textureCache = new Map();
let deviceOrientation = { alpha: 0, beta: 0, gamma: 0 };
let hasAttemptedAutoGyro = false;

// ---------- THREE.JS INITIALIZATION ----------
function initThreeEngine() {
  const container = document.getElementById('canvas-container');

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(currentFov, window.innerWidth / window.innerHeight, 0.1, 1500);
  camera.target = new THREE.Vector3(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // sRGB gamma pipeline for true architectural colors
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.NoToneMapping;

  container.appendChild(renderer.domElement);

  // Inverted Sphere with scale(-1, 1, 1) for spherical projection
  const sphereGeo = new THREE.SphereGeometry(500, 96, 64);
  sphereGeo.scale(-1, 1, 1);

  const sphereMat = new THREE.MeshBasicMaterial({ color: 0x050811, toneMapped: false });
  sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
  scene.add(sphereMesh);

  initPointerControls();
  bindTouchGestures();
  bindWindowResize();
}

// Track drag movement distance so dragging never triggers a false click
let dragMovedDist = 0;

// ---------- MOUSE & POINTER INTERACTION ----------
function initPointerControls() {
  const dom = renderer.domElement;

  dom.addEventListener('pointerdown', (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    if (typeof isAutoDemoActive !== 'undefined' && isAutoDemoActive) toggleAutoDemo();
    isDragging = true;
    dragMovedDist = 0;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    dragStartLon = lon;
    dragStartLat = lat;
    checkMobileAutoGyro();
  });

  window.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const dx = dragStartX - e.clientX;
    const dy = e.clientY - dragStartY;
    dragMovedDist += Math.abs(dx) + Math.abs(dy);
    lon = dx * 0.16 + dragStartLon;
    lat = dy * 0.16 + dragStartLat;
  });

  window.addEventListener('pointerup', () => { isDragging = false; });
  window.addEventListener('pointercancel', () => { isDragging = false; });

  dom.addEventListener('wheel', (e) => {
    e.preventDefault();
    targetFov = THREE.MathUtils.clamp(targetFov + e.deltaY * 0.05, 30, 95);
  }, { passive: false });

  dom.addEventListener('dblclick', () => {
    targetFov = (targetFov < 60) ? 75 : 45;
  });

  dom.addEventListener('click', (e) => {
    if (dragMovedDist > 8) return; // Ignore clicks if user was actively dragging/rotating
    onCanvasClick(e);
  });
}

// ---------- TOUCH GESTURES (MOBILE PINCH-TO-ZOOM) ----------
function bindTouchGestures() {
  const dom = renderer.domElement;

  dom.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      isDragging = false;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      initialTouchDist = Math.hypot(dx, dy);
      initialTouchFov = targetFov;
    }
  }, { passive: true });

  dom.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2 && initialTouchDist > 0) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDist = Math.hypot(dx, dy);
      const ratio = initialTouchDist / currentDist;
      targetFov = THREE.MathUtils.clamp(initialTouchFov * ratio, 30, 95);
    }
  }, { passive: true });

  dom.addEventListener('touchend', (e) => {
    if (e.touches.length < 2) {
      initialTouchDist = 0;
    }
  }, { passive: true });
}

function bindWindowResize() {
  window.addEventListener('resize', onWindowResize);
  const observer = new ResizeObserver(() => onWindowResize());
  observer.observe(document.getElementById('canvas-container'));
}

function onWindowResize() {
  if (!renderer || !camera) return;
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}

// ---------- OPTICAL ZOOMING CONTROLS ----------
function zoomStep(direction) {
  targetFov = THREE.MathUtils.clamp(targetFov - direction * 15, 30, 95);
}

function resetZoom() {
  targetFov = 75;
}

// ---------- GYROSCOPE ORIENTATION ----------
function toggleGyroscope() {
  if (!isGyroActive) {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission().then(state => {
        if (state === 'granted') bindOrientationListener();
        else alert("Gyroscope access denied. Note: iOS requires HTTPS for device sensors.");
      }).catch(console.error);
    } else {
      bindOrientationListener();
    }
  } else {
    unbindOrientationListener();
  }
}

function bindOrientationListener() {
  window.addEventListener('deviceorientation', handleOrientationEvent, true);
  isGyroActive = true;
  const btn = document.getElementById('btn-settings-gyro');
  if (btn) {
    btn.className = "px-3 py-1 rounded-lg text-xs font-bold transition glass-active text-white";
    btn.innerText = "ON";
  }
}

function unbindOrientationListener() {
  window.removeEventListener('deviceorientation', handleOrientationEvent, true);
  isGyroActive = false;
  const btn = document.getElementById('btn-settings-gyro');
  if (btn) {
    btn.className = "px-3 py-1 rounded-lg text-xs font-bold transition glass-button text-slate-400";
    btn.innerText = "OFF";
  }
}

function handleOrientationEvent(e) {
  if (!isGyroActive || isDragging) return;
  if (e.alpha === null && e.beta === null) return;
  deviceOrientation.alpha = e.alpha ? THREE.MathUtils.degToRad(e.alpha) : 0;
  deviceOrientation.beta = e.beta ? THREE.MathUtils.degToRad(e.beta) : 0;
  deviceOrientation.gamma = e.gamma ? THREE.MathUtils.degToRad(e.gamma) : 0;

  const euler = new THREE.Euler(deviceOrientation.beta, deviceOrientation.alpha, -deviceOrientation.gamma, 'YXZ');
  camera.quaternion.setFromEuler(euler);
  camera.quaternion.multiply(new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)));
}

function checkMobileAutoGyro() {
  if (hasAttemptedAutoGyro || isGyroActive) return;
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (isMobile) {
    hasAttemptedAutoGyro = true;
    if (typeof DeviceOrientationEvent !== 'undefined') {
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission().then(state => {
          if (state === 'granted') bindOrientationListener();
        }).catch(() => {});
      } else {
        bindOrientationListener();
      }
    }
  }
}

// ---------- CARDBOARD VR STEREOSCOPIC MODE ----------
function toggleCardboardVR() {
  isCardboardVR = !isCardboardVR;
  const divider = document.getElementById('cardboard-divider');
  const btn = document.getElementById('btn-cardboard');
  const header = document.getElementById('main-header');
  const bottomDock = document.getElementById('main-bottom-dock');
  const reticle = document.getElementById('crosshair-reticle');

  if (isCardboardVR) {
    if (divider) divider.classList.remove('hidden');
    if (btn) btn.classList.add('glass-active', 'text-white');

    // In VR: hide 2D overlay so stereoscopic gaze is pure
    if (header) header.classList.add('hidden');
    if (bottomDock) bottomDock.classList.add('hidden');
    if (reticle) reticle.classList.remove('hidden');

    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => { });
    }
  } else {
    if (divider) divider.classList.add('hidden');
    if (btn) btn.classList.remove('glass-active', 'text-white');

    if (header && !isLobbyActive) header.classList.remove('hidden');
    if (bottomDock && !isLobbyActive) bottomDock.classList.remove('hidden');

    if (document.exitFullscreen && document.fullscreenElement) {
      document.exitFullscreen().catch(() => { });
    }
  }
  onWindowResize();
}

// ---------- SEAMLESS TEXTURE PIPELINE ----------
function createSeamlessTexture(imgElement) {
  const canvas = document.createElement('canvas');
  canvas.width = imgElement.width || imgElement.naturalWidth || 2048;
  canvas.height = imgElement.height || imgElement.naturalHeight || 1024;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);

  const blendWidth = Math.min(20, Math.floor(canvas.width * 0.015));
  if (blendWidth > 1) {
    try {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imgData.data;
      const w = canvas.width;
      const h = canvas.height;

      // Sample seam difference between left and right edges
      let seamDiff = 0;
      const step = Math.max(1, Math.floor(h / 32));
      let samples = 0;
      for (let y = 0; y < h; y += step) {
        const l = (y * w) * 4;
        const r = (y * w + (w - 1)) * 4;
        seamDiff += Math.abs(d[l] - d[r]) + Math.abs(d[l + 1] - d[r + 1]) + Math.abs(d[l + 2] - d[r + 2]);
        samples += 3;
      }
      const avgDiff = seamDiff / samples;

      // If average difference > 1.5, feather blend edges
      if (avgDiff > 1.5) {
        for (let y = 0; y < h; y++) {
          for (let i = 0; i < blendWidth; i++) {
            const leftIdx = (y * w + i) * 4;
            const rightIdx = (y * w + (w - 1 - i)) * 4;
            const weight = (i + 1) / (blendWidth * 2);

            for (let c = 0; c < 3; c++) {
              const blended = Math.round(d[leftIdx + c] * (1 - weight) + d[rightIdx + c] * weight);
              d[leftIdx + c] = blended;
              d[rightIdx + c] = blended;
            }
          }
        }
        ctx.putImageData(imgData, 0, 0);
      }
    } catch (e) { }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.encoding = THREE.sRGBEncoding;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  if (renderer && renderer.capabilities && renderer.capabilities.getMaxAnisotropy) {
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  }
  return texture;
}

function loadSeamlessTexture(imageSrc, callback) {
  if (textureCache.has(imageSrc)) {
    callback(textureCache.get(imageSrc));
    return;
  }

  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => {
    const texture = createSeamlessTexture(img);
    textureCache.set(imageSrc, texture);
    callback(texture);
  };
  img.onerror = () => {
    const fallbackLoader = new THREE.TextureLoader();
    fallbackLoader.load(imageSrc, (tex) => {
      tex.encoding = THREE.sRGBEncoding;
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      textureCache.set(imageSrc, tex);
      callback(tex);
    });
  };
  img.src = imageSrc;
}

// ---------- 3D HOTSPOTS & BILLBOARD ENGINE ----------
function clearHotspotMeshes() {
  if (portalMeshes) {
    portalMeshes.forEach(m => scene.remove(m));
    portalMeshes = [];
  }
  if (infoHotspotMeshes) {
    infoHotspotMeshes.forEach(m => {
      if (m.userData.card && m.userData.card.material && m.userData.card.material.map) {
        m.userData.card.material.map.dispose();
      }
      scene.remove(m);
    });
    infoHotspotMeshes = [];
  }
}

function rebuildHotspotMeshes() {
  clearHotspotMeshes();

  const current = getActiveScene();
  if (!current || !current.hotspots) return;

  current.hotspots.forEach(hs => {
    if (hs.type === 'info') {
      create3DCalloutMesh(hs);
    } else {
      create3DPortalDoorstepMesh(hs);
    }
  });
}

function create3DPortalDoorstepMesh(hs) {
  const portalGroup = new THREE.Group();
  const tour = getActiveTour();
  const targetScene = tour.scenes.find(s => s.id === hs.targetSceneId);
  const targetName = targetScene ? targetScene.name : 'Next Room';

  const doorCanvas = document.createElement('canvas');
  doorCanvas.width = 256;
  doorCanvas.height = 512;
  const dctx = doorCanvas.getContext('2d');

  dctx.clearRect(0, 0, 256, 512);
  dctx.beginPath();
  roundRect(dctx, 16, 16, 224, 480, 28);
  dctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
  dctx.fill();
  dctx.lineWidth = 8;
  dctx.strokeStyle = '#ffffff';
  dctx.stroke();

  // Red-ink Header Accent line
  dctx.beginPath();
  dctx.moveTo(32, 70);
  dctx.lineTo(224, 70);
  dctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
  dctx.lineWidth = 4;
  dctx.stroke();

  // Door Icon
  dctx.beginPath();
  dctx.arc(128, 160, 48, 0, Math.PI * 2);
  dctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
  dctx.fill();
  dctx.strokeStyle = '#ef4444';
  dctx.lineWidth = 4;
  dctx.stroke();

  dctx.beginPath();
  dctx.arc(128, 160, 14, 0, Math.PI * 2);
  dctx.fillStyle = '#ffffff';
  dctx.fill();

  dctx.fillStyle = '#ffffff';
  dctx.font = 'bold 30px "Outfit", sans-serif';
  dctx.textAlign = 'center';
  dctx.textBaseline = 'middle';
  dctx.fillText("ENTER", 128, 250);

  dctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
  dctx.fillStyle = '#fca5a5';
  dctx.fillText(truncateText(dctx, targetName, 190), 128, 300);

  dctx.fillStyle = '#ffffff';
  dctx.font = '40px sans-serif';
  dctx.fillText("▲", 128, 380);

  const doorTex = new THREE.CanvasTexture(doorCanvas);
  doorTex.encoding = THREE.sRGBEncoding;

  const doorGeo = new THREE.PlaneGeometry(24, 48);
  const doorMat = new THREE.MeshBasicMaterial({
    map: doorTex,
    transparent: true,
    opacity: 0.95,
    side: THREE.DoubleSide,
    depthTest: false
  });
  const doorMesh = new THREE.Mesh(doorGeo, doorMat);
  doorMesh.position.y = 22;
  doorMesh.renderOrder = 900;
  portalGroup.add(doorMesh);

  // Floor Doorstep Mat
  const floorMatGeo = new THREE.PlaneGeometry(22, 14);
  const floorMatCanvas = document.createElement('canvas');
  floorMatCanvas.width = 128;
  floorMatCanvas.height = 128;
  const fctx = floorMatCanvas.getContext('2d');
  fctx.clearRect(0, 0, 128, 128);
  fctx.beginPath();
  roundRect(fctx, 8, 8, 112, 112, 16);
  fctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
  fctx.fill();
  fctx.lineWidth = 6;
  fctx.strokeStyle = '#ffffff';
  fctx.stroke();

  const floorMatTex = new THREE.CanvasTexture(floorMatCanvas);
  const floorMatMaterial = new THREE.MeshBasicMaterial({
    map: floorMatTex,
    transparent: true,
    opacity: 0.85,
    side: THREE.DoubleSide
  });
  const floorMatMesh = new THREE.Mesh(floorMatGeo, floorMatMaterial);
  floorMatMesh.rotation.x = Math.PI / 2;
  floorMatMesh.position.y = -1;
  portalGroup.add(floorMatMesh);

  portalGroup.position.set(hs.x, hs.y, hs.z);
  portalGroup.lookAt(0, 0, 0);

  portalGroup.userData = {
    id: hs.id,
    type: 'portal',
    targetSceneId: hs.targetSceneId,
    doorMesh: doorMesh
  };

  scene.add(portalGroup);
  portalMeshes.push(portalGroup);
}

function create3DCalloutMesh(hs) {
  const group = new THREE.Group();
  group.position.set(hs.x, hs.y, hs.z);

  // Tiny Beacon Dot
  const dotGeo = new THREE.SphereGeometry(2.0, 16, 16);
  const dotMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
  const dot = new THREE.Mesh(dotGeo, dotMat);
  group.add(dot);

  // Glowing Halo
  const pulseGeo = new THREE.RingGeometry(2.5, 4.5, 24);
  const pulseMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.8
  });
  const pulseRing = new THREE.Mesh(pulseGeo, pulseMat);
  group.add(pulseRing);

  // Leader Stem Line
  const STEM_MAX_HEIGHT = 38;
  const stemGeo = new THREE.CylinderGeometry(0.7, 0.7, STEM_MAX_HEIGHT, 8);
  stemGeo.translate(0, STEM_MAX_HEIGHT / 2, 0);
  const stemMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 });
  const stemMesh = new THREE.Mesh(stemGeo, stemMat);
  group.add(stemMesh);

  // Arrow Head
  const arrowGeo = new THREE.ConeGeometry(2.2, 5.0, 16);
  const arrowMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0 });
  const arrowMesh = new THREE.Mesh(arrowGeo, arrowMat);
  arrowMesh.position.set(0, STEM_MAX_HEIGHT, 0);
  group.add(arrowMesh);

  // Billboard Specification Card
  const cardTex = createLuxuryCalloutTexture(hs);
  const cardGeo = new THREE.PlaneGeometry(62, 31);
  const cardMat = new THREE.MeshBasicMaterial({
    map: cardTex,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    depthTest: false
  });
  const cardMesh = new THREE.Mesh(cardGeo, cardMat);
  cardMesh.position.set(0, STEM_MAX_HEIGHT + 18, 0);
  cardMesh.renderOrder = 999;
  group.add(cardMesh);

  group.lookAt(0, 0, 0);

  group.userData = {
    id: hs.id,
    type: 'info',
    title: hs.title,
    itemData: hs,
    dot: dot,
    pulse: pulseRing,
    stem: stemMesh,
    arrow: arrowMesh,
    card: cardMesh,
    maxStemHeight: STEM_MAX_HEIGHT,
    animProgress: 0.0,
    hasPoppedSound: false
  };

  scene.add(group);
  infoHotspotMeshes.push(group);
}

function createLuxuryCalloutTexture(item) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const cardX = 36;
  const cardY = 32;
  const cardW = 952;
  const cardH = 430;
  const radius = 32;

  // Glass Card Background
  ctx.beginPath();
  roundRect(ctx, cardX, cardY, cardW, cardH, radius);
  ctx.fillStyle = 'rgba(10, 14, 23, 0.96)';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
  ctx.stroke();

  // Category Tag Pill
  const tagText = (item.tag || 'SPECIFICATION').toUpperCase();
  ctx.beginPath();
  roundRect(ctx, cardX + 44, cardY + 44, 320, 52, 14);
  ctx.fillStyle = 'rgba(239, 68, 68, 0.16)';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cardX + 70, cardY + 70, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#ef4444';
  ctx.fill();

  ctx.fillStyle = '#fca5a5';
  ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(truncateText(ctx, tagText, 250), cardX + 86, cardY + 70);

  // Price Badge Pill
  if (item.price && item.price.trim().length > 0) {
    ctx.beginPath();
    roundRect(ctx, cardX + cardW - 240, cardY + 44, 196, 52, 14);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.fillStyle = '#0a0e17';
    ctx.font = 'bold 28px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(item.price.trim(), cardX + cardW - 142, cardY + 70);
  }

  // Item Title
  ctx.beginPath();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 44px "Outfit", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(truncateText(ctx, item.title || 'Featured Detail', 860), cardX + 44, cardY + 165);

  // Hairline Divider
  ctx.beginPath();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
  ctx.lineWidth = 2;
  ctx.moveTo(cardX + 44, cardY + 200);
  ctx.lineTo(cardX + cardW - 44, cardY + 200);
  ctx.stroke();

  // Description Text
  if (item.description && item.description.trim()) {
    ctx.beginPath();
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '31px "Plus Jakarta Sans", sans-serif';
    ctx.textBaseline = 'alphabetic';
    wrapText(ctx, item.description, cardX + 44, cardY + 265, 860, 44, 3);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.encoding = THREE.sRGBEncoding;
  return texture;
}

function roundRect(ctx, x, y, width, height, radius) {
  if (ctx.roundRect) {
    ctx.roundRect(x, y, width, height, radius);
  } else {
    ctx.rect(x, y, width, height);
  }
}

function truncateText(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let str = text;
  while (str.length > 0 && ctx.measureText(str + '...').width > maxWidth) {
    str = str.slice(0, -1);
  }
  return str + '...';
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
  const words = text.split(' ');
  let line = '';
  let curY = y;
  let lines = 0;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    if (ctx.measureText(testLine).width > maxWidth && n > 0) {
      ctx.fillText(line, x, curY);
      line = words[n] + ' ';
      curY += lineHeight;
      lines++;
      if (lines >= maxLines - 1 && n < words.length - 1) {
        let lastLine = line;
        for (let k = n + 1; k < words.length; k++) lastLine += words[k] + ' ';
        while (lastLine.length > 0 && ctx.measureText(lastLine + '...').width > maxWidth) {
          lastLine = lastLine.slice(0, -1);
        }
        ctx.fillText(lastLine + '...', x, curY);
        return;
      }
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, curY);
}

// ---------- GAZE OVERLAY & BILLBOARD ANIMATIONS ----------
function checkHotspotHover() {
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);

  const camForward = new THREE.Vector3();
  camera.getWorldDirection(camForward);

  let activeCallout = null;

  infoHotspotMeshes.forEach(group => {
    const hsPos = group.position.clone().normalize();
    const alignment = camForward.dot(hsPos);
    const isTargeted = alignment > 0.965;

    if (isTargeted) activeCallout = group;

    const animSpeed = isTargeted ? 0.09 : -0.12;
    group.userData.animProgress = THREE.MathUtils.clamp(group.userData.animProgress + animSpeed, 0, 1);

    if (isTargeted && group.userData.animProgress > 0.45 && !group.userData.hasPoppedSound) {
      playPopSound();
      group.userData.hasPoppedSound = true;
    } else if (!isTargeted && group.userData.animProgress <= 0.05) {
      group.userData.hasPoppedSound = false;
    }

    const { stem, arrow, card, pulse, maxStemHeight } = group.userData;
    const t = group.userData.animProgress;

    const stemProgress = Math.min(1.0, t / 0.45);
    stem.scale.set(1, stemProgress, 1);
    stem.material.opacity = stemProgress * 0.9;

    const curHeight = maxStemHeight * stemProgress;
    arrow.position.set(0, curHeight, 0);
    arrow.scale.set(stemProgress, stemProgress, stemProgress);
    arrow.material.opacity = stemProgress;

    const cardProgress = Math.max(0.0, (t - 0.4) / 0.6);
    const zoomRatio = (camera.fov / 75);
    const cardScale = THREE.MathUtils.lerp(0.1, 1.0, cardProgress) * Math.max(0.9, zoomRatio);

    card.scale.set(cardScale, cardScale, cardScale);
    card.material.opacity = cardProgress;

    if (isTargeted) {
      pulse.scale.lerp(new THREE.Vector3(1.35, 1.35, 1.35), 0.2);
    } else {
      pulse.scale.lerp(new THREE.Vector3(1.0, 1.0, 1.0), 0.15);
    }
  });

  portalMeshes.forEach(group => {
    if (group.userData.doorMesh) {
      group.lookAt(camera.position.x, group.position.y, camera.position.z);
    }
  });

  const dot = document.getElementById('reticle-dot');
  if (dot && !targetedPortal) {
    if (activeCallout) {
      dot.classList.add('scale-150');
    } else {
      dot.classList.remove('scale-150');
    }
  }

  checkPortalTeleport(raycaster);
}

function checkPortalTeleport(raycaster) {
  if (portalMeshes.length === 0) {
    resetDwellTimer();
    return;
  }

  const hits = raycaster.intersectObjects(portalMeshes, true);
  const dwellRing = document.getElementById('dwell-ring');
  const dot = document.getElementById('reticle-dot');

  if (hits.length > 0) {
    let root = hits[0].object;
    while (root.parent && root.parent !== scene) root = root.parent;

    const targetId = root.userData.targetSceneId;
    if (!targetId) return;

    if (targetedPortal !== targetId) {
      targetedPortal = targetId;
      dwellStartTime = performance.now();
      if (dot) dot.classList.add('scale-150');
    } else {
      const elapsed = performance.now() - dwellStartTime;
      const progress = Math.min(elapsed / DWELL_TIMEOUT_MS, 1);
      if (dwellRing) dwellRing.style.strokeDashoffset = 100 - (progress * 100);

      if (elapsed >= DWELL_TIMEOUT_MS) {
        resetDwellTimer();
        switchScene(targetId, true);
      }
    }
  } else {
    resetDwellTimer();
  }
}

function resetDwellTimer() {
  targetedPortal = null;
  dwellStartTime = 0;
  const dwellRing = document.getElementById('dwell-ring');
  const dot = document.getElementById('reticle-dot');
  if (dwellRing) dwellRing.style.strokeDashoffset = 100;
  if (dot && !infoHotspotMeshes.some(g => g.userData.animProgress > 0.1)) {
    dot.classList.remove('scale-150');
  }
}

function onCanvasClick(e) {
  if (isCardboardVR) {
    targetFov = (targetFov < 60) ? 75 : 45;
    return;
  }

  if (isPlacementArmed) {
    const mouse = new THREE.Vector2(
      (e.clientX / window.innerWidth) * 2 - 1,
      -(e.clientY / window.innerHeight) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObject(sphereMesh);

    if (hits.length > 0) {
      const point = hits[0].point.clone().normalize().multiplyScalar(400);
      const curScene = getActiveScene();

      if (placementType === 'info') {
        const title = document.getElementById('info-title-input').value.trim() || 'Featured Detail';
        const tag = document.getElementById('info-tag-input').value.trim() || 'FURNITURE';
        const price = document.getElementById('info-price-input').value.trim();
        const desc = document.getElementById('info-desc-input').value.trim();

        curScene.hotspots.push({
          id: 'info_' + Date.now(),
          type: 'info',
          title: title,
          tag: tag,
          price: price,
          description: desc,
          x: point.x, y: point.y, z: point.z
        });
      } else {
        const targetId = document.getElementById('portal-target-select').value;
        curScene.hotspots.push({
          id: 'portal_' + Date.now(),
          type: 'portal',
          targetSceneId: targetId,
          x: point.x, y: point.y, z: point.z
        });
      }

      saveAppStorage();
      rebuildHotspotMeshes();
      renderAllUI();
      cancelPlacement();
      playPopSound();
    }
    return;
  }

  // Click teleport on doorways
  const clickRaycaster = new THREE.Raycaster();
  clickRaycaster.setFromCamera(new THREE.Vector2(
    (e.clientX / window.innerWidth) * 2 - 1,
    -(e.clientY / window.innerHeight) * 2 + 1
  ), camera);

  const portalHits = clickRaycaster.intersectObjects(portalMeshes, true);
  if (portalHits.length > 0) {
    let root = portalHits[0].object;
    while (root.parent && root.parent !== scene) root = root.parent;
    const targetId = root.userData.targetSceneId;
    if (targetId) switchScene(targetId, true);
  }
}

// ---------- MAIN RENDER LOOP ----------
function renderLoop() {
  requestAnimationFrame(renderLoop);

  // Slow ambient drift when in Lobby or Auto Demo (only when user is not manually dragging)
  if (!isDragging) {
    if (isLobbyActive) {
      lon += 0.035;
    } else if (isAutoDemoActive) {
      lon += 0.08;
    }
  }

  // Smooth Optical Zoom Interpolation
  if (Math.abs(camera.fov - targetFov) > 0.05) {
    camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, 0.15);
    camera.updateProjectionMatrix();
    const pct = Math.round((75 / camera.fov) * 100);
    const zoomText = document.getElementById('zoom-level-text');
    if (zoomText) zoomText.innerText = `${pct}%`;
  }

  // Manual rotation calculation if gyroscope is inactive
  if (!isGyroActive) {
    lat = Math.max(-85, Math.min(85, lat));
    phi = THREE.MathUtils.degToRad(90 - lat);
    theta = THREE.MathUtils.degToRad(lon);

    const target = new THREE.Vector3();
    target.x = 500 * Math.sin(phi) * Math.cos(theta);
    target.y = 500 * Math.cos(phi);
    target.z = 500 * Math.sin(phi) * Math.sin(theta);
    camera.lookAt(target);
  }

  // Check 3D Hotspot Hovering & Billboard Animations in Studio
  if (!isLobbyActive) {
    checkHotspotHover();
  }

  // Stereoscopic split-screen rendering for Cardboard VR
  const w = window.innerWidth;
  const h = window.innerHeight;

  if (isCardboardVR) {
    renderer.setScissorTest(true);

    // Left Eye Viewport
    renderer.setViewport(0, 0, w / 2, h);
    renderer.setScissor(0, 0, w / 2, h);
    camera.aspect = (w / 2) / h;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);

    // Right Eye Viewport
    renderer.setViewport(w / 2, 0, w / 2, h);
    renderer.setScissor(w / 2, 0, w / 2, h);
    camera.aspect = (w / 2) / h;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);

    renderer.setScissorTest(false);
  } else {
    renderer.setViewport(0, 0, w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  }
}
