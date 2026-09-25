/**
 * Razel 360 - Main Application Logic & Storyboard Controller
 * Manages tour state, scene transitions, interactive storyboard,
 * UI reactivity, and JSON import/export.
 */

// Global Application State
let appData = {
  activeTourId: 'tour_villa_lumina',
  activeSceneId: 'scene_exterior',
  tours: []
};

let isLobbyActive = true;
let isAutoDemoActive = false;
let autoDemoTimer = null;
let isEditorOpen = false;
let placementState = null; // { type: 'portal' | 'info' }

// ---------- INITIALIZATION & STORAGE ----------
function initApp() {
  loadAppStorage();
  initThreeEngine();
  loadLobbyScene();

  // Hide initial loading preloader after assets initialize
  setTimeout(() => {
    const preloader = document.getElementById('initial-preloader');
    if (preloader) {
      preloader.style.opacity = '0';
      setTimeout(() => preloader.remove(), 500);
    }
  }, 450);
}

function loadAppStorage() {
  const STORAGE_KEY = 'razel_360_v4_tours';
  const legacyKey = 'lumina_360_multi_tours_data';
  try {
    localStorage.removeItem(legacyKey);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Guarantee canonical fresh demos are updated
        const customTours = parsed.filter(t => t.id !== DEMO_VILLA_LUMINA.id && t.id !== DEMO_PALM_ROYALE.id);
        appData.tours = [DEMO_VILLA_LUMINA, DEMO_PALM_ROYALE, ...customTours];
        return;
      }
    }
  } catch (e) {
    console.warn('LocalStorage load warning:', e);
  }
  appData.tours = [DEMO_VILLA_LUMINA, DEMO_PALM_ROYALE];
}

function saveAppStorage() {
  const STORAGE_KEY = 'razel_360_v4_tours';
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData.tours));
  } catch (e) {
    console.warn('LocalStorage save failed:', e);
  }
}

function getCurrentTour() {
  let tour = appData.tours.find(t => t.id === appData.activeTourId);
  if (!tour) {
    tour = appData.tours[0] || DEMO_VILLA_LUMINA;
    appData.activeTourId = tour.id;
  }
  return tour;
}

function getCurrentScene() {
  const tour = getCurrentTour();
  let scene = tour.scenes.find(s => s.id === appData.activeSceneId);
  if (!scene) {
    scene = tour.scenes[0];
    appData.activeSceneId = scene ? scene.id : '';
  }
  return scene;
}

// ---------- STORYBOARD FLOW CONTROLLER ----------

/**
 * Scene 1: Grand Architectural Lobby
 * Shows only the floating center START button.
 * Viewport is free for 360 exploration.
 */
function loadLobbyScene() {
  isLobbyActive = true;
  if (isAutoDemoActive) toggleAutoDemo();

  // Hide Tour Studio UI
  const header = document.getElementById('main-header');
  const bottomDock = document.getElementById('main-bottom-dock');
  const reticle = document.getElementById('crosshair-reticle');
  const editorDrawer = document.getElementById('editor-drawer');

  if (header) header.classList.add('hidden');
  if (bottomDock) bottomDock.classList.add('hidden');
  if (reticle) reticle.classList.add('hidden');
  if (editorDrawer) editorDrawer.classList.add('translate-x-full');

  // Storyboard Step 1: Show Hero Start Button, hide Showcase Selector
  const heroWrapper = document.getElementById('hero-start-wrapper');
  const showcaseModal = document.getElementById('showcase-selector-modal');

  if (heroWrapper) {
    heroWrapper.classList.remove('hidden');
    heroWrapper.style.opacity = '1';
  }
  if (showcaseModal) {
    showcaseModal.classList.add('hidden');
  }

  // Clear scene meshes & load 360 Lobby Sphere Asset
  clearSceneHotspots();
  loadEquirectangularTexture('./assets/lobby/lobby_360.jpg');
}

/**
 * Storyboard Step 2: Triggered by clicking START 360° VR SHOWCASE button.
 * Fades out Start button and brings up the showcase selector.
 */
function openShowcaseSelector() {
  const heroWrapper = document.getElementById('hero-start-wrapper');
  const showcaseModal = document.getElementById('showcase-selector-modal');

  if (heroWrapper) {
    heroWrapper.classList.add('hidden');
  }
  if (showcaseModal) {
    showcaseModal.classList.remove('hidden');
    showcaseModal.style.opacity = '1';
  }
}

/**
 * Return back to Storyboard Step 1 (Hero Start Button)
 */
function closeShowcaseSelector() {
  const heroWrapper = document.getElementById('hero-start-wrapper');
  const showcaseModal = document.getElementById('showcase-selector-modal');

  if (showcaseModal) {
    showcaseModal.classList.add('hidden');
  }
  if (heroWrapper) {
    heroWrapper.classList.remove('hidden');
  }
}

/**
 * Storyboard Step 3: Triggered by selecting a property showcase.
 * Loads the selected tour and transitions into Tour Studio.
 */
function enterTour(tourId, isVR = false) {
  enterTourStudio(tourId, isVR);
}

function enterTourStudio(tourId, isVR = false) {
  isLobbyActive = false;
  appData.activeTourId = tourId;
  const tour = getCurrentTour();
  appData.activeSceneId = tour.scenes[0] ? tour.scenes[0].id : '';

  // Hide Lobby overlays
  const heroWrapper = document.getElementById('hero-start-wrapper');
  const showcaseModal = document.getElementById('showcase-selector-modal');
  if (heroWrapper) heroWrapper.classList.add('hidden');
  if (showcaseModal) showcaseModal.classList.add('hidden');

  // Reveal Tour Studio UI
  const header = document.getElementById('main-header');
  const bottomDock = document.getElementById('main-bottom-dock');
  const reticle = document.getElementById('crosshair-reticle');

  if (header) header.classList.remove('hidden');
  if (bottomDock) bottomDock.classList.remove('hidden');
  if (reticle && !isCardboardVR) reticle.classList.remove('hidden');

  // Load first scene of tour
  switchScene(appData.activeSceneId, false);
  renderAllUI();

  if (isVR && !isCardboardVR) {
    setTimeout(() => { toggleCardboardVR(); }, 300);
  }
}

function launchTourWithVR() {
  openShowcaseSelector();
}

function returnToLobby() {
  if (isCardboardVR) toggleCardboardVR();
  loadLobbyScene();
}

// ---------- SCENE TRANSITIONS & ENGINE SYNC ----------
function switchScene(sceneId, isWalkThrough = false) {
  const tour = getCurrentTour();
  const sceneObj = tour.scenes.find(s => s.id === sceneId);
  if (!sceneObj) return;

  appData.activeSceneId = sceneId;

  // Flash black curtain for seamless room-to-room optical transition
  const curtain = document.getElementById('transition-curtain');
  if (curtain) {
    curtain.style.opacity = '1';
    curtain.style.pointerEvents = 'auto';
  }

  if (isWalkThrough) {
    playWhooshSound();
  }

  setTimeout(() => {
    loadEquirectangularTexture(sceneObj.imageSrc);
    rebuildHotspotMeshes();
    renderAllUI();

    setTimeout(() => {
      if (curtain) {
        curtain.style.opacity = '0';
        curtain.style.pointerEvents = 'none';
      }
    }, 180);
  }, 120);
}

// ---------- UI REACTIVE RENDERING ----------
function renderAllUI() {
  const tour = getCurrentTour();
  const scene = getCurrentScene();
  if (!tour || !scene) return;

  // Header property and scene titles
  const headerTourName = document.getElementById('header-tour-name');
  if (headerTourName) headerTourName.innerText = tour.title.split('|')[0].trim();

  const sceneIndex = tour.scenes.findIndex(s => s.id === scene.id);
  const headerRoomStep = document.getElementById('header-room-step');
  if (headerRoomStep) headerRoomStep.innerText = `Room ${sceneIndex + 1} of ${tour.scenes.length}:`;

  const headerRoomTitle = document.getElementById('header-room-title');
  if (headerRoomTitle) headerRoomTitle.innerText = scene.name;

  renderThumbnails();
  renderHotspotList();
  renderPortalTargetDropdown();
}

function renderThumbnails() {
  const tour = getCurrentTour();
  const container = document.getElementById('room-thumbnails-container');
  if (!container || !tour) return;

  container.innerHTML = '';
  tour.scenes.forEach((sc, idx) => {
    const isActive = sc.id === appData.activeSceneId;
    const thumb = document.createElement('div');
    thumb.className = `flex-shrink-0 cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 relative group ${isActive ? 'ring-2 ring-rose-500 scale-105 shadow-[0_0_20px_rgba(239,68,68,0.5)]' : 'opacity-70 hover:opacity-100 hover:scale-100'
      }`;
    thumb.style.width = '120px';
    thumb.style.height = '68px';
    thumb.onclick = () => switchScene(sc.id, true);

    thumb.innerHTML = `
      <img src="${sc.imageSrc}" alt="${sc.name}" class="w-full h-full object-cover">
      <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-1.5">
        <span class="text-[9px] font-mono text-rose-400 font-bold">0${idx + 1}</span>
        <span class="text-[10px] font-semibold text-white truncate font-display leading-tight">${sc.name}</span>
      </div>
    `;
    container.appendChild(thumb);
  });
}

function renderHotspotList() {
  const scene = getCurrentScene();
  const listEl = document.getElementById('editor-hotspots-list');
  if (!listEl || !scene) return;

  listEl.innerHTML = '';
  if (!scene.hotspots || scene.hotspots.length === 0) {
    listEl.innerHTML = `<p class="text-xs text-slate-500 italic py-2">No hotspots in this room yet.</p>`;
    return;
  }

  scene.hotspots.forEach((hs, i) => {
    const item = document.createElement('div');
    item.className = "flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition text-xs";
    const isPortal = hs.type === 'portal';

    item.innerHTML = `
      <div class="flex items-center space-x-2 truncate">
        <i class="fa-solid ${isPortal ? 'fa-door-open text-rose-400' : 'fa-circle-dot text-rose-500'}"></i>
        <div class="truncate">
          <p class="font-semibold text-white truncate">${isPortal ? ('Doorway: ' + (hs.targetSceneId || 'Next Room')) : (hs.title || 'Item Callout')}</p>
          <p class="text-[10px] text-slate-400 font-mono">[${Math.round(hs.x)}, ${Math.round(hs.y)}, ${Math.round(hs.z)}]</p>
        </div>
      </div>
      <button onclick="deleteHotspot('${hs.id}')" class="text-slate-500 hover:text-rose-400 p-1 transition" title="Delete">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    `;
    listEl.appendChild(item);
  });
}

function renderPortalTargetDropdown() {
  const select = document.getElementById('portal-target-select');
  if (!select) return;
  const tour = getCurrentTour();
  select.innerHTML = '';
  tour.scenes.forEach(sc => {
    if (sc.id !== appData.activeSceneId) {
      const opt = document.createElement('option');
      opt.value = sc.id;
      opt.innerText = sc.name;
      opt.className = "bg-neutral-900 text-white";
      select.appendChild(opt);
    }
  });
}

// ---------- EDITOR WORKFLOW ----------
function toggleEditorDrawer() {
  isEditorOpen = !isEditorOpen;
  const drawer = document.getElementById('editor-drawer');
  const btn = document.getElementById('btn-toggle-editor');
  if (drawer) {
    if (isEditorOpen) drawer.classList.remove('translate-x-full');
    else drawer.classList.add('translate-x-full');
  }
  if (btn) {
    if (isEditorOpen) btn.classList.add('glass-active');
    else btn.classList.remove('glass-active');
  }
}

function armPlacement(type) {
  placementState = { type: type };
  const alertEl = document.getElementById('placement-alert');
  const textEl = document.getElementById('placement-alert-text');
  if (alertEl) alertEl.classList.remove('hidden');
  if (textEl) {
    textEl.innerText = type === 'portal'
      ? 'Click anywhere on the floor/doorway to position portal'
      : 'Click on any item in room to position price beacon';
  }
}

function cancelPlacement() {
  placementState = null;
  const alertEl = document.getElementById('placement-alert');
  if (alertEl) alertEl.classList.add('hidden');
}

function deleteHotspot(id) {
  const scene = getCurrentScene();
  if (!scene || !scene.hotspots) return;
  scene.hotspots = scene.hotspots.filter(h => h.id !== id);
  saveAppStorage();
  rebuildHotspotMeshes();
  renderAllUI();
}

// ---------- AUTONOMOUS DEMO WALKTHROUGH ----------
function toggleAutoDemo() {
  isAutoDemoActive = !isAutoDemoActive;
  const btn = document.getElementById('btn-auto-demo');
  const label = document.getElementById('demo-btn-label');
  const icon = document.getElementById('demo-btn-icon');

  if (isAutoDemoActive) {
    if (btn) btn.classList.add('glass-active');
    if (label) label.innerText = 'Pause Demo';
    if (icon) icon.className = 'fa-solid fa-pause text-[10px] text-rose-400';
    startAutoDemoSequence();
  } else {
    if (btn) btn.classList.remove('glass-active');
    if (label) label.innerText = 'Auto Demo';
    if (icon) icon.className = 'fa-solid fa-play text-[10px] text-rose-400';
    if (autoDemoTimer) clearTimeout(autoDemoTimer);
  }
}

function startAutoDemoSequence() {
  if (!isAutoDemoActive) return;
  autoDemoTimer = setTimeout(() => {
    if (!isAutoDemoActive) return;
    const tour = getCurrentTour();
    const curIdx = tour.scenes.findIndex(s => s.id === appData.activeSceneId);
    const nextIdx = (curIdx + 1) % tour.scenes.length;
    switchScene(tour.scenes[nextIdx].id, true);
    startAutoDemoSequence();
  }, 7500);
}

// ---------- JSON IMPORT / EXPORT LIFECYCLE ----------
function exportCurrentTourJSON() {
  const tour = getCurrentTour();
  const payload = {
    app: "Razel360",
    version: "2.5",
    author: "Razel Tech",
    exportedAt: new Date().toISOString(),
    tour: tour
  };

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `${tour.id}_export.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast("Tour exported successfully as JSON!");
}

function importTourJSON(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const parsed = JSON.parse(e.target.result);
      const importedTour = parsed.tour ? parsed.tour : parsed;
      if (!importedTour.id || !importedTour.scenes || !Array.isArray(importedTour.scenes)) {
        alert("Invalid Razel 360 Tour schema format.");
        return;
      }

      const existingIdx = appData.tours.findIndex(t => t.id === importedTour.id);
      if (existingIdx >= 0) {
        appData.tours[existingIdx] = importedTour;
      } else {
        appData.tours.push(importedTour);
      }

      saveAppStorage();
      enterTourStudio(importedTour.id, false);
      showToast("Custom tour imported successfully!");
    } catch (err) {
      alert("Error parsing JSON tour file: " + err.message);
    }
  };
  reader.readAsText(file);
}

// ---------- SHARING & TOAST FEEDBACK ----------
function shareTour() {
  const url = window.location.href;
  const tour = getCurrentTour();
  const shareData = {
    title: tour ? tour.title : 'Razel 360 | Luxury Virtual Showcase',
    text: 'Step inside this photorealistic 360° architectural showcase with Razel 360 VR.',
    url: url
  };

  if (navigator.share && !window.location.protocol.includes('http:')) {
    navigator.share(shareData).catch(() => copyToClipboard(url));
  } else {
    copyToClipboard(url);
  }
}

function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast("Link copied to clipboard!");
    }).catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    showToast("Link copied to clipboard!");
  } catch (err) {
    alert("Copy failed. Link: " + text);
  }
  document.body.removeChild(textArea);
}

function showToast(message) {
  const toast = document.getElementById('toast-notification');
  const msgEl = document.getElementById('toast-message');
  if (!toast || !msgEl) return;
  msgEl.innerText = message;
  toast.style.opacity = '1';
  toast.style.transform = 'translate(-50%, 0)';
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translate(-50%, -10px)';
  }, 2500);
}

// ---------- COLLAPSIBLE DOCK & SETTINGS MODAL ----------
function toggleBottomStripCollapse() {
  const container = document.getElementById('room-thumbnails-container');
  const icon = document.getElementById('strip-collapse-icon');
  if (!container) return;

  if (container.classList.contains('hidden')) {
    container.classList.remove('hidden');
    if (icon) icon.className = "fa-solid fa-chevron-down text-slate-400";
  } else {
    container.classList.add('hidden');
    if (icon) icon.className = "fa-solid fa-chevron-up text-slate-400";
  }
}

function toggleSettingsModal() {
  const modal = document.getElementById('modal-settings');
  if (!modal) return;
  if (modal.classList.contains('hidden')) modal.classList.remove('hidden');
  else modal.classList.add('hidden');
}

function exitMobileFullscreenOrRestoreUI() {
  if (document.fullscreenElement && document.exitFullscreen) {
    document.exitFullscreen().catch(() => { });
  }
  const header = document.getElementById('main-header');
  const bottomDock = document.getElementById('main-bottom-dock');
  if (header && !isLobbyActive) header.classList.remove('hidden');
  if (bottomDock && !isLobbyActive) bottomDock.classList.remove('hidden');
}

// Window load trigger
window.addEventListener('DOMContentLoaded', () => {
  initApp();
});
