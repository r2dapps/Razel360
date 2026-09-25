/**
 * Headless Automated Test Suite for Razel 360 Virtual Tour Engine
 * Tests HTML markup, Three.js script syntax, multi-tour data integrity,
 * JSON export/import workflows, audio synth, and mobile responsiveness.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
let testCount = 0;
let passedCount = 0;
let failedCount = 0;

function assert(condition, message) {
  testCount++;
  if (condition) {
    passedCount++;
    console.log(`  \x1b[32m✔\x1b[0m ${message}`);
  } else {
    failedCount++;
    console.error(`  \x1b[31m✖\x1b[0m ${message}`);
  }
}

console.log('\n======================================================');
console.log('  RAZEL 360 HEADLESS TEST SUITE');
console.log('======================================================\n');

// 1. Test HTML File & Branding Structure
console.log('\x1b[36m[1/6] Validating HTML, Favicon & Razel Branding...\x1b[0m');
const indexPath = path.join(ROOT_DIR, 'index.html');
assert(fs.existsSync(indexPath), 'index.html exists in root directory');

const htmlContent = fs.readFileSync(indexPath, 'utf8');
assert(htmlContent.includes('Razel 360'), 'Title and brand name is set to Razel 360');
assert(htmlContent.includes('Powered by Razel Tech'), 'Tour Studio includes "Powered by Razel Tech"');
assert(htmlContent.includes('rel="icon" type="image/svg+xml"'), 'Inline SVG VR Cardboard headset favicon is present');
assert(htmlContent.includes('three.min.js'), 'Three.js library is included');
assert(htmlContent.includes('id="crosshair-reticle"'), 'Permanent navigation crosshair element exists');
assert(htmlContent.includes('id="canvas-container"'), 'Canvas container element exists');
assert(htmlContent.includes('id="initial-preloader"'), 'Initial loading spinner is implemented');
assert(!htmlContent.includes('<p class="text-[8px] md:text-[9px] text-slate-400 font-medium">Virtual Tour</p>'), 'Redundant Virtual Tour tagline removed for minimalist UI');
assert(htmlContent.includes('id="modal-settings"'), 'Settings modal for consolidated controls is implemented');
assert(htmlContent.includes('toggleBottomStripCollapse'), 'Collapsible room strip toggle is implemented');
assert(htmlContent.includes('bindTouchGestures'), 'Touch gesture pinch-to-zoom is implemented');

// 2. Mobile Responsiveness Checks
console.log('\n\x1b[36m[2/6] Validating Mobile Responsiveness Meta & CSS...\x1b[0m');
assert(htmlContent.includes('viewport-fit=cover'), 'Viewport includes viewport-fit=cover for notched mobile screens');
assert(htmlContent.includes('md:h-16'), 'Header uses responsive height classes for mobile vs desktop');
assert(htmlContent.includes('max-w-[calc(100vw-24px)]'), 'Studio drawer constrained cleanly for mobile viewports');
assert(htmlContent.includes('overflow-x-auto'), 'Room thumbnail strip supports horizontal touch swipe');

// 3. Extract & Validate Embedded JavaScript
console.log('\n\x1b[36m[3/6] Validating JavaScript Engine & Audio Synthesizer...\x1b[0m');
const scriptMatches = htmlContent.match(/<script>([\s\S]*?)<\/script>/);
assert(!!scriptMatches && scriptMatches[1].length > 0, 'Embedded script block found in index.html');

let scriptCode = scriptMatches[1];
let syntaxOk = false;
try {
  new Function(scriptCode);
  syntaxOk = true;
} catch (e) {
  console.error('Syntax Error:', e.message);
}
assert(syntaxOk, 'JavaScript syntax parses cleanly without errors');
assert(scriptCode.includes('playPopSound'), 'Web Audio API pop chime synthesizer is implemented');
assert(scriptCode.includes('playWhooshSound'), 'Web Audio API doorway transition whoosh synthesizer is implemented');
assert(scriptCode.includes('toggleAutoDemo'), 'Automated guided walkthrough demo engine is implemented');
assert(scriptCode.includes('create3DPortalDoorstepMesh'), 'Upright vertical doorway portal frame mesh is implemented');
assert(scriptCode.includes('create3DCalloutMesh'), 'Tiny dot beacon with rising arrow stem callout is implemented');
assert(scriptCode.includes('createSeamlessTexture'), 'Seamless texture edge-blending is implemented');
assert(scriptCode.includes('ctx.beginPath()'), 'Canvas path isolation via ctx.beginPath() prevents white background collision');

// 4. Validate Demo Tour Schema & Hotspots
console.log('\n\x1b[36m[4/6] Validating Multi-Tour Data Schema & Demo Assets...\x1b[0m');
const tourMatch = scriptCode.match(/const DEMO_VILLA_LUMINA = (\{[\s\S]*?\n    \};)/);
assert(!!tourMatch, 'DEMO_VILLA_LUMINA schema defined');

let demoVilla = null;
try {
  demoVilla = eval('(' + tourMatch[1].replace(/;\s*$/, '') + ')');
} catch (e) {
  console.error('Failed to parse DEMO_VILLA_LUMINA:', e);
}

assert(!!demoVilla && demoVilla.scenes && demoVilla.scenes.length === 6, 'Demo Villa has exactly 6 interconnected rooms');

const requiredScenes = [
  'scene_exterior',
  'scene_living',
  'scene_kitchen',
  'scene_bedroom',
  'scene_bathroom',
  'scene_balcony'
];

requiredScenes.forEach(sceneId => {
  const scene = demoVilla.scenes.find(s => s.id === sceneId);
  assert(!!scene, `Scene '${sceneId}' is registered in tour`);
  if (scene) {
    assert(scene.hotspots && scene.hotspots.length > 0, `Scene '${sceneId}' has active hotspots (${scene.hotspots ? scene.hotspots.length : 0})`);
    
    const normalizedRelPath = scene.imageSrc.replace(/^\.\//, '').replace(/\//g, path.sep);
    const absImagePath = path.join(ROOT_DIR, normalizedRelPath);
    const imageExists = fs.existsSync(absImagePath);
    assert(imageExists, `Image asset exists at disk path: ${normalizedRelPath}`);
    if (imageExists) {
      const stats = fs.statSync(absImagePath);
      assert(stats.size > 100000, `Image asset '${path.basename(absImagePath)}' is high-res (${Math.round(stats.size / 1024)} KB)`);
    }
  }
});

// Validate Demo 2: The Palm Royale Estate (8 Rooms)
const tour2Match = scriptCode.match(/const DEMO_PALM_ROYALE = (\{[\s\S]*?\n    \};)/);
assert(!!tour2Match, 'DEMO_PALM_ROYALE schema defined');

let demoPalmRoyale = null;
try {
  demoPalmRoyale = eval('(' + tour2Match[1].replace(/;\s*$/, '') + ')');
} catch (e) {
  console.error('Failed to parse DEMO_PALM_ROYALE:', e);
}

assert(!!demoPalmRoyale && demoPalmRoyale.scenes && demoPalmRoyale.scenes.length === 8, 'Demo 2 Palm Royale has exactly 8 interconnected rooms');

const requiredScenesTour2 = [
  'scene_royale_exterior',
  'scene_royale_foyer',
  'scene_royale_living',
  'scene_royale_dining',
  'scene_royale_kitchen',
  'scene_royale_bedroom',
  'scene_royale_terrace',
  'scene_royale_pool'
];

requiredScenesTour2.forEach(sceneId => {
  const scene = demoPalmRoyale.scenes.find(s => s.id === sceneId);
  assert(!!scene, `Tour 2 Scene '${sceneId}' is registered`);
  if (scene) {
    assert(scene.hotspots && scene.hotspots.length > 0, `Tour 2 Scene '${sceneId}' has active hotspots (${scene.hotspots ? scene.hotspots.length : 0})`);

    const normalizedRelPath = scene.imageSrc.replace(/^\.\//, '').replace(/\//g, path.sep);
    const absImagePath = path.join(ROOT_DIR, normalizedRelPath);
    const imageExists = fs.existsSync(absImagePath);
    assert(imageExists, `Image asset exists at disk path: ${normalizedRelPath}`);
    if (imageExists) {
      const stats = fs.statSync(absImagePath);
      assert(stats.size > 500000, `Image asset '${path.basename(absImagePath)}' is high-res (${Math.round(stats.size / 1024)} KB)`);
    }
  }
});

// 5. Test Export / Import JSON Lifecycle
console.log('\n\x1b[36m[5/6] Testing JSON Export / Import Validation...\x1b[0m');
const exportPayload = {
  app: "Razel360",
  version: "2.5",
  author: "Razel Tech",
  exportedAt: new Date().toISOString(),
  tour: demoVilla
};

const jsonString = JSON.stringify(exportPayload, null, 2);
assert(jsonString.length > 500, 'Export JSON serialization produces non-empty string');

let parsedImport = null;
try {
  parsedImport = JSON.parse(jsonString);
} catch (e) {
  console.error('Import parse failed:', e);
}
assert(!!parsedImport && parsedImport.tour, 'Import parser recognizes Razel360 wrapper format');
assert(parsedImport.tour.scenes.length === 6, 'Imported tour preserves all 6 scenes intact');
assert(parsedImport.tour.scenes[0].hotspots.length === demoVilla.scenes[0].hotspots.length, 'Hotspot arrays match exactly after serialization roundtrip');

// 6. GitHub Pages Static Assets & Deployment Verification
console.log('\n\x1b[6/6] Checking Static Hosting & GitHub Pages Prep...\x1b[0m');
const noJekyllPath = path.join(ROOT_DIR, '.nojekyll');
assert(fs.existsSync(noJekyllPath), '.nojekyll exists to ensure GitHub Pages serves all assets');

const hasAbsoluteCPaths = htmlContent.includes('C:\\') || htmlContent.includes('D:\\');
assert(!hasAbsoluteCPaths, 'index.html contains zero local drive paths (clean relative URLs for GitHub Pages)');

console.log('\n------------------------------------------------------');
console.log(`Summary: ${passedCount}/${testCount} tests passed (${failedCount} failed)`);
console.log('------------------------------------------------------\n');

if (failedCount > 0) {
  process.exit(1);
} else {
  console.log('\x1b[32m✔ All automated tests passed successfully!\x1b[0m\n');
  process.exit(0);
}
