/* ═══════════════════════════════════════════════════════════════
   HH Goa 2026 — Builder Pass Forge
   Application Logic — Merged design from both reference sites
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── Constants ─────────────────────────────────────────────────
  const BUILDER_CLASSES = [
    'TERMINAL WIZARD', 'DOM MANIPULATOR', 'ASYNC ARCHITECT',
    'STATE SORCERER', 'PIXEL ALCHEMIST', 'GIT GUARDIAN',
    'API WHISPERER', 'BUG SLAYER', 'STACK SURGEON',
    'CLOUD CONJURER', 'CODE MYSTIC', 'DEPLOY DEITY'
  ];

  const TEAM_CLASSES = [
    'THE ALCHEMISTS', 'THE ARCHITECTS', 'THE WIZARDS',
    'THE SORCERERS', 'THE MANIPULATORS', 'THE GUARDIANS',
    'THE CONJURERS', 'THE SLAYERS'
  ];

  const BRAND = {
    green: '#0a4d2c',
    greenDark: '#056839',
    greenDeep: '#113424',
    pink: '#FF007B',
    pinkRose: '#e11d48',
    yellow: '#ffde00',
    yellowDim: '#facc15',
    cream: '#FDF6E3',
    creamDim: '#c4b99a',
    bgDark: '#030a06',
  };

  // ── Regex Patterns ────────────────────────────────────────────
  const REGEX = {
    name: /^[a-zA-Z\s&,.''-]{2,32}$/,
    stack: /^[a-zA-Z0-9\s/.+#&,'-]{2,30}$/,
    handle: /^@?[a-zA-Z0-9_]{1,15}$/,
    email: /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/,
    phone: /^(\+91[\s\-]?)?[6-9]\d{9}$/,
  };

  // ── State ─────────────────────────────────────────────────────
  let state = {
    screen: 'landing',
    format: 'card',
    mode: 'solo',
    teamSize: 1,
    photos: [null, null, null],
    photoImages: [null, null, null],
    builderClass: BUILDER_CLASSES[0],
  };

  // ── Detection ─────────────────────────────────────────────────
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasFineCursor = window.matchMedia('(pointer: fine)').matches;

  // ── DOM Elements ──────────────────────────────────────────────
  const $ = (id) => document.getElementById(id);

  const cardScreens = {
    landing: $('screenLanding'),
    form: $('screenForm'),
    result: $('screenResult'),
    about: $('screenAbout'),
    profile: $('screenProfile'),
  };

  const els = {
    cursor: $('cursor'),
    scrollProgress: $('scrollProgress'),
    dragOverlay: $('dragOverlay'),
    toast: $('toast'),
    resultWrapper: $('resultWrapper'),
    footer: $('footer'),

    formatToggle: $('formatToggle'),
    modeToggle: $('modeToggle'),
    uploadZone1: $('uploadZone1'),
    uploadZone2: $('uploadZone2'),
    uploadZone3: $('uploadZone3'),
    uploadThumb1: $('uploadThumb1'),
    uploadThumb2: $('uploadThumb2'),
    uploadThumb3: $('uploadThumb3'),
    uploadText1: $('uploadText1'),
    uploadText2: $('uploadText2'),
    uploadText3: $('uploadText3'),
    photoInput1: $('photoInput1'),
    photoInput2: $('photoInput2'),
    photoInput3: $('photoInput3'),
    cameraInput: $('cameraInput'),
    nameInput: $('nameInput'),
    stackInput: $('stackInput'),
    handleInput: $('handleInput'),
    emailInput: $('emailInput'),
    phoneInput: $('phoneInput'),
    nameLabelText: $('nameLabelText'),
    nameFeedback: $('nameFeedback'),
    stackFeedback: $('stackFeedback'),
    handleFeedback: $('handleFeedback'),
    emailFeedback: $('emailFeedback'),
    phoneFeedback: $('phoneFeedback'),
    btnGenerateText: $('btnGenerateText'),

    previewCanvas: $('previewCanvas'),
    previewEmpty: $('previewEmpty'),
    previewWrapper: $('previewWrapper'),
    resultCanvas: $('resultCanvas'),
  };

  const previewCtx = els.previewCanvas.getContext('2d');
  const resultCtx = els.resultCanvas.getContext('2d');

  // ══════════════════════════════════════════════════════════════
  //  INTERACTION LAYER
  // ══════════════════════════════════════════════════════════════

  // ── Custom Cursor ─────────────────────────────────────────────
  let cursorX = 0, cursorY = 0;
  let cursorTargetX = 0, cursorTargetY = 0;

  function initCursor() {
    if (!hasFineCursor || prefersReducedMotion) return;

    document.addEventListener('mousemove', (e) => {
      cursorTargetX = e.clientX;
      cursorTargetY = e.clientY;
    });

    document.addEventListener('mousedown', () => els.cursor.classList.add('clicking'));
    document.addEventListener('mouseup', () => els.cursor.classList.remove('clicking'));

    document.querySelectorAll('[data-cursor-hover]').forEach(el => {
      el.addEventListener('mouseenter', () => els.cursor.classList.add('hovering'));
      el.addEventListener('mouseleave', () => els.cursor.classList.remove('hovering'));
    });

    function animateCursor() {
      cursorX += (cursorTargetX - cursorX) * 0.15;
      cursorY += (cursorTargetY - cursorY) * 0.15;
      els.cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
      requestAnimationFrame(animateCursor);
    }
    animateCursor();
  }

  // ── Magnetic Buttons ──────────────────────────────────────────
  function initMagneticButtons() {
    if (!hasFineCursor || prefersReducedMotion) return;

    document.querySelectorAll('[data-magnetic]').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
        btn.style.transition = 'transform 400ms cubic-bezier(0.16, 1, 0.3, 1)';
        setTimeout(() => { btn.style.transition = ''; }, 400);
      });
    });
  }

  // ── Scroll Progress ───────────────────────────────────────────
  function initScrollProgress() {
    if (prefersReducedMotion) return;
    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      els.scrollProgress.style.width = progress + '%';
    }, { passive: true });
  }

  // ── Navbar Morph ──────────────────────────────────────────────
  function initNavbarMorph() {
    const navbar = $('navbar');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  // ══════════════════════════════════════════════════════════════
  //  CARD SCREEN NAVIGATION (site2 pattern)
  // ══════════════════════════════════════════════════════════════

  function showCardScreen(name) {
    state.screen = name;
    Object.values(cardScreens).forEach(s => s.classList.remove('active'));
    if (cardScreens[name]) {
      cardScreens[name].classList.add('active');
    }
  }

  // ── Toggle Groups (radio-based, site2 style) ──────────────────
  function setupRadioToggle(container, onChange) {
    if (!container) return;
    const radios = container.querySelectorAll('input[type="radio"]');
    radios.forEach(radio => {
      radio.addEventListener('change', () => {
        if (onChange) onChange(radio.value);
      });
    });
  }

  // ── Format Change ─────────────────────────────────────────────
  function onFormatChange(format) {
    state.format = format;

    if (format === 'pfp') {
      els.previewCanvas.width = 1080;
      els.previewCanvas.height = 1080;
      els.resultCanvas.width = 1080;
      els.resultCanvas.height = 1080;
    } else {
      els.previewCanvas.width = 1080;
      els.previewCanvas.height = 1500;
      els.resultCanvas.width = 1080;
      els.resultCanvas.height = 1500;
    }

    if (format === 'team' && state.mode === 'solo') {
      setMode('duo');
      const duoRadio = $('modeDuo');
      if (duoRadio) duoRadio.checked = true;
    }
  }

  // ── Mode Change ───────────────────────────────────────────────
  function setMode(mode) {
    state.mode = mode;
    state.teamSize = mode === 'solo' ? 1 : mode === 'duo' ? 2 : 3;

    els.uploadZone2.style.display = state.teamSize >= 2 ? 'block' : 'none';
    els.uploadZone3.style.display = state.teamSize >= 3 ? 'block' : 'none';

    if (state.teamSize === 1) {
      els.nameLabelText.textContent = 'IDENTIFIER / NAME';
      els.nameInput.placeholder = 'e.g. Alex';
    } else if (state.teamSize === 2) {
      els.nameLabelText.textContent = 'TEAM NAME / BOTH NAMES';
      els.nameInput.placeholder = 'e.g. Alex & Sam';
    } else {
      els.nameLabelText.textContent = 'TEAM NAME / ALL NAMES';
      els.nameInput.placeholder = 'e.g. Alex, Sam & Jordan';
    }
  }

  // ── Photo Handling ────────────────────────────────────────────
  async function handlePhotoUpload(file, index) {
    if (!file) return;

    const zone = $('uploadZone' + (index + 1));
    const thumb = $('uploadThumb' + (index + 1));
    const text = $('uploadText' + (index + 1));

    text.textContent = 'READING FILE...';

    if (file.name.toLowerCase().match(/\.hei[cf]$/i) || file.type === 'image/heic' || file.type === 'image/heif') {
      try {
        const convertedBlob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 });
        file = new File([convertedBlob], 'converted.jpg', { type: 'image/jpeg' });
      } catch (err) {
        text.textContent = 'ERR_FORMAT';
        showToast('Could not convert HEIC file.', 'error');
        return;
      }
    }

    if (file.size > 15 * 1024 * 1024) {
      showToast('File too large. Use an image under 15 MB.', 'error');
      text.textContent = '[ + ] ATTACH PHOTO 0' + (index + 1);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        state.photos[index] = e.target.result;
        state.photoImages[index] = img;
        thumb.src = e.target.result;
        zone.classList.add('has-photo');
        text.textContent = 'DATA ATTACHED';
        showToast('Photo loaded!', 'success');
      };
      img.onerror = () => {
        text.textContent = 'INVALID IMAGE';
        showToast('Could not load this image.', 'error');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // ── Input Validation ──────────────────────────────────────────
  function validateField(input, regex, feedbackEl, invalidMsg) {
    const val = input.value.trim();
    if (!val) {
      input.classList.remove('valid', 'invalid');
      feedbackEl.textContent = '';
      feedbackEl.className = 'input-feedback';
      return false;
    }
    if (regex.test(val)) {
      input.classList.remove('invalid');
      input.classList.add('valid');
      feedbackEl.textContent = '✓ Looks good';
      feedbackEl.className = 'input-feedback valid';
      return true;
    } else {
      input.classList.remove('valid');
      input.classList.add('invalid');
      feedbackEl.textContent = invalidMsg || 'Invalid format';
      feedbackEl.className = 'input-feedback invalid';
      return false;
    }
  }

  function setupValidation() {
    els.nameInput.addEventListener('input', () => {
      validateField(els.nameInput, REGEX.name, els.nameFeedback, 'Use 2–32 letters');
    });
    els.stackInput.addEventListener('input', () => {
      validateField(els.stackInput, REGEX.stack, els.stackFeedback, 'Use 2–30 chars');
    });
    els.handleInput.addEventListener('input', () => {
      const val = els.handleInput.value.trim();
      if (!val) {
        els.handleInput.classList.remove('valid', 'invalid');
        els.handleFeedback.textContent = '';
        els.handleFeedback.className = 'input-feedback';
        return;
      }
      validateField(els.handleInput, REGEX.handle, els.handleFeedback, 'e.g. @yourname');
    });
  }

  // ── Builder Class Generator ───────────────────────────────────
  function generateBuilderClass(name, teamSize) {
    const charSum = name.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return teamSize > 1
      ? TEAM_CLASSES[charSum % TEAM_CLASSES.length]
      : BUILDER_CLASSES[charSum % BUILDER_CLASSES.length];
  }

  // ══════════════════════════════════════════════════════════════
  //  CANVAS RENDERING ENGINE (fully preserved from original)
  // ══════════════════════════════════════════════════════════════

  function drawFittedText(ctx, text, x, y, maxWidth, font, color) {
    ctx.fillStyle = color;
    let fontSize = parseInt(font);
    const fontFamily = font.replace(/^\d+px\s*/, '');
    while (fontSize > 12) {
      ctx.font = `${fontSize}px ${fontFamily}`;
      if (ctx.measureText(text).width <= maxWidth) break;
      fontSize -= 1;
    }
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.fillText(text, x, y);
  }

  function drawAvatar(ctx, img, cx, cy, radius) {
    // Outer dashed ring
    ctx.strokeStyle = BRAND.pinkRose;
    ctx.lineWidth = 12;
    ctx.setLineDash([18, 12]);
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 22, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Inner solid ring
    ctx.strokeStyle = BRAND.yellowDim;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 7, 0, Math.PI * 2);
    ctx.stroke();

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.clip();

    if (img && img.complete && img.naturalWidth > 0) {
      const ar = 1;
      const ir = img.width / img.height;
      let sx, sy, sw, sh;
      if (ir > ar) { sh = img.height; sw = sh * ar; sx = (img.width - sw) / 2; sy = 0; }
      else { sw = img.width; sh = sw / ar; sx = 0; sy = (img.height - sh) / 2; }
      ctx.drawImage(img, sx, sy, sw, sh, cx - radius, cy - radius, radius * 2, radius * 2);
    } else {
      ctx.fillStyle = BRAND.green;
      ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
      ctx.fillStyle = BRAND.cream;
      ctx.font = `${radius}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('👤', cx, cy);
    }
    ctx.restore();
  }

  function drawCanvasQR(ctx, x, y, size, seedText) {
    const grid = 21;
    const cellSize = size / grid;

    function drawFinder(fx, fy) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(x + fx * cellSize, y + fy * cellSize, 7 * cellSize, 7 * cellSize);
      ctx.fillStyle = BRAND.cream;
      ctx.fillRect(x + (fx + 1) * cellSize, y + (fy + 1) * cellSize, 5 * cellSize, 5 * cellSize);
      ctx.fillStyle = '#000000';
      ctx.fillRect(x + (fx + 2) * cellSize, y + (fy + 2) * cellSize, 3 * cellSize, 3 * cellSize);
    }

    ctx.fillStyle = '#000000';
    drawFinder(0, 0); drawFinder(14, 0); drawFinder(0, 14);

    let hash = 0;
    for (let i = 0; i < seedText.length; i++) {
      hash = (hash << 5) - hash + seedText.charCodeAt(i);
    }
    for (let r = 0; r < grid; r++) {
      for (let c = 0; c < grid; c++) {
        if ((r < 7 && c < 7) || (r < 7 && c >= 14) || (r >= 14 && c < 7)) continue;
        const val = Math.abs(Math.sin(hash + r * 31 + c * 17));
        if (val > 0.45) {
          ctx.fillStyle = BRAND.greenDark;
          ctx.fillRect(x + c * cellSize, y + r * cellSize, cellSize, cellSize);
        }
      }
    }
  }

  async function renderCard(ctx, canvas) {
    const W = canvas.width;
    const H = canvas.height;
    const name = els.nameInput.value.trim() || 'ANONYMOUS BUILDER';
    const stack = els.stackInput.value.trim() || 'WEB DEVELOPER';
    const handle = els.handleInput.value.trim();
    const builderClass = generateBuilderClass(name, state.teamSize);
    state.builderClass = builderClass;

    ctx.clearRect(0, 0, W, H);

    if (state.format === 'pfp') {
      await renderPFP(ctx, W, H, name, handle);
    } else if (state.format === 'team') {
      await renderTeamFrame(ctx, W, H, name, stack, builderClass);
    } else {
      await renderBuilderID(ctx, W, H, name, stack, builderClass, handle);
    }
  }

  // ── PFP Frame Renderer ────────────────────────────────────────
  async function renderPFP(ctx, W, H, name, handle) {
    ctx.fillStyle = BRAND.cream;
    ctx.fillRect(0, 0, W, H);

    const img = state.photoImages[0];
    if (img && img.complete && img.naturalWidth > 0) {
      const ir = img.width / img.height;
      let sx, sy, sw, sh;
      if (ir > 1) { sh = img.height; sw = sh; sx = (img.width - sw) / 2; sy = 0; }
      else { sw = img.width; sh = sw; sx = 0; sy = (img.height - sh) / 2; }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);
    } else {
      ctx.fillStyle = BRAND.green;
      ctx.fillRect(0, 0, W, H);
    }

    const stripH = 200;
    const gradient = ctx.createLinearGradient(0, H - stripH - 100, 0, H);
    gradient.addColorStop(0, 'rgba(3, 10, 6, 0)');
    gradient.addColorStop(0.4, 'rgba(3, 10, 6, 0.7)');
    gradient.addColorStop(1, 'rgba(3, 10, 6, 0.95)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, H - stripH - 100, W, stripH + 100);

    ctx.strokeStyle = BRAND.yellow;
    ctx.lineWidth = 16;
    ctx.strokeRect(20, 20, W - 40, H - 40);

    ctx.fillStyle = BRAND.pink;
    ctx.fillRect(20, H - 40, 80, 20);

    ctx.textAlign = 'center';
    ctx.fillStyle = BRAND.yellow;
    ctx.font = '900 28px "JetBrains Mono"';
    ctx.fillText('HACKER HOUSE GOA 2026', W / 2, H - 120);

    ctx.fillStyle = '#fff';
    ctx.font = '700 22px "Playfair Display"';
    ctx.fillText(name.toUpperCase(), W / 2, H - 80);

    if (handle) {
      ctx.fillStyle = BRAND.creamDim;
      ctx.font = '500 18px "JetBrains Mono"';
      ctx.fillText(handle.startsWith('@') ? handle : '@' + handle, W / 2, H - 52);
    }

    ctx.textAlign = 'left';
    ctx.fillStyle = BRAND.yellow;
    ctx.font = '800 18px "JetBrains Mono"';
    ctx.fillText('2:47 PM STUDIO', 50, 60);

    ctx.textAlign = 'right';
    ctx.fillStyle = BRAND.cream;
    ctx.font = '700 14px "JetBrains Mono"';
    ctx.fillText('28–31 OCT 2026', W - 50, 60);

    ctx.textAlign = 'center';
    ctx.fillStyle = BRAND.creamDim;
    ctx.font = '600 14px "JetBrains Mono"';
    ctx.fillText('#FrameInGoa', W / 2, H - 30);
  }

  // ── Builder ID Renderer ───────────────────────────────────────
  async function renderBuilderID(ctx, W, H, name, stack, builderClass, handle) {
    const margin = 30;

    // 1. Cream background
    ctx.fillStyle = BRAND.cream;
    ctx.fillRect(0, 0, W, H);

    // 2. Cover photo area with bg.png or green gradient
    ctx.save();
    ctx.beginPath();
    ctx.rect(margin, margin, W - margin * 2, 600);
    ctx.clip();

    const bgImg = new Image();
    let bgLoaded = false;
    try {
      const loadBg = new Promise((resolve) => {
        bgImg.onload = () => { bgLoaded = true; resolve(); };
        bgImg.onerror = () => resolve();
        bgImg.src = 'bg.png';
      });
      await Promise.race([loadBg, new Promise(r => setTimeout(r, 1500))]);
    } catch(e) {}

    if (bgLoaded && bgImg.complete && bgImg.naturalWidth > 0) {
      try { ctx.drawImage(bgImg, margin, margin, W - margin * 2, 600); }
      catch(e) { ctx.fillStyle = BRAND.green; ctx.fillRect(margin, margin, W - margin * 2, 600); }
    } else {
      ctx.fillStyle = BRAND.green;
      ctx.fillRect(margin, margin, W - margin * 2, 600);
    }

    // Dark green overlays
    ctx.fillStyle = 'rgba(10, 77, 44, 0.6)';
    ctx.fillRect(margin, margin, W - margin * 2, 600);
    ctx.fillStyle = 'rgba(5, 48, 24, 0.7)';
    ctx.fillRect(margin, margin, W - margin * 2, 600);

    // Retro grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = margin; x <= W - margin; x += 40) { ctx.moveTo(x, margin); ctx.lineTo(x, 630); }
    for (let y = margin; y <= 630; y += 40) { ctx.moveTo(margin, y); ctx.lineTo(W - margin, y); }
    ctx.stroke();
    ctx.restore();

    // 3. Border
    ctx.strokeStyle = BRAND.green;
    ctx.lineWidth = 18;
    ctx.strokeRect(margin, margin, W - margin * 2, H - margin * 2);

    // 4. Lanyard
    ctx.fillStyle = BRAND.green;
    ctx.beginPath();
    ctx.roundRect(W / 2 - 140, margin, 280, 90, [0, 0, 20, 20]);
    ctx.fill();
    ctx.fillStyle = BRAND.cream;
    ctx.beginPath();
    ctx.arc(W / 2, margin + 45, 18, 0, Math.PI * 2);
    ctx.fill();

    // 5. Studio text
    ctx.textAlign = 'left';
    ctx.fillStyle = BRAND.yellowDim;
    ctx.font = '900 20px "JetBrains Mono"';
    ctx.fillText('2:47 PM STUDIO', 60, margin + 60);

    // 6. Build in Goa seal
    ctx.strokeStyle = BRAND.yellowDim;
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(900, 160, 65, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(900, 160, 55, 0, Math.PI * 2); ctx.stroke();
    ctx.textAlign = 'center';
    ctx.fillStyle = BRAND.yellowDim;
    ctx.font = 'bold 18px "JetBrains Mono"';
    ctx.fillText('BUILD IN GOA', 900, 155);
    ctx.font = '36px sans-serif';
    ctx.fillText('🌴', 900, 195);

    // 7. HACKER HOUSE stretched
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.save();
    ctx.scale(1, 1.35);
    ctx.font = 'normal 90px "Instrument Serif"';
    ctx.fillText('HACKER HOUSE', W / 2, 260 / 1.35);
    ctx.restore();

    // 8. गोवा
    ctx.save();
    ctx.translate(W / 2, 200);
    ctx.rotate(-5 * Math.PI / 180);
    ctx.font = '900 75px sans-serif';
    ctx.shadowColor = BRAND.yellowDim;
    ctx.shadowOffsetX = 3; ctx.shadowOffsetY = 3;
    ctx.fillStyle = BRAND.pinkRose;
    ctx.fillText('गोवा', 0, 0);
    ctx.shadowColor = 'transparent';
    ctx.lineWidth = 2;
    ctx.strokeStyle = BRAND.yellowDim;
    ctx.strokeText('गोवा', 0, 0);
    ctx.restore();

    // 9. Avatars
    const avatarY = 560;
    if (state.teamSize === 1) {
      drawAvatar(ctx, state.photoImages[0], W / 2, avatarY, 240);
    } else if (state.teamSize === 2) {
      drawAvatar(ctx, state.photoImages[0], 340, avatarY, 180);
      drawAvatar(ctx, state.photoImages[1], 740, avatarY, 180);
    } else {
      drawAvatar(ctx, state.photoImages[0], 280, avatarY, 135);
      drawAvatar(ctx, state.photoImages[1], W / 2, avatarY, 135);
      drawAvatar(ctx, state.photoImages[2], 800, avatarY, 135);
    }

    // 10. LET'S BUILD sticker
    ctx.save();
    ctx.translate(870, 480);
    ctx.rotate(12 * Math.PI / 180);
    ctx.fillStyle = BRAND.yellowDim;
    ctx.fillRect(-65, -25, 130, 50);
    ctx.strokeStyle = '#000'; ctx.lineWidth = 2;
    ctx.strokeRect(-65, -25, 130, 50);
    ctx.fillStyle = '#000';
    ctx.font = '800 17px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("LET'S BUILD!", 0, 6);
    ctx.restore();

    // 11. Name plate
    const npW = 620;
    ctx.fillStyle = BRAND.green;
    ctx.beginPath();
    ctx.roundRect(W / 2 - npW / 2, 900, npW, 75, 18);
    ctx.fill();
    ctx.strokeStyle = BRAND.yellowDim;
    ctx.lineWidth = 3;
    ctx.strokeRect(W / 2 - npW / 2 + 10, 910, npW - 20, 55);
    ctx.textAlign = 'center';
    drawFittedText(ctx, name.toUpperCase(), W / 2, 948, npW - 40, '34px "Plus Jakarta Sans"', '#fff');

    // Stack ribbon
    ctx.fillStyle = BRAND.yellowDim;
    ctx.fillRect(W / 2 - 250, 1005, 500, 38);
    ctx.fillStyle = BRAND.pinkRose;
    ctx.font = '800 20px "JetBrains Mono"';
    ctx.fillText(`⚡ ${stack.substring(0, 25).toUpperCase()} ⚡`, W / 2, 1032);

    // Handle
    if (handle) {
      ctx.fillStyle = BRAND.greenDeep;
      ctx.font = '700 18px "JetBrains Mono"';
      ctx.fillText(handle.startsWith('@') ? handle : '@' + handle, W / 2, 1070);
    }

    const footerY = handle ? 1100 : 1080;

    // 12. Three-column footer
    // Col 1: Builder Class + QR
    ctx.fillStyle = BRAND.pinkRose;
    ctx.font = '800 14px "JetBrains Mono"';
    ctx.fillText('✦ BUILDER CLASS ✦', 240, footerY + 20);
    ctx.font = '800 22px "Plus Jakarta Sans"';
    ctx.fillText(builderClass, 240, footerY + 55);

    const qrUrl = `${window.location.origin}${window.location.pathname}?name=${encodeURIComponent(name)}&stack=${encodeURIComponent(stack)}&class=${encodeURIComponent(builderClass)}&size=${state.teamSize}`;

    try {
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(qrUrl)}&color=0a4d2c&bgcolor=FDF6E3`;
      const qrImg = new Image();
      qrImg.crossOrigin = 'Anonymous';
      const qrLoaded = await Promise.race([
        new Promise(resolve => { qrImg.onload = () => resolve(true); qrImg.onerror = () => resolve(false); qrImg.src = qrApiUrl; }),
        new Promise(resolve => setTimeout(() => resolve(false), 2000)),
      ]);
      if (qrLoaded && qrImg.complete && qrImg.naturalWidth > 0) {
        ctx.drawImage(qrImg, 150, footerY + 80, 170, 170);
      } else {
        drawCanvasQR(ctx, 150, footerY + 80, 170, qrUrl);
      }
    } catch { drawCanvasQR(ctx, 150, footerY + 80, 170, qrUrl); }

    // Col 2: Beach Bag
    ctx.fillStyle = BRAND.pinkRose;
    ctx.font = '800 14px "JetBrains Mono"';
    ctx.fillText('✦ BEACH BAG ✦', W / 2, footerY + 20);
    ctx.textAlign = 'left';
    ctx.fillStyle = BRAND.greenDeep;
    ctx.font = '800 18px "Plus Jakarta Sans"';
    ctx.fillText('🥥  COCONUT', W / 2 - 60, footerY + 70);
    ctx.fillText('💻  VS CODE', W / 2 - 60, footerY + 110);
    ctx.fillText('🎧  LO-FI BEATS', W / 2 - 60, footerY + 150);

    // Col 3: Shipping + Barcode
    ctx.textAlign = 'center';
    ctx.fillStyle = BRAND.pinkRose;
    ctx.font = '800 14px "JetBrains Mono"';
    ctx.fillText('✦ SHIPPING ✦', 840, footerY + 20);
    ctx.fillStyle = BRAND.greenDeep;
    ctx.font = '800 26px "Plus Jakarta Sans"';
    ctx.fillText('BUILDING', 840, footerY + 60);
    ctx.fillText('THE FUTURE', 840, footerY + 92);

    ctx.strokeStyle = BRAND.greenDeep; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(700, footerY + 115); ctx.lineTo(980, footerY + 115); ctx.stroke();

    ctx.fillStyle = BRAND.greenDeep;
    ctx.font = '700 14px "JetBrains Mono"';
    ctx.fillText('BUILDER ID', 840, footerY + 140);
    const idNum = Math.abs(name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) * 7 % 9999);
    ctx.fillText(`#HH-GOA-${String(idNum).padStart(4, '0')}`, 840, footerY + 162);

    const barcodeWidths = [6, 3, 10, 4, 12, 4, 6, 8, 4, 2, 8, 14, 4];
    let bx = 730;
    ctx.fillStyle = BRAND.greenDeep;
    for (const w of barcodeWidths) { ctx.fillRect(bx, footerY + 175, w, 45); bx += w + 4; }

    ctx.textAlign = 'center';
    ctx.fillStyle = BRAND.green;
    ctx.font = '700 12px "JetBrains Mono"';
    ctx.fillText('GOA, INDIA · 28–31 OCT 2026 · #FrameInGoa', W / 2, H - 50);
    ctx.fillText('247 SEATS · 2:47 PM STUDIO', W / 2, H - 32);
  }

  // ── Team Frame Renderer ───────────────────────────────────────
  async function renderTeamFrame(ctx, W, H, name, stack, builderClass) {
    const margin = 30;
    ctx.fillStyle = BRAND.cream;
    ctx.fillRect(0, 0, W, H);

    const headerH = 400;
    const hGrad = ctx.createLinearGradient(0, 0, W, headerH);
    hGrad.addColorStop(0, BRAND.green);
    hGrad.addColorStop(1, BRAND.greenDark);
    ctx.fillStyle = hGrad;
    ctx.fillRect(margin, margin, W - margin * 2, headerH);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
    ctx.lineWidth = 1; ctx.beginPath();
    for (let x = margin; x <= W - margin; x += 50) { ctx.moveTo(x, margin); ctx.lineTo(x, margin + headerH); }
    for (let y = margin; y <= margin + headerH; y += 50) { ctx.moveTo(margin, y); ctx.lineTo(W - margin, y); }
    ctx.stroke();

    ctx.strokeStyle = BRAND.green; ctx.lineWidth = 16;
    ctx.strokeRect(margin, margin, W - margin * 2, H - margin * 2);

    ctx.textAlign = 'left';
    ctx.fillStyle = BRAND.yellowDim;
    ctx.font = '900 22px "JetBrains Mono"';
    ctx.fillText('2:47 PM STUDIO', 60, 70);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.save(); ctx.scale(1, 1.3);
    ctx.font = 'normal 85px "Instrument Serif"';
    ctx.fillText('HACKER HOUSE', W / 2, 180 / 1.3);
    ctx.restore();

    ctx.save();
    ctx.translate(W / 2, 160);
    ctx.rotate(-5 * Math.PI / 180);
    ctx.font = '900 65px sans-serif';
    ctx.shadowColor = BRAND.yellowDim; ctx.shadowOffsetX = 3; ctx.shadowOffsetY = 3;
    ctx.fillStyle = BRAND.pinkRose;
    ctx.fillText('गोवा', 0, 0);
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = BRAND.yellowDim; ctx.lineWidth = 2;
    ctx.strokeText('गोवा', 0, 0);
    ctx.restore();

    ctx.textAlign = 'center';
    ctx.fillStyle = BRAND.yellowDim;
    ctx.font = '800 16px "JetBrains Mono"';
    ctx.fillText('GOA, INDIA · 28–31 OCT 2026 · 247 SEATS', W / 2, headerH);

    const avatarY = 580;
    if (state.teamSize === 2) {
      drawAvatar(ctx, state.photoImages[0], 330, avatarY, 200);
      drawAvatar(ctx, state.photoImages[1], 750, avatarY, 200);
    } else {
      drawAvatar(ctx, state.photoImages[0], 220, avatarY, 160);
      drawAvatar(ctx, state.photoImages[1], W / 2, avatarY, 160);
      drawAvatar(ctx, state.photoImages[2], 860, avatarY, 160);
    }

    const npW = 700;
    ctx.fillStyle = BRAND.green;
    ctx.beginPath(); ctx.roundRect(W / 2 - npW / 2, 860, npW, 80, 18); ctx.fill();
    ctx.strokeStyle = BRAND.yellowDim; ctx.lineWidth = 3;
    ctx.strokeRect(W / 2 - npW / 2 + 10, 870, npW - 20, 60);
    ctx.textAlign = 'center';
    drawFittedText(ctx, name.toUpperCase(), W / 2, 910, npW - 40, '36px "Plus Jakarta Sans"', '#fff');

    ctx.fillStyle = BRAND.yellowDim;
    ctx.fillRect(W / 2 - 280, 970, 560, 40);
    ctx.fillStyle = BRAND.pinkRose;
    ctx.font = '800 20px "JetBrains Mono"';
    ctx.fillText(`⚡ ${stack.substring(0, 28).toUpperCase()} ⚡`, W / 2, 998);

    ctx.fillStyle = BRAND.pinkRose;
    ctx.font = '800 16px "JetBrains Mono"';
    ctx.fillText('✦ TEAM CLASS ✦', W / 2, 1060);
    ctx.fillStyle = BRAND.greenDeep;
    ctx.font = '800 32px "Plus Jakarta Sans"';
    ctx.fillText(builderClass, W / 2, 1100);

    ctx.save();
    ctx.translate(880, 520);
    ctx.rotate(10 * Math.PI / 180);
    ctx.fillStyle = BRAND.pink;
    ctx.fillRect(-75, -25, 150, 50);
    ctx.fillStyle = '#fff';
    ctx.font = '800 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TEAM FRAME', 0, 6);
    ctx.restore();

    const qrUrl = `${window.location.origin}${window.location.pathname}?name=${encodeURIComponent(name)}&stack=${encodeURIComponent(stack)}&class=${encodeURIComponent(builderClass)}&size=${state.teamSize}`;
    drawCanvasQR(ctx, W / 2 - 80, 1140, 160, qrUrl);

    ctx.textAlign = 'center';
    ctx.fillStyle = BRAND.green;
    ctx.font = '700 14px "JetBrains Mono"';
    ctx.fillText('#FrameInGoa · LESS NOISE. MORE SIGNAL.', W / 2, 1340);
    const idNum = Math.abs(name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) * 7 % 9999);
    ctx.fillText(`BUILDER ID #HH-GOA-${String(idNum).padStart(4, '0')} · ${state.teamSize} MEMBER${state.teamSize > 1 ? 'S' : ''}`, W / 2, 1370);

    const barcodeWidths = [6, 3, 10, 4, 12, 4, 6, 8, 4, 2, 8, 14, 4, 6, 3, 10];
    let bx = W / 2 - 80;
    ctx.fillStyle = BRAND.greenDeep;
    for (const w of barcodeWidths) { ctx.fillRect(bx, 1400, w, 40); bx += w + 3; }

    ctx.fillStyle = BRAND.green;
    ctx.font = '700 11px "JetBrains Mono"';
    ctx.fillText('2:47 PM STUDIO', W / 2, H - 45);
  }

  // ══════════════════════════════════════════════════════════════
  //  GENERATE, DOWNLOAD, SHARE
  // ══════════════════════════════════════════════════════════════

  async function generateCard() {
    const name = els.nameInput.value.trim();
    const stack = els.stackInput.value.trim();

    if (!name || name.length < 2) {
      showToast('Please enter your name (at least 2 characters).', 'error');
      els.nameInput.focus();
      return;
    }

    if (!stack || stack.length < 2) {
      showToast('Please enter your stack or role.', 'error');
      els.stackInput.focus();
      return;
    }

    els.btnGenerateText.textContent = 'PROCESSING...';

    try {
      await renderCard(previewCtx, els.previewCanvas);

      els.resultCanvas.width = els.previewCanvas.width;
      els.resultCanvas.height = els.previewCanvas.height;
      await renderCard(resultCtx, els.resultCanvas);

      // Forge strike animation
      if (els.resultWrapper && !prefersReducedMotion) {
        els.resultWrapper.classList.remove('forge-strike', 'forge-glow');
        void els.resultWrapper.offsetWidth;
        els.resultWrapper.classList.add('forge-strike');
        setTimeout(() => els.resultWrapper.classList.add('forge-glow'), 600);
      }

      showCardScreen('result');
      showToast('Your builder pass has been forged! 🔥', 'success');
    } catch (err) {
      console.error('Render error:', err);
      showToast('Something went wrong. Please try again.', 'error');
    } finally {
      els.btnGenerateText.textContent = 'MINT PASS';
    }
  }

  // ── Download ──────────────────────────────────────────────────
  function downloadPNG() {
    const link = document.createElement('a');
    const name = els.nameInput.value.trim() || 'Builder';
    link.download = `HH-Goa-2026-${name.replace(/\s+/g, '-')}.png`;
    link.href = els.resultCanvas.toDataURL('image/png');
    link.click();
    showToast('Image saved! 📸', 'success');
  }

  // ── Share to X ────────────────────────────────────────────────
  function shareToX() {
    const name = els.nameInput.value.trim() || 'Builder';
    const caption = state.teamSize > 1
      ? `We just forged our HH Goa 2026 Team Builder Pass! 🌴🚀 #FrameInGoa @247pmstudio`
      : `Just forged my HH Goa 2026 Builder Pass! 🌴🚀 #FrameInGoa @247pmstudio`;

    const link = document.createElement('a');
    link.download = `HH-Goa-2026-${name.replace(/\s+/g, '-')}.png`;
    link.href = els.resultCanvas.toDataURL('image/png');
    link.click();

    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(caption)}`, '_blank');
    showToast('Image downloaded! Paste it into your X post. 🐦', 'success');
  }

  // ── Toast ─────────────────────────────────────────────────────
  let toastTimeout = null;

  function showToast(message, type) {
    clearTimeout(toastTimeout);
    els.toast.textContent = message;
    els.toast.className = `toast ${type || ''} show`;
    toastTimeout = setTimeout(() => els.toast.classList.remove('show'), 3000);
  }

  // ── Drag & Drop ───────────────────────────────────────────────
  function setupDragDrop() {
    let dragCounter = 0;

    document.addEventListener('dragenter', (e) => {
      e.preventDefault();
      dragCounter++;
      if (state.screen === 'form') els.dragOverlay.classList.add('active');
    });

    document.addEventListener('dragleave', (e) => {
      e.preventDefault();
      dragCounter--;
      if (dragCounter <= 0) { dragCounter = 0; els.dragOverlay.classList.remove('active'); }
    });

    document.addEventListener('dragover', (e) => e.preventDefault());

    document.addEventListener('drop', (e) => {
      e.preventDefault();
      dragCounter = 0;
      els.dragOverlay.classList.remove('active');
      if (state.screen !== 'form') return;
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        for (let i = 0; i < state.teamSize; i++) {
          if (!state.photoImages[i]) { handlePhotoUpload(files[0], i); return; }
        }
        handlePhotoUpload(files[0], 0);
      }
    });
  }

  // ── URL Parameter Detection (QR scan) ─────────────────────────
  function checkURLParams() {
    const params = new URLSearchParams(window.location.search);

    if (params.has('name') && params.has('stack')) {
      // If has class/size params, show the profile screen
      if (params.has('class')) {
        document.querySelectorAll('.card-screen').forEach(s => s.classList.remove('active'));
        $('qrName').innerText = params.get('name').toUpperCase();
        $('qrStack').innerText = '⚡ ' + params.get('stack').toUpperCase();
        $('qrClass').innerText = 'CLASS ✦ ' + (params.get('class') || 'BUILDER');
        $('qrSize').innerText = 'TEAM MEMBERS: ' + (params.get('size') || '1');
        $('screenProfile').classList.add('active');
        return;
      }

      // Otherwise, pre-fill form
      showCardScreen('form');
      els.nameInput.value = params.get('name');
      els.stackInput.value = params.get('stack');
      if (params.has('size')) {
        const size = parseInt(params.get('size'));
        if (size === 2) setMode('duo');
        else if (size === 3) setMode('trio');
      }
      setTimeout(() => generateCard(), 500);
    }
  }

  // ── Sample Photo ──────────────────────────────────────────────
  function loadSamplePhoto() {
    const sampleCanvas = document.createElement('canvas');
    sampleCanvas.width = 600; sampleCanvas.height = 600;
    const sCtx = sampleCanvas.getContext('2d');

    const grad = sCtx.createLinearGradient(0, 0, 600, 600);
    grad.addColorStop(0, '#0a4d2c');
    grad.addColorStop(0.5, '#056839');
    grad.addColorStop(1, '#0a4d2c');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 600, 600);

    sCtx.fillStyle = 'rgba(254, 225, 1, 0.15)';
    sCtx.beginPath(); sCtx.arc(300, 300, 200, 0, Math.PI * 2); sCtx.fill();
    sCtx.fillStyle = 'rgba(255, 0, 123, 0.1)';
    sCtx.beginPath(); sCtx.arc(300, 300, 140, 0, Math.PI * 2); sCtx.fill();

    sCtx.fillStyle = BRAND.yellow;
    sCtx.font = '150px sans-serif';
    sCtx.textAlign = 'center';
    sCtx.textBaseline = 'middle';
    sCtx.fillText('👤', 300, 300);

    const dataUrl = sampleCanvas.toDataURL('image/png');
    const img = new Image();
    img.onload = () => {
      state.photos[0] = dataUrl;
      state.photoImages[0] = img;
      els.uploadThumb1.src = dataUrl;
      els.uploadZone1.classList.add('has-photo');
      els.uploadText1.textContent = 'DATA ATTACHED';
      showToast('Sample photo loaded!', 'success');
    };
    img.src = dataUrl;
  }

  // ══════════════════════════════════════════════════════════════
  //  INITIALIZATION
  // ══════════════════════════════════════════════════════════════

  function init() {
    // ── Interaction layer ──
    initCursor();
    initMagneticButtons();
    initScrollProgress();
    initNavbarMorph();

    // ── Card screen navigation ──
    $('btnStartGenerator').addEventListener('click', () => showCardScreen('form'));
    $('btnCancelForm').addEventListener('click', () => showCardScreen('landing'));
    $('btnNewCard').addEventListener('click', () => {
      els.nameInput.value = '';
      els.stackInput.value = '';
      els.handleInput.value = '';
      [els.nameInput, els.stackInput, els.handleInput].forEach(el => el.classList.remove('valid', 'invalid'));
      [els.nameFeedback, els.stackFeedback, els.handleFeedback].forEach(el => { el.textContent = ''; el.className = 'input-feedback'; });
      if (els.resultWrapper) els.resultWrapper.classList.remove('forge-strike', 'forge-glow');
      showCardScreen('form');
    });

    // Team TOK DOI toggle
    const navBtnTeam = $('navBtnTeam');
    $('btnCloseAbout').addEventListener('click', () => {
      showCardScreen('landing');
      navBtnTeam.innerText = 'TEAM TOK DOI';
    });

    navBtnTeam.addEventListener('click', () => {
      if (cardScreens.about.classList.contains('active')) {
        showCardScreen('landing');
        navBtnTeam.innerText = 'TEAM TOK DOI';
      } else {
        showCardScreen('about');
        navBtnTeam.innerText = 'RETURN HOME';
      }
    });

    // ── Format/Mode toggles (radio-based) ──
    setupRadioToggle(els.formatToggle, onFormatChange);
    setupRadioToggle(els.modeToggle, setMode);

    // ── Photo uploads ──
    els.photoInput1.addEventListener('change', (e) => handlePhotoUpload(e.target.files[0], 0));
    els.photoInput2.addEventListener('change', (e) => handlePhotoUpload(e.target.files[0], 1));
    els.photoInput3.addEventListener('change', (e) => handlePhotoUpload(e.target.files[0], 2));

    $('btnCamera').addEventListener('click', () => els.cameraInput.click());
    els.cameraInput.addEventListener('change', (e) => handlePhotoUpload(e.target.files[0], 0));
    $('btnSample').addEventListener('click', loadSamplePhoto);

    // ── Validation ──
    setupValidation();

    // ── Generate ──
    $('btnGenerate').addEventListener('click', generateCard);

    // ── Result actions ──
    $('btnDownload').addEventListener('click', downloadPNG);
    $('btnShareX').addEventListener('click', shareToX);

    // ── Drag & drop ──
    setupDragDrop();

    // ── URL params (QR scan) ──
    checkURLParams();

    // ── Initial screen ──
    if (!window.location.search.includes('name=')) {
      showCardScreen('landing');
    }
  }

  // Wait for fonts, then init
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(init);
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }

})();
