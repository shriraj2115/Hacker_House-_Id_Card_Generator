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
    green: '#0A3D2C',
    greenDark: '#083023',
    greenDeep: '#052219',
    pink: '#FF2E93',
    pinkRose: '#FF2E93',
    yellow: '#FFC93C',
    yellowDim: '#FFC93C',
    cream: '#F6EEDD',
    creamDim: '#e8ddc5',
    bgDark: '#030a06',
    greenLight: '#2E8B57',
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

  let cropState = {
    scale: 1,
    dx: 0,
    dy: 0,
    isDragging: false,
    startX: 0,
    startY: 0
  };

  // ── Detection ─────────────────────────────────────────────────
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasFineCursor = window.matchMedia('(pointer: fine)').matches;

  // ── DOM Elements ──────────────────────────────────────────────
  const $ = (id) => document.getElementById(id);

  const cardScreens = {
    hero: $('screenHero'),
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
    uploadDefault: $('uploadDefault'),
    cropContainer: $('cropContainer'),
    btnChangePhoto: $('btnChangePhoto'),
    zoomSlider: $('zoomSlider'),
    uploadThumb1: $('uploadThumb1'),
    uploadText1: $('uploadText1'),
    photoInput1: $('photoInput1'),
    cameraInput: $('cameraInput'),
    nameInput: $('nameInput'),
    stackInput: $('stackInput'),
    emailInput: $('emailInput'),
    phoneInput: $('phoneInput'),
    nameLabelText: $('nameLabelText'),
    nameFeedback: $('nameFeedback'),
    stackFeedback: $('stackFeedback'),
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

  // ── Custom Surfboard Cursor & Wave Trail ────────────────────────
  let cursorX = 0, cursorY = 0;
  let cursorTargetX = 0, cursorTargetY = 0;
  let lastX = 0, lastY = 0;
  let surfboardAngle = 35;

  function initCursor() {
    if (!hasFineCursor || prefersReducedMotion) return;

    document.addEventListener('mousemove', (e) => {
      cursorTargetX = e.clientX;
      cursorTargetY = e.clientY;
    });

    document.addEventListener('mousedown', () => els.cursor.classList.add('clicking'));
    document.addEventListener('mouseup', () => els.cursor.classList.remove('clicking'));

    document.querySelectorAll('[data-cursor-hover], button, a, input, select, .upload-zone').forEach(el => {
      el.addEventListener('mouseenter', () => els.cursor.classList.add('hovering'));
      el.addEventListener('mouseleave', () => els.cursor.classList.remove('hovering'));
    });

    function animateCursor() {
      const dx = cursorTargetX - cursorX;
      const dy = cursorTargetY - cursorY;
      
      cursorX += dx * 0.15;
      cursorY += dy * 0.15;
      els.cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;

      // Dynamically angle the surfboard based on velocity direction
      const speed = Math.hypot(cursorX - lastX, cursorY - lastY);
      if (speed > 1.5) {
        const targetAngle = (Math.atan2(cursorY - lastY, cursorX - lastX) * 180 / Math.PI) + 90;
        surfboardAngle += (targetAngle - surfboardAngle) * 0.2;
        const surfboardEl = els.cursor.querySelector('.cursor-surfboard');
        if (surfboardEl && !els.cursor.classList.contains('hovering')) {
          surfboardEl.style.transform = `rotate(${surfboardAngle}deg)`;
        }
      }
      lastX = cursorX;
      lastY = cursorY;

      requestAnimationFrame(animateCursor);
    }
    animateCursor();
    initWaveTrail();
  }

  // ── Surfboard Ocean Water Wake & Foam Trail ──────────────────────
  function initWaveTrail() {
    const canvas = $('cursorCanvas');
    if (!canvas || !hasFineCursor || prefersReducedMotion) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let ripples = [];

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Ocean Water Color Palette (Turquoise, Cyan, Seafoam White, Azure)
    const WATER_COLORS = [
      'rgba(255, 255, 255, ',   // White sea foam
      'rgba(224, 242, 254, ',   // Light icy sea foam
      'rgba(56, 189, 248, ',    // Bright ocean cyan
      'rgba(45, 212, 191, ',    // Tropical turquoise
      'rgba(14, 165, 233, '     // Deep azure water
    ];

    let prevMouseX = 0, prevMouseY = 0;

    document.addEventListener('mousemove', (e) => {
      const mx = e.clientX;
      const my = e.clientY;
      const dx = mx - prevMouseX;
      const dy = my - prevMouseY;
      const dist = Math.hypot(dx, dy);

      if (dist > 1.5) {
        const moveAngle = Math.atan2(dy, dx);
        const count = Math.min(Math.floor(dist / 3), 6) + 1;

        for (let i = 0; i < count; i++) {
          const spread = (Math.random() - 0.5) * 0.8;
          const perpAngle = moveAngle + Math.PI + spread;
          const speed = Math.random() * 1.5 + 0.5;

          particles.push({
            x: mx - Math.cos(moveAngle) * (i * 4) + (Math.random() - 0.5) * 6,
            y: my - Math.sin(moveAngle) * (i * 4) + (Math.random() - 0.5) * 6,
            vx: Math.cos(perpAngle) * speed,
            vy: Math.sin(perpAngle) * speed,
            radius: Math.random() * 3 + 2,
            maxRadius: Math.random() * 6 + 4,
            alpha: Math.random() * 0.4 + 0.6,
            decay: Math.random() * 0.025 + 0.015,
            color: WATER_COLORS[Math.floor(Math.random() * WATER_COLORS.length)]
          });
        }
      }

      prevMouseX = mx;
      prevMouseY = my;
    });

    document.addEventListener('mousedown', (e) => {
      // Ocean Splash Ripple on Click
      ripples.push({
        x: e.clientX,
        y: e.clientY,
        radius: 4,
        maxRadius: 40 + Math.random() * 20,
        alpha: 0.8,
        lineWidth: 3
      });

      // Water spray droplets
      for (let i = 0; i < 12; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3.5 + 1.5;
        particles.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: Math.random() * 4 + 2,
          maxRadius: Math.random() * 8 + 4,
          alpha: 0.9,
          decay: Math.random() * 0.03 + 0.02,
          color: WATER_COLORS[Math.floor(Math.random() * WATER_COLORS.length)]
        });
      }
    });

    function drawWaveTrail() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Draw Ocean Water Ripples (expanding splash rings)
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += (r.maxRadius - r.radius) * 0.1;
        r.alpha -= 0.025;

        if (r.alpha <= 0 || r.radius >= r.maxRadius - 1) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(56, 189, 248, ${r.alpha})`;
        ctx.lineWidth = r.lineWidth * r.alpha;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius * 0.6, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${r.alpha * 0.6})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // 2. Draw Ocean Water Foam Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.94;
        p.vy *= 0.94;

        if (p.radius < p.maxRadius) {
          p.radius += 0.15;
        }
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color + p.alpha + ')';
        ctx.shadowColor = 'rgba(56, 189, 248, 0.4)';
        ctx.shadowBlur = 4;
        ctx.fill();
      }
      requestAnimationFrame(drawWaveTrail);
    }
    drawWaveTrail();
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
    Object.values(cardScreens).forEach(s => {
      if (s) s.classList.remove('active');
    });
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
      els.previewCanvas.width = 571;
      els.previewCanvas.height = 1024;
      els.resultCanvas.width = 1142;
      els.resultCanvas.height = 2048;
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
  function updateCropTransform() {
    const thumb = els.uploadThumb1;
    if (!thumb) return;
    const maskSize = 240;
    const fitW = cropState.imageWidth && cropState.fitScale ? cropState.imageWidth * cropState.fitScale : maskSize;
    const fitH = cropState.imageHeight && cropState.fitScale ? cropState.imageHeight * cropState.fitScale : maskSize;
    const effScale = cropState.scale || 1;

    thumb.style.width = `${fitW}px`;
    thumb.style.height = `${fitH}px`;
    thumb.style.transform = `translate3d(${cropState.dx}px, ${cropState.dy}px, 0) scale(${effScale})`;
    thumb.style.transformOrigin = '0 0';
  }

  async function handlePhotoUpload(file, index) {
    if (!file) return;

    const zone = $('uploadZone' + (index + 1));
    const thumb = $('uploadThumb' + (index + 1));
    const text = $('uploadText' + (index + 1));

    if (text) text.textContent = 'READING FILE...';

    if (file.name.toLowerCase().match(/\.hei[cf]$/i) || file.type === 'image/heic' || file.type === 'image/heif') {
      try {
        const convertedBlob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 });
        file = new File([convertedBlob], 'converted.jpg', { type: 'image/jpeg' });
      } catch (err) {
        if (text) text.textContent = 'ERR_FORMAT';
        showToast('Could not convert HEIC file.', 'error');
        return;
      }
    }

    if (file.size > 15 * 1024 * 1024) {
      showToast('File too large. Use an image under 15 MB.', 'error');
      if (text) text.textContent = '[ + ] ATTACH PHOTO';
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
        if (text) text.textContent = 'DATA ATTACHED';
        
        // Reset crop state cleanly to auto-cover circle 100% centered
        const maskSize = 240;
        cropState.imageWidth = img.width;
        cropState.imageHeight = img.height;
        cropState.fitScale = Math.max(maskSize / img.width, maskSize / img.height);
        cropState.scale = 1.0;
        
        const baseW = img.width * cropState.fitScale;
        const baseH = img.height * cropState.fitScale;
        cropState.dx = (maskSize - baseW) / 2;
        cropState.dy = (maskSize - baseH) / 2;
        cropState.isDragging = false;

        if (els.zoomSlider) {
          els.zoomSlider.min = 0.1;
          els.zoomSlider.max = 3.0;
          els.zoomSlider.step = 0.01;
          els.zoomSlider.value = 1.0;
        }

        updateCropTransform();
        showToast('Photo loaded! Drag to pan or use zoom bar 🔍', 'success');
      };
      img.onerror = () => {
        if (text) text.textContent = 'INVALID IMAGE';
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

  // ── Photo Cropper Transforms & Interaction ─────────────────────
  function updateCropTransform() {
    const thumb = els.uploadThumb1;
    if (!thumb) return;
    const effScale = cropState.scale || 1;
    thumb.style.transform = `translate3d(${cropState.dx}px, ${cropState.dy}px, 0) scale(${effScale})`;
    thumb.style.transformOrigin = '0 0';
  }

  function setZoomScale(newScale) {
    const maskSize = 240;
    const minS = parseFloat(els.zoomSlider?.min || '0.5');
    const maxS = parseFloat(els.zoomSlider?.max || '4');
    const targetScale = Math.max(minS, Math.min(maxS, newScale));

    const oldScale = cropState.scale || 1;
    cropState.scale = targetScale;

    // Focal zoom centered on the crop mask
    const centerMaskX = maskSize / 2;
    const centerMaskY = maskSize / 2;
    const ratio = targetScale / oldScale;

    cropState.dx = centerMaskX - (centerMaskX - cropState.dx) * ratio;
    cropState.dy = centerMaskY - (centerMaskY - cropState.dy) * ratio;

    if (els.zoomSlider) els.zoomSlider.value = targetScale;
    updateCropTransform();
  }

  function initCropInteractions() {
    const zoomSlider = els.zoomSlider;
    const cropMask = document.querySelector('.crop-mask');

    if (zoomSlider) {
      zoomSlider.addEventListener('input', (e) => {
        setZoomScale(parseFloat(e.target.value));
      });
    }

    if (cropMask) {
      cropMask.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 0.08 : -0.08;
        setZoomScale((cropState.scale || 1) + delta);
      }, { passive: false });

      cropMask.addEventListener('mousedown', (e) => {
        cropState.isDragging = true;
        cropState.startX = e.clientX - cropState.dx;
        cropState.startY = e.clientY - cropState.dy;
      });

      window.addEventListener('mousemove', (e) => {
        if (!cropState.isDragging) return;
        cropState.dx = e.clientX - cropState.startX;
        cropState.dy = e.clientY - cropState.startY;
        updateCropTransform();
      });

      window.addEventListener('mouseup', () => {
        cropState.isDragging = false;
      });

      cropMask.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
          cropState.isDragging = true;
          cropState.startX = e.touches[0].clientX - cropState.dx;
          cropState.startY = e.touches[0].clientY - cropState.dy;
        }
      }, { passive: true });

      window.addEventListener('touchmove', (e) => {
        if (!cropState.isDragging || e.touches.length !== 1) return;
        cropState.dx = e.touches[0].clientX - cropState.startX;
        cropState.dy = e.touches[0].clientY - cropState.startY;
        updateCropTransform();
      }, { passive: true });

      window.addEventListener('touchend', () => {
        cropState.isDragging = false;
      });
    }

    if (els.btnChangePhoto) {
      els.btnChangePhoto.addEventListener('click', (e) => {
        e.stopPropagation();
        els.photoInput1.click();
      });
    }
  }

  function setupValidation() {
    els.nameInput.addEventListener('input', () => {
      validateField(els.nameInput, REGEX.name, els.nameFeedback, 'Use 2–32 letters');
    });
    els.stackInput.addEventListener('input', () => {
      validateField(els.stackInput, REGEX.stack, els.stackFeedback, 'Use 2–30 chars');
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

  function drawFittedText(ctx, text, x, y, maxWidth, fontStr, color, align = 'left') {
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = 'middle';

    const match = fontStr.match(/^(?:([a-zA-Z0-9]+)\s+)?(\d+)px\s+(.+)$/);
    const weight = match && match[1] ? match[1] : '800';
    let fontSize = match && match[2] ? parseInt(match[2]) : 20;
    const fontFamily = match && match[3] ? match[3] : '"JetBrains Mono", monospace';

    ctx.font = `${weight} ${fontSize}px ${fontFamily}`;
    while (fontSize > 9 && ctx.measureText(text).width > maxWidth) {
      fontSize -= 1;
      ctx.font = `${weight} ${fontSize}px ${fontFamily}`;
    }
    ctx.font = `${weight} ${fontSize}px ${fontFamily}`;
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
      const maskSize = 240;
      const sx = -cropState.dx / cropState.scale;
      const sy = -cropState.dy / cropState.scale;
      const sw = maskSize / cropState.scale;
      const sh = maskSize / cropState.scale;
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
    const builderClass = generateBuilderClass(name, state.teamSize);
    state.builderClass = builderClass;

    ctx.clearRect(0, 0, W, H);

    if (state.format === 'pfp') {
      await renderPFP(ctx, W, H, name);
    } else if (state.format === 'team') {
      await renderTeamFrame(ctx, W, H, name, stack, builderClass);
    } else {
      await renderBuilderID(ctx, W, H, name, stack, builderClass);
    }
  }

  // ── PFP Frame Renderer ────────────────────────────────────────
  async function renderPFP(ctx, W, H, name) {
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

  // Preload Card Template
  const cardTemplateImg = new Image();
  cardTemplateImg.src = 'card_template.png';

  // Preload Badges
  const badge1Img = new Image();
  badge1Img.src = 'badge1.png';
  const badge2Img = new Image();
  badge2Img.src = 'badge2.png';
  const badge3Img = new Image();
  badge3Img.src = 'badge3.png';

  function ensureImageLoaded(img, src) {
    return new Promise((resolve) => {
      if (img && img.complete && img.naturalWidth > 0) return resolve(true);
      if (!img) return resolve(false);
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      if (src && !img.src) img.src = src;
    });
  }

  function drawCirclePhoto(ctx, img, cx, cy, r) {
    if (img && img.complete && img.naturalWidth > 0) {
      const maskSize = 240;
      const fitScale = cropState.fitScale || Math.max(maskSize / img.width, maskSize / img.height);
      const effScale = Math.max(0.1, (cropState.scale || 1) * fitScale);

      let sw = maskSize / effScale;
      let sh = maskSize / effScale;
      let sx = -(cropState.dx || 0) / effScale;
      let sy = -(cropState.dy || 0) / effScale;

      sw = Math.min(img.width, Math.max(1, sw));
      sh = Math.min(img.height, Math.max(1, sh));
      sx = Math.max(0, Math.min(img.width - sw, sx));
      sy = Math.max(0, Math.min(img.height - sh, sy));

      ctx.drawImage(img, sx, sy, sw, sh, cx - r, cy - r, r * 2, r * 2);
    } else {
      ctx.fillStyle = '#063725';
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
      ctx.fillStyle = '#ffde00';
      ctx.font = `${Math.floor(r * 0.9)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('👤', cx, cy);
    }
  }

  function drawMultiCirclePhotos(ctx, photos, cx, cy, r) {
    const validPhotos = photos.filter(p => p && p.complete && p.naturalWidth > 0);
    if (validPhotos.length === 0) {
      drawCirclePhoto(ctx, null, cx, cy, r);
      return;
    }
    const n = validPhotos.length;
    const subRadius = r / (n === 2 ? 1.45 : 1.6);

    ctx.fillStyle = '#063725';
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

    if (n === 2) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx - subRadius * 0.5, cy, subRadius, 0, Math.PI * 2);
      ctx.clip();
      drawCirclePhoto(ctx, validPhotos[0], cx - subRadius * 0.5, cy, subRadius);
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx + subRadius * 0.5, cy, subRadius, 0, Math.PI * 2);
      ctx.clip();
      drawCirclePhoto(ctx, validPhotos[1], cx + subRadius * 0.5, cy, subRadius);
      ctx.restore();
    } else {
      const angles = [-Math.PI / 2, Math.PI / 6, (5 * Math.PI) / 6];
      const offset = subRadius * 0.65;
      for (let i = 0; i < 3; i++) {
        const px = cx + Math.cos(angles[i]) * offset;
        const py = cy + Math.sin(angles[i]) * offset;
        ctx.save();
        ctx.beginPath();
        ctx.arc(px, py, subRadius * 0.8, 0, Math.PI * 2);
        ctx.clip();
        drawCirclePhoto(ctx, validPhotos[i], px, py, subRadius * 0.8);
        ctx.restore();
      }
    }
  }

  // ── Builder ID Renderer using Official Template Image ────────────
  async function renderBuilderID(ctx, W, H, name, stack, builderClass, handle) {
    // 1. Ensure template image, photo images, and badge images are fully loaded before rendering
    await ensureImageLoaded(cardTemplateImg, 'card_template.png');
    await ensureImageLoaded(badge1Img, 'badge1.png');
    await ensureImageLoaded(badge2Img, 'badge2.png');
    await ensureImageLoaded(badge3Img, 'badge3.png');
    for (let i = 0; i < state.teamSize; i++) {
      if (state.photoImages[i]) {
        await ensureImageLoaded(state.photoImages[i]);
      }
    }

    const scaleX = W / 571;
    const scaleY = H / 1024;

    // Save and clip entire canvas to template rounded corners (48px border radius on 571x1024 scale)
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(0, 0, W, H, 48 * scaleX);
    ctx.clip();

    if (cardTemplateImg && cardTemplateImg.complete && cardTemplateImg.naturalWidth > 0) {
      ctx.drawImage(cardTemplateImg, 0, 0, W, H);
    } else {
      ctx.fillStyle = '#063725';
      ctx.fillRect(0, 0, W, H);
    }

    // 2. User Photo inside Circle Frame (center: 285.5, 448, radius: 136)
    const cx = 285.5 * scaleX;
    const cy = 448 * scaleY;
    const r = 136 * scaleX;

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();

    if (state.teamSize === 1) {
      drawCirclePhoto(ctx, state.photoImages[0], cx, cy, r);
    } else {
      drawMultiCirclePhotos(ctx, state.photoImages.slice(0, state.teamSize), cx, cy, r);
    }
    ctx.restore();

    // 2.5. Draw starburst sticker background from template on top of PFP to overlap it
    const bx = 412 * scaleX;
    const by = 324 * scaleY;
    
    ctx.save();
    // Clip to circular region of starburst (radius ~42) to overlay the badge shape cleanly
    ctx.beginPath();
    ctx.arc(bx, by, 42 * scaleX, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(
      cardTemplateImg,
      337, 249, 150, 150,
      337 * scaleX, 249 * scaleY, 150 * scaleX, 150 * scaleY
    );
    ctx.restore();

    // 2.6. Draw the random badge image inside the starburst (perfectly centered, radius ~35)
    const badgeIndex = (name.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)) % 3;
    const badgeImg = [badge1Img, badge2Img, badge3Img][badgeIndex];
    if (badgeImg && badgeImg.complete && badgeImg.naturalWidth > 0) {
      const br = 35 * scaleX;
      const bIconY = by + 2 * scaleY; // Move down 2 template pixels for perfect optical centering

      ctx.save();
      ctx.beginPath();
      ctx.arc(bx, bIconY, br, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(badgeImg, bx - br, bIconY - br, br * 2, br * 2);
      ctx.restore();
    }

    // 3. Name inside Green Pill Box (center: 285.5, 849, max width: 380)
    const nameX = W / 2;
    const nameY = 849 * scaleY;
    const maxNameW = 380 * scaleX;
    drawFittedText(
      ctx,
      name.toUpperCase(),
      nameX,
      nameY,
      maxNameW,
      `800 ${Math.floor(25 * scaleX)}px "Plus Jakarta Sans", sans-serif`,
      BRAND.cream,
      'center'
    );

    // 4. Primary Stack inside Yellow Pill Box (center: 285.5, 927, max width: 190)
    const stackX = W / 2;
    const stackY = 927 * scaleY;
    const maxStackW = 190 * scaleX;
    drawFittedText(
      ctx,
      stack.toUpperCase(),
      stackX,
      stackY,
      maxStackW,
      `800 ${Math.floor(18 * scaleX)}px "JetBrains Mono", sans-serif`,
      BRAND.greenDeep,
      'center'
    );

    // Restore global rounded corners clip
    ctx.restore();
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

  async function renderCard(ctx, canvas) {
    const W = canvas.width;
    const H = canvas.height;
    const name = els.nameInput.value.trim() || 'Alex Rivera';
    const stack = els.stackInput.value.trim() || 'Fullstack Engineer';
    const handle = els.phoneInput ? els.phoneInput.value.trim() : '';

    if (state.format === 'pfp') {
      await renderPFP(ctx, W, H, name);
    } else if (state.mode === 'team') {
      await renderTeamFrame(ctx, W, H, name, stack, state.builderClass);
    } else {
      // Official Hacker House Goa Builder Pass Template
      await renderBuilderID(ctx, W, H, name, stack, state.builderClass, handle);
    }
  }

  async function generateCard() {
    const name = els.nameInput.value.trim() || 'BUILDER';
    const stack = els.stackInput.value.trim() || 'DEVELOPER';

    els.btnGenerateText.textContent = 'FORGING PASS...';

    try {
      els.previewCanvas.width = 571;
      els.previewCanvas.height = 1024;
      await renderCard(previewCtx, els.previewCanvas);

      els.resultCanvas.width = 1142;
      els.resultCanvas.height = 2048;
      await renderCard(resultCtx, els.resultCanvas);

      if (els.resultWrapper && !prefersReducedMotion) {
        els.resultWrapper.classList.remove('forge-strike', 'forge-glow');
        void els.resultWrapper.offsetWidth;
        els.resultWrapper.classList.add('forge-strike');
        setTimeout(() => els.resultWrapper.classList.add('forge-glow'), 600);
      }

      showCardScreen('result');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      showToast('Your builder pass has been forged! 🔥', 'success');
    } catch (err) {
      console.error('Render error:', err);
      showToast('Render error: ' + (err.message || err), 'error');
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
  async function shareToX() {
    const name = els.nameInput.value.trim() || 'Builder';
    const stack = els.stackInput.value.trim() || 'Developer';
    const shareUrl = `${window.location.origin}${window.location.pathname}?name=${encodeURIComponent(name)}&stack=${encodeURIComponent(stack)}`;
    const caption = `Goa is calling! Locked in for Hacker House Goa 2026⚡\n\nExcited to build, collaborate, and ship alongside an incredible dev community under the sun! 🌴\n\nGet your Builder Card: ${shareUrl}\n\n#FrameInGoa #HHGoa #BuildInPublic #Hackathon`;

    const fileName = `HH-Goa-2026-${name.replace(/\s+/g, '-')}.png`;
    const dataUrl = els.resultCanvas.toDataURL('image/png');

    const link = document.createElement('a');
    link.download = fileName;
    link.href = dataUrl;
    link.click();

    if (navigator.share && navigator.canShare) {
      try {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const file = new File([blob], fileName, { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'Hacker House Goa 2026 Pass',
            text: caption,
            files: [file]
          });
          showToast('Shared successfully! 🚀', 'success');
          return;
        }
      } catch (err) {
        console.log('Web share fallback to Twitter intent:', err);
      }
    }

    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(caption)}`, '_blank');
    showToast('Image saved! Twitter opened to share your pass 🐦', 'success');
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

    sampleCanvas.toBlob((blob) => {
      const file = new File([blob], 'sample.png', { type: 'image/png' });
      handlePhotoUpload(file, 0);
      
      if (!els.nameInput.value) els.nameInput.value = 'Alex Rivera';
      if (!els.stackInput.value) els.stackInput.value = 'Fullstack Engineer';
      
      showToast('Sample data & photo loaded!', 'success');
    }, 'image/png');
  }

  // ── Crop Controls Init ────────────────────────────────────────
  function initCropControls() {
    const mask = document.querySelector('.crop-mask');
    if (!mask || !els.zoomSlider) return;

    els.zoomSlider.addEventListener('input', (e) => {
      const oldScale = cropState.scale;
      cropState.scale = parseFloat(e.target.value);
      
      const maskSize = 240;
      cropState.dx = maskSize/2 - (maskSize/2 - cropState.dx) * (cropState.scale / oldScale);
      cropState.dy = maskSize/2 - (maskSize/2 - cropState.dy) * (cropState.scale / oldScale);
      
      updateCropTransform();
    });
    
    mask.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomStep = (parseFloat(els.zoomSlider.max) - parseFloat(els.zoomSlider.min)) / 100;
      const newScale = e.deltaY < 0 ? cropState.scale + zoomStep : cropState.scale - zoomStep;
      if (newScale >= parseFloat(els.zoomSlider.min) && newScale <= parseFloat(els.zoomSlider.max)) {
        els.zoomSlider.value = newScale;
        els.zoomSlider.dispatchEvent(new Event('input'));
      }
    }, { passive: false });

    const startDrag = (x, y) => {
      cropState.isDragging = true;
      cropState.startX = x - cropState.dx;
      cropState.startY = y - cropState.dy;
    };
    
    const moveDrag = (x, y) => {
      if (!cropState.isDragging) return;
      cropState.dx = x - cropState.startX;
      cropState.dy = y - cropState.startY;
      updateCropTransform();
    };

    mask.addEventListener('mousedown', (e) => startDrag(e.clientX, e.clientY));
    window.addEventListener('mousemove', (e) => moveDrag(e.clientX, e.clientY));
    window.addEventListener('mouseup', () => cropState.isDragging = false);

    mask.addEventListener('touchstart', (e) => startDrag(e.touches[0].clientX, e.touches[0].clientY), {passive: true});
    window.addEventListener('touchmove', (e) => moveDrag(e.touches[0].clientX, e.touches[0].clientY), {passive: true});
    window.addEventListener('touchend', () => cropState.isDragging = false);
    
    if (els.btnChangePhoto) {
      els.btnChangePhoto.addEventListener('click', () => {
        els.photoInput1.click();
      });
    }
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
    initCropInteractions();

    // ── Card screen navigation ──
    const heroSection = $('screenHero');
    const generatorSection = $('generatorSection');

    $('btnStartGenerator').addEventListener('click', () => {
      heroSection.style.display = 'none';
      generatorSection.style.display = 'flex';
      showCardScreen('form');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    $('btnCancelForm').addEventListener('click', () => {
      generatorSection.style.display = 'none';
      heroSection.style.display = 'flex';
      showCardScreen('form');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    $('btnNewCard').addEventListener('click', () => {
      els.nameInput.value = '';
      els.stackInput.value = '';
      [els.nameInput, els.stackInput].forEach(el => el.classList.remove('valid', 'invalid'));
      [els.nameFeedback, els.stackFeedback].forEach(el => { el.textContent = ''; el.className = 'input-feedback'; });
      if (els.resultWrapper) els.resultWrapper.classList.remove('forge-strike', 'forge-glow');
      showCardScreen('form');
    });

    // Team badge element (non-clickable info tag)
    const navBtnTeam = $('navBtnTeam');
    if ($('btnCloseAbout')) {
      $('btnCloseAbout').addEventListener('click', () => {
        showCardScreen('form');
      });
    }

    // ── Format/Mode toggles (radio-based) ──
    setupRadioToggle(els.formatToggle, onFormatChange);
    setupRadioToggle(els.modeToggle, setMode);

    // ── Photo uploads ──
    if (els.photoInput1) els.photoInput1.addEventListener('change', (e) => handlePhotoUpload(e.target.files[0], 0));

    if ($('btnCamera')) $('btnCamera').addEventListener('click', () => els.cameraInput.click());
    if (els.cameraInput) els.cameraInput.addEventListener('change', (e) => handlePhotoUpload(e.target.files[0], 0));
    if ($('btnSample')) $('btnSample').addEventListener('click', loadSamplePhoto);

    // ── Validation ──
    setupValidation();

    // ── Generate ──
    if ($('btnGenerate')) $('btnGenerate').addEventListener('click', generateCard);

    // ── Result actions ──
    if ($('btnDownload')) $('btnDownload').addEventListener('click', downloadPNG);
    if ($('btnShareX')) $('btnShareX').addEventListener('click', shareToX);

    // ── Drag & drop ──
    setupDragDrop();

    // ── URL params (QR scan) ──
    checkURLParams();

    // ── Initial screen ──
    if (window.location.search.includes('name=')) {
      heroSection.style.display = 'none';
      generatorSection.style.display = 'flex';
    } else {
      heroSection.style.display = 'flex';
      generatorSection.style.display = 'none';
    }
  }

  // Wait for fonts, then init
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(init);
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }

})();
