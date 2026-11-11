/* Mini game CV v3.0: interaktif, hidup, responsif.
   Logika inti (fisika, blok, permata, panel CV) dipertahankan. Tambahan:
   klik/tap blok untuk auto-lari, tombol angka 1-N, chip navigasi, siang/malam (klik matahari),
   kamera yang mengikuti di layar sempit, kombo permata, jejak kilau pointer, perayaan saat menang. */
(() => {
  const root = document.getElementById('arena');
  if (!root) return;
  const canvas = root.querySelector('canvas');
  const stage = root.querySelector('.arena-stage');
  const panel = root.querySelector('.arena-panel');
  const panelTitle = root.querySelector('.arena-panel-title');
  const panelBody = root.querySelector('.arena-panel-body');
  const closeBtn = root.querySelector('.arena-close');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  root.hidden = false;

  const reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const W = 720, H = 300, GROUND = 250, STEP = 1000 / 60;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let VW = W, cam = 0; // lebar pandang (layar sempit = lebih sempit) dan posisi kamera

  const css = (n, f) => getComputedStyle(document.documentElement).getPropertyValue(n).trim() || f;
  const C = {
    sky: css('--sky', '#8ec9f9'), ice: css('--ice', '#d4e9fa'), carbon: css('--carbon', '#21242e'),
    chrome: css('--chrome', '#3d4f97'), amber: css('--amber', '#ffca28'), gold: css('--nav-gold', '#f57c00'),
    signal: css('--signal', '#ff5252'), white: '#fff',
  };
  const RAINBOW = ['#ff4b4b', '#ffb300', '#00e676', '#00b0ff', '#ff6fb5'];
  const FONT = '700 9px Silkscreen, Arial, sans-serif';
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* ---------- Suara (WebAudio, nada kartun) ---------- */
  let AC = null, master = null, muted = false;
  try { muted = localStorage.getItem('arena-muted') === '1'; } catch (e) {}
  function audio() {
    if (AC) { if (AC.state === 'suspended') AC.resume(); return AC; }
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    try {
      AC = new Ctor();
      master = AC.createGain(); master.gain.value = 0.2; master.connect(AC.destination);
    } catch (e) { AC = null; }
    return AC;
  }
  function tone(freq, dur, o = {}) {
    if (muted) return;
    const ac = audio(); if (!ac) return;
    const t = ac.currentTime + (o.delay || 0), vol = o.vol || 0.5;
    const osc = ac.createOscillator(), g = ac.createGain();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(freq, t);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g); g.connect(master);
    osc.start(t); osc.stop(t + dur + 0.03);
  }
  function noise(dur, vol, cutoff) {
    if (muted) return;
    const ac = audio(); if (!ac) return;
    const len = Math.max(1, Math.floor(ac.sampleRate * dur));
    const buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ac.createBufferSource(); src.buffer = buf;
    const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = cutoff;
    const g = ac.createGain(); g.gain.value = vol;
    src.connect(f); f.connect(g); g.connect(master); src.start();
  }
  const sfx = {
    jump() { tone(350, 0.2, { type: 'sine', to: 850, vol: 0.4 }); },
    land() { tone(150, 0.12, { type: 'sine', to: 80, vol: 0.5 }); noise(0.06, 0.4, 400); },
    bump() {
      tone(880, 0.1, { type: 'square', vol: 0.4 });
      tone(1320, 0.15, { type: 'square', delay: 0.05, vol: 0.4 });
    },
    gem(combo = 0) {
      const m = 1 + Math.min(combo, 6) * 0.09; // nada naik tiap kombo
      tone(523 * m, 0.08, { type: 'sine', vol: 0.5 });
      tone(784 * m, 0.12, { type: 'sine', delay: 0.06, vol: 0.5 });
      tone(1046 * m, 0.18, { type: 'sine', delay: 0.12, vol: 0.5 });
    },
    win() { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.15, { type: 'square', vol: 0.4, delay: i * 0.12 })); },
    pop() { tone(620, 0.07, { type: 'sine', to: 980, vol: 0.3 }); },
    day() { tone(400, 0.25, { type: 'sine', to: 900, vol: 0.35 }); },
    night() { tone(900, 0.25, { type: 'sine', to: 380, vol: 0.35 }); },
    sprout() { tone(240, 0.34, { type: 'triangle', to: 820, vol: 0.4 }); tone(480, 0.2, { type: 'sine', to: 960, vol: 0.2, delay: 0.14 }); },
    power(d = 0) { [392, 523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.1, { type: 'square', vol: 0.3, delay: d + i * 0.06 })); },
    eat() { // nyam nyam nyam, glek, lalu fanfare level-up
      [0, 80, 160].forEach((ms, i) => {
        tone(240 - i * 25, 0.07, { type: 'square', to: 110, vol: 0.32, delay: ms / 1000 });
        setTimeout(() => noise(0.05, 0.32, 1000 + i * 300), ms);
      });
      tone(320, 0.14, { type: 'sine', to: 90, vol: 0.45, delay: 0.25 });
      sfx.power(0.3);
    },
    poof() { noise(0.14, 0.35, 1400); tone(520, 0.12, { type: 'sine', to: 180, vol: 0.3 }); },
  };

  /* ---------- Bilah alat ---------- */
  const tools = document.createElement('div'); tools.className = 'arena-tools';
  const hint = document.createElement('span'); hint.className = 'arena-hint';
  const btns = document.createElement('div'); btns.className = 'arena-btns';
  const muteBtn = document.createElement('button'); muteBtn.type = 'button'; muteBtn.className = 'arena-btn';
  const resetBtn = document.createElement('button'); resetBtn.type = 'button'; resetBtn.className = 'arena-btn'; resetBtn.textContent = 'Play Again ↺';
  btns.append(muteBtn, resetBtn); tools.append(hint, btns); root.insertBefore(tools, stage);
  function paintMute() {
    muteBtn.textContent = muted ? 'Sound: Off' : 'Sound: On';
    muteBtn.setAttribute('aria-pressed', muted ? 'true' : 'false');
  }
  function toggleMute() {
    muted = !muted; try { localStorage.setItem('arena-muted', muted ? '1' : '0'); } catch (e) {}
    paintMute(); if (!muted) { audio(); tone(880, 0.1, { type: 'sine', to: 1200, vol: 0.4 }); }
  }
  paintMute(); muteBtn.addEventListener('click', toggleMute);

  /* ---------- Dunia & objek ---------- */
  const SHORT = { profil: 'Profile', pendidikan: 'Education', pengalaman: 'Experience', proyek: 'Projects', pencapaian: 'Awards', skill: 'Skills' };
  const ids = Object.keys(SHORT).filter((id) => document.getElementById(id));
  const BS = 44, BOTTOM = GROUND - 80;
  const gap = (W - 120) / Math.max(ids.length - 1, 1);
  const blocks = ids.map((id, i) => ({ id, label: SHORT[id], x: Math.round(60 + i * gap - BS / 2), y: BOTTOM - BS, w: BS, h: BS, bump: 0, seen: false, bobK: 1, hold: false }));
  const gems = [];
  for (let i = 0; i < blocks.length - 1; i++) {
    gems.push({ x: Math.round((blocks[i].x + blocks[i + 1].x) / 2 + BS / 2), y: GROUND - (i % 2 ? 78 : 22), got: false, ph: i });
  }
  hint.textContent = 'Arrows ← → move · Space jump · Click a block or press 1-' + Math.max(blocks.length, 1) + ' · Click the sun · M sound';

  /* Chip navigasi: jalan pintas yang bisa dipakai keyboard, mouse, dan sentuh */
  const chips = document.createElement('div'); chips.className = 'arena-chips';
  chips.setAttribute('role', 'group'); chips.setAttribute('aria-label', 'Run straight to a CV section');
  const chipEls = blocks.map((b, i) => {
    const c = document.createElement('button'); c.type = 'button'; c.className = 'arena-chip';
    const n = document.createElement('span'); n.className = 'n'; n.textContent = String(i + 1);
    const t = document.createElement('span'); t.textContent = b.label;
    c.append(n, t);
    c.addEventListener('click', () => { if (!muted) audio(); goTo(b); try { stage.focus({ preventScroll: true }); } catch (e) {} });
    chips.append(c);
    return c;
  });
  if (blocks.length) root.insertBefore(chips, stage);
  function paintChips() {
    chipEls.forEach((c, i) => {
      const seen = blocks[i].seen;
      c.classList.toggle('done', seen);
      c.firstChild.textContent = seen ? '✓' : String(i + 1);
      c.setAttribute('aria-label', blocks[i].label + (seen ? ', already opened' : ', not opened yet'));
    });
  }
  const live = document.createElement('p'); live.className = 'arena-live';
  live.setAttribute('role', 'status'); live.setAttribute('aria-live', 'polite'); root.append(live);

  const P = { w: 20, h: 30 };
  const p = { x: 24, y: GROUND - P.h, vx: 0, vy: 0, face: 1, ground: true, coyote: 0 };
  const G = 0.6, JUMP = -11.5, MAXV = 3.4;
  const keys = { left: false, right: false };
  let jumpBuf = 0;
  const S = {
    t: 0, opened: 0, gems: 0, won: false, winT: 0, idle: 0, shake: 0, squash: 0, bubble: '', bubbleT: 0, anim: 0,
    night: 0, nightTo: 0, combo: 0, comboT: 0, auto: null, ptr: null, power: 0, ring: 0, lvl: 0, chomp: 0,
  };

  const parts = [], floats = [];
  const clouds = [{ x: 90, y: 30, s: 0.12 }, { x: 330, y: 58, s: 0.08 }, { x: 560, y: 24, s: 0.1 }];
  const birds = [{ x: -20, y: 78, s: 0.55, ph: 0 }, { x: -170, y: 102, s: 0.4, ph: 2 }];
  const motes = Array.from({ length: 16 }, () => ({ x: Math.random() * W, y: Math.random() * (GROUND - 40), ph: Math.random() * 10 }));
  const stars = Array.from({ length: 44 }, () => ({ x: Math.random() * W, y: 6 + Math.random() * (GROUND * 0.62), ph: Math.random() * 10 }));

  /* ---------- Layar sempit: kamera mengikuti karakter ---------- */
  const narrowMQ = window.matchMedia ? window.matchMedia('(max-width: 560px)') : null;
  function followCam(snap) {
    const target = clamp(p.x + P.w / 2 - VW / 2, 0, W - VW);
    cam = (snap || reduce) ? target : cam + (target - cam) * 0.12;
  }
  function setView() {
    VW = narrowMQ && narrowMQ.matches ? 420 : W;
    canvas.width = VW * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    stage.style.aspectRatio = VW + ' / ' + H;
    followCam(true);
  }
  setView();
  const onView = () => { setView(); draw(); };
  if (narrowMQ) { if (narrowMQ.addEventListener) narrowMQ.addEventListener('change', onView); else if (narrowMQ.addListener) narrowMQ.addListener(onView); }

  /* ---------- Sprite ---------- */
  const PAL = { K: '#21242e', E: '#21242e', C: '#00b0ff', c: '#40c4ff', H: '#5a3a22', S: '#ffca28', M: '#ff5252', O: '#f57c00', D: '#c26d0a', B: '#8a5a2b', P: '#283593', W: '#fff' };
  const TOP = ['...KKKKKK...', '..KCCCCCCK..', '.KCCcCCCCCK.', '.KCCCCCCCKKK', '.KHSSSSSSK..', '.KHSSESSEK..', '.KSSSSSSSK..', '..KSSMMSK...', 'KBBKOOOOKSK.', 'KBBKODDOKSK.', '.KKKOOOOKK..', '...KPPPPK...'];
  const BLINK = '.KHSSSSSSK..'; const OPEN = '..KSSKKSK...';
  const LEGS = { stand: ['..KPPKKPPK..', '..KPPK.KPPK.', '.KWWWK.KWWWK'], a: ['..KPPKKPPK..', '.KPPK..KPPK.', 'KWWK....KWWK'], b: ['..KPPKKPPK..', '...KPPPPK...', '...KWWWWK...'], jump: ['.KPPK..KPPK.', 'KPPK....KPPK', 'KWWK....KWWK'] };

  /* ---------- Efek visual ---------- */
  function burst(x, y, n, colors, o = {}) {
    if (reduce) return;
    for (let i = 0; i < n; i++) {
      const a = o.arc ? o.arc[0] + Math.random() * (o.arc[1] - o.arc[0]) : Math.random() * Math.PI * 2;
      const sp = (o.speed || 2) * (0.4 + Math.random() * 0.8);
      parts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0, max: o.max || (22 + Math.random() * 20), c: colors[i % colors.length], s: 2 + ((Math.random() * 2) | 0), g: o.g === undefined ? 0.12 : o.g });
    }
  }
  const dust = (x, y, n) => burst(x, y, n, ['rgba(255,255,255,.75)'], { arc: [Math.PI * 1.1, Math.PI * 1.9], speed: 1.4, g: 0.02 });
  const say = (txt, frames = 150) => { S.bubble = txt; S.bubbleT = frames; };
  const floatText = (x, y, txt, c) => floats.push({ x, y, txt, c, life: 0, max: 46 });

  /* ---------- Panel CV ---------- */
  function openPanel(b, originPct) {
    const src = document.getElementById(b.id); if (!src) return;
    const title = (src.querySelector('.bar-title, .tab') || {}).textContent || b.label;
    const clone = src.cloneNode(true);
    clone.removeAttribute('id'); clone.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'));
    clone.querySelectorAll('.bar-title, .tab').forEach((n) => n.remove());
    let body = clone.querySelector('.pad');
    if (!body) { body = document.createElement('div'); body.className = 'pad'; body.append(...clone.childNodes); }
    panelTitle.textContent = title.trim(); panelBody.replaceChildren(body);
    panel.hidden = false; panel.classList.remove('pop', 'shroom'); void panel.offsetWidth;
    panel.style.transformOrigin = originPct == null ? '' : originPct + '% 0';
    panel.classList.add('pop'); if (originPct != null) panel.classList.add('shroom');
    b.seen = true;
    try { panel.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' }); } catch (e) {}
  }
  const closePanel = () => { panel.hidden = true; };
  closeBtn.addEventListener('click', closePanel);

  function winGame() {
    S.won = true; S.winT = 0; say('Hooray! All unlocked!', 260); sfx.win();
    burst(cam + VW / 2, 0, 100, RAINBOW, { speed: 3, g: 0.05, arc: [0, Math.PI], max: 150 });
  }
  function bumpBlock(b) {
    b.bump = 1; S.shake = reduce ? 0 : 8; sfx.bump(); S.auto = null;
    try { if (!reduce && navigator.vibrate) navigator.vibrate(12); } catch (e) {}
    const cx = b.x + b.w / 2;
    burst(cx, b.y + b.h / 2, 25, RAINBOW, { speed: 3 });
    floatText(cx, b.y - 14, b.label, C.white);
    if (b.id === 'pendidikan') { spawnShroom(b); return; } // isi dibuka setelah jamur mendarat
    revealBlock(b);
  }
  function revealBlock(b, originPct) {
    const first = !b.seen; openPanel(b, originPct);
    if (first) {
      S.opened++; paintChips();
      live.textContent = S.opened + ' of ' + blocks.length + ' sections opened: ' + b.label;
      if (S.opened === blocks.length) winGame(); else say(pick(['Woohoo!', 'Unlocked!', 'Got it!', 'Nice!', 'Boop!']));
    }
  }

  /* ---------- Jamur Ilmu (keluar dari blok Pendidikan) ---------- */
  const MS = { w: 28, h: 28 };
  let shroom = null;
  const SPAL = { K: '#21242e', R: '#ff4b4b', W: '#fff', S: '#ffe3a8', E: '#21242e', M: '#d63838', P: '#ff9fb2', G: '#ffca28' };
  const SHROOM = [
    '....KKKKKK....', '..KKRRRRRRKK..', '.KRRWWRRRRWWRK', 'KRRWWWRRRRWWRK', 'KRRRWRRRWWWRRK', 'KKKKKKKKKKKKKK',
    '.KSSSSSSSSSSK.', '.KSEESSSSEESK.', '.KSEESSSSEESK.', '.KSPSSMMSSPSK.', '..KSSSSSSSSK..', '...KKSSSSKK...',
  ];
  const SLEGS = [['..KSSK..KSSK..', '..KKKK..KKKK..'], ['...KSSKKSSK...', '...KKKKKKKK...']];
  function spawnShroom(b) {
    if (shroom) return;
    shroom = { b, x: b.x + b.w / 2 - MS.w / 2, y: b.y + 12, y0: b.y + 12, y1: b.y - MS.h, vx: 0, vy: 0, st: 'rise', t: 0, landed: false, ph: 0, face: b.x + b.w / 2 < W / 2 ? 1 : -1, life: 0, squash: 0 };
    b.hold = true; sfx.sprout();
    say('Something popped out!', 100);
    live.textContent = 'A mushroom came out of the block: ' + b.label;
  }
  function shroomLand(m) {
    m.landed = true; m.squash = 1; m.vy = -4.2; m.st = 'roam'; m.vx = m.face * 0.7;
    S.shake = reduce ? 0 : 4; sfx.land();
    dust(m.x + MS.w / 2, GROUND, 10);
    burst(m.x + MS.w / 2, GROUND - 10, 16, RAINBOW, { speed: 2.4 });
    floatText(m.x + MS.w / 2, GROUND - 44, 'GRAB IT!', C.amber);
    say('Grab the mushroom!', 200);
    live.textContent = 'The mushroom landed. Touch it to open Education. Press E to chase it.';
  }
  function chaseShroom() {
    if (shroom && shroom.st === 'roam') {
      S.auto = { chase: true, x: shroom.x + MS.w / 2, t: 0 }; S.idle = 0; sfx.pop(); say('Chase!', 80);
    } else if (!shroom) say('Bump the Education block first!', 120);
    else say('Wait for the mushroom to come down!', 90);
  }
  // Dimakan: jamur tersedot ke mulut, karakter mengunyah, baru panel terbuka
  function collectShroom() {
    const m = shroom; m.st = 'eaten'; m.t2 = 0; S.chomp = 30; S.auto = null;
    sfx.eat(); say('NOM NOM NOM!', 50);
    live.textContent = 'Mushroom eaten';
  }
  function finishEat() {
    const m = shroom; shroom = null;
    S.power = 900; S.ring = 34; S.lvl = 26; // mode ilmu 15 detik
    S.shake = reduce ? 0 : 5;
    burst(p.x + P.w / 2, p.y, 34, RAINBOW, { speed: 3.4 });
    floatText(p.x + P.w / 2, p.y - 16, 'LEVEL UP!', C.amber);
    const pct = clamp((p.x + P.w / 2 - cam) / VW * 100, 0, 100);
    revealBlock(m.b, pct);
    live.textContent += '. Knowledge mode on: run faster for 15 seconds.';
  }
  function updateShroom() {
    const m = shroom; if (!m) return;
    m.t++; if (m.squash > 0) m.squash = Math.max(0, m.squash - 0.08);
    if (m.st === 'eaten') {
      m.t2++;
      m.x += (p.x + P.w / 2 - MS.w / 2 - m.x) * 0.3; m.y += (p.y - 8 - m.y) * 0.3;
      if (m.t2 === 4 || m.t2 === 12 || m.t2 === 20) {
        floatText(p.x + P.w / 2, p.y - 16, 'NOM!', C.amber);
        burst(p.x + P.w / 2, p.y - 2, 5, ['#ff4b4b', '#fff', '#ffe3a8'], { speed: 1.8 });
      }
      if (m.t2 >= 28) finishEat();
      return;
    }
    if (m.st === 'rise') {
      const u = Math.min(1, m.t / 34), e = 1 - Math.pow(1 - u, 3);
      m.y = m.y0 + (m.y1 - m.y0) * e;
      if (m.t % 5 === 0) burst(m.x + MS.w / 2, m.b.y - 2, 2, ['#ffca28', '#fff'], { speed: 1, arc: [Math.PI * 1.1, Math.PI * 1.9], g: 0.03, max: 18 });
      if (u >= 1) { m.st = 'walk'; m.vx = m.face * 0.8; }
      return;
    }
    if (m.st === 'walk') {
      m.x += m.vx; m.ph += 0.2; m.y = m.b.y - MS.h;
      const c = m.x + MS.w / 2;
      if (c > m.b.x + m.b.w || c < m.b.x) { // lompat kecil dari tepi blok
        m.st = 'fall'; m.b.hold = false; m.vx = m.face * 1.7; m.vy = -2.8; sfx.pop();
      }
      return;
    }
    // jatuh & berkeliaran di tanah
    m.vy = Math.min(m.vy + 0.4, 9); m.x += m.vx; m.y += m.vy;
    if (m.y + MS.h >= GROUND) {
      m.y = GROUND - MS.h;
      if (!m.landed) { shroomLand(m); return; }
      m.vy = 0;
    }
    if (m.st === 'fall') return;
    m.life++;
    const onGround = m.y + MS.h >= GROUND;
    const lo = 8, hi = W - MS.w - 8;
    let wall = 0;
    if (m.x <= lo) { m.x = lo; wall = -1; } else if (m.x >= hi) { m.x = hi; wall = 1; }
    const mcx = m.x + MS.w / 2, dx = mcx - (p.x + P.w / 2), dist = Math.abs(dx), d = dx >= 0 ? 1 : -1;
    if (onGround) {
      m.ph += 0.18;
      if (dist < 110) { // kabur dari pemain
        if (!m.scared) { m.scared = true; floatText(mcx, m.y - 10, 'EEK!', C.signal); sfx.pop(); }
        if (wall === d && dist < 80) { // terpojok: lompat melewati kepala pemain
          m.vy = -7; m.vx = -d * 2.4; m.face = -d; floatText(mcx, m.y - 10, 'HUP!', C.amber); sfx.jump();
        } else if (wall !== d) { m.vx = d * 1.6; m.face = d; }
        else m.vx = 0;
      } else {
        m.scared = false;
        if (wall) m.face = -wall;
        m.vx = m.face * 0.6;
        if (m.life % 70 === 0) m.vy = -3.6;
      }
    }
    if (m.life > 20 && hit(box(), { x: m.x, y: m.y, w: MS.w, h: MS.h })) collectShroom();
  }
  function drawShroom(hover) {
    const m = shroom; if (!m) return;
    const eaten = m.st === 'eaten';
    let sx = 1, sy = 1;
    if (eaten) { sx = sy = Math.max(0.05, 1 - m.t2 / 28); }
    else if (!reduce) {
      if (m.squash > 0) { sy = 1 - 0.4 * m.squash; sx = 1 + 0.4 * m.squash; }
      else if (m.st === 'fall') { sy = 1.12; sx = 0.9; }
      else if (m.st === 'roam' && m.vy === 0) { sy = 1 + Math.sin(S.t * 0.3) * 0.04; }
    }
    const cx = m.x + MS.w / 2, by = m.y + MS.h;
    if (m.st !== 'rise' && !eaten) {
      const height = Math.max(0, GROUND - by);
      ctx.fillStyle = 'rgba(0,0,0,' + (0.25 * Math.max(0.2, 1 - height / 140)) + ')';
      ctx.beginPath(); ctx.ellipse(cx, GROUND + 3, 12 * (1 - Math.min(height, 120) / 300), 3, 0, 0, Math.PI * 2); ctx.fill();
    }
    if (m.st === 'roam') { // aura + panah "ambil aku"
      ctx.globalAlpha = reduce ? 0.2 : 0.14 + 0.1 * Math.sin(S.t * 0.15);
      ctx.fillStyle = C.amber; ctx.beginPath(); ctx.arc(cx, m.y + MS.h / 2, 24, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
      const ay = Math.round(m.y - 16 + (reduce ? 0 : Math.sin(S.t * 0.2) * 3));
      ctx.fillStyle = C.carbon; ctx.fillRect(cx - 7, ay - 2, 14, 4); ctx.fillRect(cx - 5, ay + 2, 10, 4); ctx.fillRect(cx - 3, ay + 6, 6, 4); ctx.fillRect(cx - 1, ay + 10, 2, 2);
      ctx.fillStyle = C.amber; ctx.fillRect(cx - 5, ay, 10, 2); ctx.fillRect(cx - 3, ay + 2, 6, 2); ctx.fillRect(cx - 1, ay + 4, 2, 2);
    }
    const rows = SHROOM.slice();
    if (S.t % 170 < 6) { rows[7] = '.KSSSSSSSSSSK.'; rows[8] = '.KSSSSSSSSSSK.'; }
    if (m.st === 'fall' || m.scared || eaten) rows[9] = '.KSSSKKKKSSSK.';
    const legs = SLEGS[Math.floor(m.ph) % 2];
    ctx.save(); ctx.translate(Math.round(cx), Math.round(by)); ctx.scale(sx, sy);
    if (m.face < 0) ctx.scale(-1, 1);
    if (!reduce) { if (m.st === 'fall') ctx.rotate(Math.sin(S.t * 0.25) * 0.12); else if (eaten) ctx.rotate(m.t2 * 0.35); }
    ctx.translate(-MS.w / 2, -MS.h);
    rows.concat(legs).forEach((row, ry) => {
      for (let rx = 0; rx < row.length; rx++) { const c = SPAL[row[rx]]; if (c) { ctx.fillStyle = c; ctx.fillRect(rx * 2, ry * 2, 2, 2); } }
    });
    ctx.restore();
    if (hover && m.st === 'roam') { // pil petunjuk saat disorot mouse
      ctx.font = FONT; ctx.textAlign = 'center';
      const tip = 'CLICK · CHASE', tw = Math.ceil(ctx.measureText(tip).width) + 12, ty = Math.round(m.y - 40);
      ctx.fillStyle = C.carbon; ctx.fillRect(cx - tw / 2 - 2, ty - 2, tw + 4, 18);
      ctx.fillStyle = C.amber; ctx.fillRect(cx - tw / 2, ty, tw, 14);
      ctx.fillStyle = C.carbon; ctx.fillText(tip, cx, ty + 10);
    }
  }
  // Petunjuk di tepi layar kalau jamur di luar pandangan (layar sempit)
  function drawShroomPointer() {
    const m = shroom; if (!m || m.st !== 'roam') return;
    const sxc = m.x + MS.w / 2 - cam; if (sxc >= 6 && sxc <= VW - 6) return;
    const left = sxc < 6, y = GROUND - 46;
    ctx.font = FONT;
    const label = 'MUSHROOM', tw = Math.ceil(ctx.measureText(label).width) + 26;
    const pulse = reduce ? 0 : Math.round(Math.sin(S.t * 0.2) * 2) * (left ? -1 : 1);
    const bx = (left ? 6 : VW - 6 - tw) + pulse;
    ctx.fillStyle = C.carbon; ctx.fillRect(bx - 2, y - 2, tw + 4, 20);
    ctx.fillStyle = C.amber; ctx.fillRect(bx, y, tw, 16);
    ctx.fillStyle = C.carbon;
    if (left) { ctx.fillRect(bx + 9, y + 4, 4, 8); ctx.fillRect(bx + 7, y + 6, 2, 4); ctx.fillRect(bx + 5, y + 7, 2, 2); ctx.textAlign = 'left'; ctx.fillText(label, bx + 17, y + 12); }
    else { ctx.fillRect(bx + tw - 13, y + 4, 4, 8); ctx.fillRect(bx + tw - 9, y + 6, 2, 4); ctx.fillRect(bx + tw - 7, y + 7, 2, 2); ctx.textAlign = 'right'; ctx.fillText(label, bx + tw - 17, y + 12); }
  }
  function resetGame() {
    blocks.forEach((b) => { b.seen = false; b.bump = 0; }); gems.forEach((g) => { g.got = false; });
    S.opened = 0; S.gems = 0; S.won = false; S.winT = 0; S.idle = 0; S.squash = 0; S.combo = 0; S.comboT = 0; S.auto = null; S.power = 0; S.ring = 0; S.lvl = 0; S.chomp = 0; shroom = null;
    blocks.forEach((b) => { b.hold = false; b.bobK = 1; });
    p.x = 24; p.y = GROUND - P.h; p.vx = 0; p.vy = 0; p.face = 1; p.ground = true;
    parts.length = 0; floats.length = 0; closePanel(); paintChips(); followCam(true);
    live.textContent = 'Game restarted';
    say("Let's play again!"); draw(); stage.focus();
  }
  resetBtn.addEventListener('click', resetGame);
  paintChips();

  /* ---------- Interaksi: auto-lari ke blok, siang/malam ---------- */
  function goTo(b) {
    if (b.id === 'pendidikan' && shroom) { chaseShroom(); return; }
    S.auto = { x: b.x + b.w / 2, b, t: 0 };
    S.idle = 0; sfx.pop();
    say(pick(['On my way to ' + b.label + '!', 'Zooming!', 'Aye aye, boss!']), 90);
  }
  function toggleNight() {
    S.nightTo = S.nightTo ? 0 : 1;
    if (S.nightTo) sfx.night(); else sfx.day();
    const sx = cam + VW - 110;
    burst(sx, 52, 18, S.nightTo ? ['#fff8d6', '#bcd7ff'] : ['#ffe14d', '#ffb300'], { speed: 2.4, g: 0 });
    say(S.nightTo ? 'Good night!' : 'Good morning!', 110);
  }
  const SUN = () => ({ x: VW - 110, y: 52 });
  function hoverAt() {
    const r = { block: null, sun: false, shroom: false };
    const q = S.ptr; if (!q) return r;
    const wx = q.x + cam;
    for (const b of blocks) {
      if (wx >= b.x - 4 && wx <= b.x + b.w + 4 && q.y >= b.y - 18 && q.y <= b.y + b.h + 4) { r.block = b; break; }
    }
    const m = shroom;
    if (m && m.st === 'roam' && wx >= m.x - 8 && wx <= m.x + MS.w + 8 && q.y >= m.y - 16 && q.y <= m.y + MS.h + 6) { r.shroom = true; r.block = null; }
    const s = SUN(); r.sun = !r.block && !r.shroom && Math.hypot(q.x - s.x, q.y - s.y) < 30;
    return r;
  }
  function setPtr(e) {
    const rc = canvas.getBoundingClientRect();
    if (!rc.width) return;
    S.ptr = { x: (e.clientX - rc.left) / rc.width * VW, y: (e.clientY - rc.top) / rc.height * H, mouse: e.pointerType === 'mouse' };
  }
  let lastSpark = 0;
  stage.addEventListener('pointermove', (e) => {
    if (e.target.closest && e.target.closest('.arena-pad')) return;
    setPtr(e);
    const h = hoverAt();
    canvas.style.cursor = h.block || h.sun || h.shroom ? 'pointer' : 'default';
    const now = performance.now();
    if (S.ptr && S.ptr.mouse && now - lastSpark > 45) {
      lastSpark = now;
      burst(S.ptr.x + cam, S.ptr.y, 1, RAINBOW, { speed: 0.7, max: 26, g: 0.02 });
    }
  });
  stage.addEventListener('pointerleave', () => { S.ptr = null; canvas.style.cursor = 'default'; });
  stage.addEventListener('pointerup', (e) => { if (e.pointerType !== 'mouse') S.ptr = null; });
  stage.addEventListener('pointerdown', (e) => {
    if (!muted) audio();
    if (e.target.closest && e.target.closest('.arena-pad')) return;
    setPtr(e);
    const h = hoverAt();
    if (h.shroom) chaseShroom();
    else if (h.block) goTo(h.block);
    else if (h.sun) toggleNight();
    else if (S.ptr) burst(S.ptr.x + cam, S.ptr.y, 10, RAINBOW, { speed: 2 });
  });

  /* ---------- Fisika & loop inti ---------- */
  const hit = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  const box = () => ({ x: p.x, y: p.y, w: P.w, h: P.h });

  function step() {
    S.t++;
    const wasGround = p.ground;
    let dir = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);

    // Auto-lari: dibatalkan kalau pemain pegang tombol arah
    if (dir && S.auto) S.auto = null;
    if (!dir && S.auto) {
      const a = S.auto; a.t++;
      if (a.chase) { if (shroom && shroom.st === 'roam') a.x = shroom.x + MS.w / 2; else S.auto = null; }
      if (S.auto) {
        const dx = a.x - (p.x + P.w / 2);
        if (a.t > 420) S.auto = null;
        else if (Math.abs(dx) > (a.chase ? 6 : (p.ground ? 14 : 20))) dir = dx > 0 ? 1 : -1;
        else if (!a.chase && p.ground && jumpBuf === 0) jumpBuf = 8;
      }
    }

    if (dir) { p.vx += dir * (p.ground ? 0.55 : 0.4); p.face = dir; S.idle = 0; }
    else { p.vx *= 0.8; if (Math.abs(p.vx) < 0.05) p.vx = 0; if (p.ground) S.idle++; }
    const vmax = S.power > 0 ? MAXV * 1.3 : MAXV;
    p.vx = Math.max(-vmax, Math.min(vmax, p.vx));

    p.x += p.vx; p.x = Math.max(0, Math.min(W - P.w, p.x));
    for (const b of blocks) { if (hit(box(), b)) { if (p.vx > 0) p.x = b.x - P.w; else if (p.vx < 0) p.x = b.x + b.w; p.vx = 0; } }

    p.coyote = p.ground ? 6 : Math.max(0, p.coyote - 1);
    if (jumpBuf > 0) {
      jumpBuf--;
      if (p.coyote > 0) { p.vy = JUMP; p.ground = false; p.coyote = 0; jumpBuf = 0; S.idle = 0; S.squash = 0; sfx.jump(); dust(p.x + P.w / 2, p.y + P.h, 5); }
    }

    p.vy = Math.min(p.vy + G, 12); const fall = p.vy; p.y += p.vy; p.ground = false;
    for (const b of blocks) {
      if (hit(box(), b)) {
        if (p.vy < 0) { p.y = b.y + b.h; p.vy = 0; bumpBlock(b); }
        else if (p.vy > 0) { p.y = b.y - P.h; p.vy = 0; p.ground = true; }
      }
    }
    if (p.y + P.h >= GROUND) { p.y = GROUND - P.h; p.vy = 0; p.ground = true; }
    if (p.ground && !wasGround && fall > 2.5) { S.squash = 1.2; sfx.land(); dust(p.x + P.w / 2, p.y + P.h, 7); }

    // Permata + kombo
    if (S.comboT > 0) { S.comboT--; if (S.comboT === 0) S.combo = 0; }
    for (const g of gems) {
      if (!g.got && Math.abs(p.x + P.w / 2 - g.x) < 16 && Math.abs(p.y + P.h / 2 - g.y) < 22) {
        g.got = true; S.gems++;
        S.combo = S.comboT > 0 ? S.combo + 1 : 1; S.comboT = 150;
        sfx.gem(S.combo - 1);
        burst(g.x, g.y, 12, RAINBOW, { speed: 2 });
        floatText(g.x, g.y - 10, S.combo > 1 ? 'COMBO x' + S.combo : 'YAY!', S.combo > 1 ? C.signal : C.amber);
        if (S.gems === gems.length) say('All gems!!', 160);
      }
    }

    // Efek lari
    if (p.ground && Math.abs(p.vx) > 2.2 && S.t % (S.power > 0 ? 2 : 5) === 0) {
      dust(p.x + P.w / 2 - p.face * 6, p.y + P.h, 2);
      burst(p.x + P.w / 2 - p.face * 10, p.y + P.h - 10, S.power > 0 ? 3 : 1, RAINBOW, { speed: 0.5, arc: [0, Math.PI], g: 0.05 });
    }
    if (p.ground && Math.abs(p.vx) > 0.3) S.anim += Math.abs(p.vx) * 0.12; else if (p.ground) S.anim = 0;

    // Obrolan saat diam
    if (S.idle === 200 && S.opened === 0 && !shroom) say('Bump the blocks above!', 200);
    else if (shroom && shroom.st === 'roam' && S.idle > 0 && S.idle % 300 === 0) say(pick(['Press E to chase the mushroom!', 'Go on, click the mushroom!', 'The mushroom is running away!']), 200);
    else if (S.idle > 0 && S.idle % 520 === 0 && S.bubbleT <= 0) {
      say(pick(['You can click blocks too!', 'Try clicking the sun!', 'Try the number keys!', 'Hmm... so quiet.']), 170);
    }

    // Perayaan menang: confetti jatuh terus selama beberapa detik
    if (S.won) {
      S.winT++;
      if (S.winT < 420 && S.t % 7 === 0) burst(cam + Math.random() * VW, -4, 7, RAINBOW, { speed: 1.2, g: 0.06, arc: [0.3, Math.PI - 0.3], max: 130 });
    }

    updateShroom();
    if (S.power > 0 && !reduce && S.t % 5 === 0) burst(p.x + P.w / 2 + (Math.random() - 0.5) * 18, p.y + Math.random() * P.h, 1, ['#ffca28', '#fff'], { speed: 0.5, g: -0.03, arc: [Math.PI * 1.2, Math.PI * 1.8], max: 28 });
    S.night += (S.nightTo - S.night) * 0.05;
    if (Math.abs(S.nightTo - S.night) < 0.003) S.night = S.nightTo;
    followCam(false);

    S.squash = Math.max(0, S.squash - 0.1); if (S.chomp > 0) S.chomp--; if (S.ring > 0) S.ring--; if (S.lvl > 0) S.lvl--;
    if (S.power > 0) { S.power--; if (S.power === 0) say('Knowledge mode ended!', 90); } if (S.shake > 0) S.shake--; if (S.bubbleT > 0) S.bubbleT--;
    blocks.forEach((b) => { if (b.bump > 0) b.bump = Math.max(0, b.bump - 0.08); b.bobK += ((b.hold ? 0 : 1) - b.bobK) * 0.12; });
    for (let i = parts.length - 1; i >= 0; i--) { const q = parts[i]; q.x += q.vx; q.y += q.vy; q.vy += q.g; q.life++; if (q.life >= q.max) parts.splice(i, 1); }
    for (let i = floats.length - 1; i >= 0; i--) { floats[i].life++; if (floats[i].life >= floats[i].max) floats.splice(i, 1); }
    if (!reduce) {
      clouds.forEach((c) => { c.x += c.s; if (c.x > W + 20) c.x = -70; });
      birds.forEach((b) => { b.x += b.s; if (b.x > W + 30) { b.x = -30; b.y = 60 + Math.random() * 60; } });
    }
  }

  /* ---------- Penggambaran ---------- */
  const skyGrad = ctx.createLinearGradient(0, 0, 0, GROUND);
  skyGrad.addColorStop(0, C.sky); skyGrad.addColorStop(1, C.ice);
  const nightGrad = ctx.createLinearGradient(0, 0, 0, GROUND);
  nightGrad.addColorStop(0, '#0b1437'); nightGrad.addColorStop(1, '#2a3f7a');
  const sunGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, 50);
  sunGrad.addColorStop(0, 'rgba(255,255,255,1)'); sunGrad.addColorStop(0.2, 'rgba(255,235,100,.9)'); sunGrad.addColorStop(1, 'rgba(255,224,150,0)');
  const moonGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, 46);
  moonGrad.addColorStop(0, 'rgba(225,238,255,.95)'); moonGrad.addColorStop(0.25, 'rgba(190,215,255,.5)'); moonGrad.addColorStop(1, 'rgba(190,215,255,0)');

  function hills(fill, base, amp, freq, shift, ph) {
    ctx.fillStyle = fill; ctx.beginPath(); ctx.moveTo(0, GROUND);
    for (let x = 0; x <= VW; x += 12) { const u = (x + shift) * freq + ph; ctx.lineTo(x, base + Math.sin(u) * amp + Math.sin(u * 2.3) * amp * 0.35); }
    ctx.lineTo(VW, GROUND); ctx.closePath(); ctx.fill();
  }
  function drawCloud(c) {
    const x = c.x - cam * 0.25;
    ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.fillRect(x, c.y + 10, 54, 12); ctx.fillRect(x + 8, c.y + 4, 30, 14); ctx.fillRect(x + 22, c.y, 20, 12);
  }
  function drawBird(b) {
    const x = b.x - cam * 0.4;
    const up = Math.sin(S.t * 0.3 + b.ph) > 0;
    ctx.fillStyle = C.carbon; ctx.fillRect(x, b.y + (up ? 0 : 3), 4, 2); ctx.fillRect(x + 4, b.y + 3, 2, 2); ctx.fillRect(x + 6, b.y + (up ? 0 : 3), 4, 2);
  }

  // Mode ilmu: aura emas di belakang, tiga buku mengorbit dan gelombang cincin di depan
  function drawPowerBack(fx, cy) {
    if (S.power <= 0) return;
    const fade = Math.min(1, S.power / 120);
    ctx.fillStyle = C.amber;
    ctx.globalAlpha = fade * (reduce ? 0.28 : 0.22 + 0.1 * Math.sin(S.t * 0.2));
    ctx.beginPath(); ctx.arc(fx, cy, 26, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = fade * 0.14;
    ctx.beginPath(); ctx.arc(fx, cy, 36, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }
  function drawPowerFront(fx, cy) {
    if (S.ring > 0) {
      ctx.globalAlpha = S.ring / 34; ctx.lineWidth = 3; ctx.strokeStyle = C.amber;
      ctx.beginPath(); ctx.arc(fx, cy, 8 + (1 - S.ring / 34) * 72, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = 1;
    }
    if (S.power <= 0) return;
    ctx.globalAlpha = Math.min(1, S.power / 120);
    for (let i = 0; i < 3; i++) {
      const a = (reduce ? 0 : S.t * 0.06) + i * 2.094;
      const ox = Math.round(fx + Math.cos(a) * 26), oy = Math.round(cy - 4 + Math.sin(a) * 10);
      ctx.fillStyle = C.carbon; ctx.fillRect(ox - 5, oy - 4, 10, 8);
      ctx.fillStyle = RAINBOW[(i * 2) % RAINBOW.length]; ctx.fillRect(ox - 4, oy - 3, 8, 6);
      ctx.fillStyle = C.carbon; ctx.fillRect(ox - 4, oy - 3, 2, 6);
      ctx.fillStyle = '#fff'; ctx.fillRect(ox - 1, oy - 1, 4, 1); ctx.fillRect(ox - 1, oy + 1, 3, 1);
    }
    ctx.globalAlpha = 1;
  }

  function drawPlayer() {
    const air = !p.ground, moving = p.ground && Math.abs(p.vx) > 0.3;
    const legs = air ? LEGS.jump : moving ? (Math.floor(S.anim) % 2 ? LEGS.a : LEGS.b) : LEGS.stand;
    const rows = TOP.slice();
    if (S.t % 210 < 7) rows[5] = BLINK;
    if (air || (S.chomp > 0 && Math.floor(S.chomp / 3) % 2)) rows[7] = OPEN;
    let sx = 1, sy = 1;
    if (!reduce) {
      if (air) { const st = Math.min(Math.abs(p.vy) * 0.02, 0.25); sy = 1 + st; sx = 1 - st * 0.6; }
      else if (S.squash > 0) { sy = 1 - 0.35 * S.squash; sx = 1 + 0.35 * S.squash; }
      else if (!moving) { sy = 1 + Math.sin(S.t * 0.08) * 0.03; }
    }
    if (S.lvl > 0 && !reduce && Math.floor(S.lvl / 3) % 2) { sx *= 1.3; sy *= 1.3; }
    if (S.chomp > 0 && !reduce) { const k = Math.abs(Math.sin(S.chomp * 0.5)); sx *= 1 + 0.12 * k; sy *= 1 - 0.12 * k; }
    const fx = p.x + P.w / 2, fy = p.y + P.h, height = Math.max(0, GROUND - fy);
    ctx.fillStyle = 'rgba(0,0,0,' + (0.25 * Math.max(0.2, 1 - height / 140)) + ')';
    ctx.beginPath(); ctx.ellipse(fx, GROUND + 3, 12 * (1 - Math.min(height, 120) / 300), 3, 0, 0, Math.PI * 2); ctx.fill();
    drawPowerBack(fx, p.y + P.h / 2);
    ctx.save(); ctx.translate(Math.round(fx), Math.round(fy)); ctx.scale(sx, sy); if (p.face < 0) ctx.scale(-1, 1); ctx.translate(-12, -30);
    rows.concat(legs).forEach((row, ry) => {
      for (let rx = 0; rx < row.length; rx++) { const c = PAL[row[rx]]; if (c) { ctx.fillStyle = c; ctx.fillRect(rx * 2, ry * 2, 2, 2); } }
    });
    ctx.restore();
    drawPowerFront(fx, p.y + P.h / 2);
  }

  function drawBubble() {
    if (S.bubbleT <= 0 || !S.bubble) return;
    ctx.font = FONT; ctx.textAlign = 'left';
    const w = Math.ceil(ctx.measureText(S.bubble).width) + 14, h = 20, fx = p.x + P.w / 2 - cam;
    const bob = reduce ? 0 : Math.round(Math.sin(S.t * 0.15) * 2);
    const bx = Math.max(4, Math.min(VW - 4 - w, fx - w / 2)), by = Math.max(4, p.y - 38 + bob);
    ctx.globalAlpha = Math.min(1, S.bubbleT / 15);
    ctx.fillStyle = C.carbon; ctx.fillRect(bx - 2, by - 2, w + 4, h + 4);
    ctx.fillStyle = C.white; ctx.fillRect(bx, by, w, h);
    const tx = Math.max(bx + 4, Math.min(bx + w - 12, fx - 4));
    ctx.fillStyle = C.carbon; ctx.fillRect(tx - 2, by + h + 2, 12, 4);
    ctx.fillStyle = C.white; ctx.fillRect(tx, by + h, 8, 4);
    ctx.fillStyle = C.carbon; ctx.fillText(S.bubble, bx + 7, by + 14);
    ctx.globalAlpha = 1;
  }

  function drawSkyBody(hov) {
    const s = SUN();
    ctx.save(); ctx.translate(s.x, s.y); const hs = hov ? 1.12 : 1; ctx.scale(hs, hs);
    const dayA = 1 - S.night;
    if (dayA > 0.01) {
      ctx.globalAlpha = dayA * (reduce ? 1 : 0.85 + 0.15 * Math.sin(S.t * 0.05));
      ctx.fillStyle = sunGrad; ctx.beginPath(); ctx.arc(0, 0, 60, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffe14d'; ctx.beginPath(); ctx.arc(0, 0, 13, 0, Math.PI * 2); ctx.fill();
      ctx.save(); if (!reduce) ctx.rotate(S.t * 0.012);
      for (let i = 0; i < 8; i++) { ctx.rotate(Math.PI / 4); ctx.fillRect(-2, -26, 4, 8); }
      ctx.restore();
    }
    if (S.night > 0.01) {
      ctx.globalAlpha = S.night;
      ctx.fillStyle = moonGrad; ctx.beginPath(); ctx.arc(0, 0, 52, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff8d6'; ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(120,130,170,.35)'; ctx.fillRect(-6, -5, 5, 5); ctx.fillRect(3, 3, 4, 4); ctx.fillRect(2, -8, 3, 3);
    }
    ctx.restore(); ctx.globalAlpha = 1;
  }

  function draw() {
    const hov = hoverAt();
    const cx0 = Math.round(cam);
    ctx.save();
    if (S.shake > 0 && !reduce) ctx.translate((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6);

    // Langit siang -> malam
    ctx.fillStyle = skyGrad; ctx.fillRect(-4, -4, VW + 8, H + 8);
    if (S.night > 0.01) {
      ctx.globalAlpha = S.night; ctx.fillStyle = nightGrad; ctx.fillRect(-4, -4, VW + 8, H + 8);
      ctx.fillStyle = '#fff';
      stars.forEach((s) => {
        const tw = reduce ? 1 : 0.5 + 0.5 * Math.sin(S.t * 0.06 + s.ph);
        ctx.globalAlpha = S.night * (0.35 + 0.65 * tw);
        ctx.fillRect(Math.round((s.x * VW / W) - cam * 0.05), Math.round(s.y), 2, 2);
      });
      ctx.globalAlpha = 1;
    }
    drawSkyBody(hov.sun);

    hills('rgba(' + Math.round(61 - 50 * S.night) + ',' + Math.round(79 - 60 * S.night) + ',' + Math.round(151 - 90 * S.night) + ',.15)', 188, 18, 0.011, cam * 0.06, 0.5);
    hills('rgba(' + Math.round(61 - 50 * S.night) + ',' + Math.round(79 - 60 * S.night) + ',' + Math.round(151 - 90 * S.night) + ',.28)', 214, 13, 0.016, cam * 0.14, 2.1);
    ctx.globalAlpha = 1 - 0.65 * S.night; clouds.forEach(drawCloud); ctx.globalAlpha = 1;
    if (!reduce) {
      birds.forEach(drawBird);
      motes.forEach((m) => {
        const a = Math.sin(S.t * 0.03 + m.ph);
        if (a <= 0) return;
        const mx = (m.x * VW / W) + Math.sin(S.t * 0.017 + m.ph) * 10, my = m.y + Math.sin(S.t * 0.02 + m.ph) * 15;
        if (S.night > 0.05) {
          ctx.globalAlpha = a * 0.25 * S.night; ctx.fillStyle = '#ffe14d'; ctx.fillRect(mx - 3, my - 3, 8, 8);
          ctx.globalAlpha = a * (0.5 + 0.5 * S.night); ctx.fillRect(mx, my, 2, 2);
        } else {
          ctx.globalAlpha = a * 0.7; ctx.fillStyle = '#fff'; ctx.fillRect(mx, my, 2, 2);
        }
      });
      ctx.globalAlpha = 1;
    }

    // ---- Dunia (mengikuti kamera) ----
    ctx.save(); ctx.translate(-cx0, 0);
    ctx.fillStyle = C.carbon; ctx.fillRect(0, GROUND, W, H - GROUND);
    ctx.fillStyle = '#8bc34a'; ctx.fillRect(0, GROUND, W, 5);
    ctx.fillStyle = 'rgba(255,255,255,.08)';
    for (let x = 0; x < W; x += 16) ctx.fillRect(x, GROUND + 14 + ((x / 16) % 2) * 8, 8, 4);
    for (let x = 6, i = 0; x < W; x += 18, i++) {
      const h = 5 + ((x * 7) % 4);
      const sw = reduce ? 0 : Math.round(Math.sin(S.t * 0.08 + x * 0.3) * 2);
      ctx.fillStyle = '#8bc34a'; ctx.fillRect(x + sw, GROUND - h, 2, h);
      if (i % 4 === 1) { ctx.fillStyle = RAINBOW[i % RAINBOW.length]; ctx.fillRect(x - 1 + sw, GROUND - h - 3, 4, 4); }
    }
    // Gelapkan latar saat malam; blok, permata, dan karakter tetap terang
    if (S.night > 0.01) { ctx.fillStyle = 'rgba(8,14,45,' + (0.38 * S.night) + ')'; ctx.fillRect(cx0, 0, VW, H); }

    // Permata
    gems.forEach((g) => {
      if (g.got) return;
      const bob = reduce ? 0 : Math.sin(S.t * 0.1 + g.ph) * 4;
      const w = reduce ? 6 : 1.5 + 5 * Math.abs(Math.cos(S.t * 0.08 + g.ph));
      const cx = g.x, cy = g.y + bob;
      ctx.globalAlpha = 0.18 + 0.12 * S.night; ctx.fillStyle = '#00e676'; ctx.beginPath(); ctx.arc(cx, cy, 15, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
      ctx.beginPath(); ctx.moveTo(cx, cy - 8); ctx.lineTo(cx + w, cy); ctx.lineTo(cx, cy + 8); ctx.lineTo(cx - w, cy); ctx.closePath();
      ctx.fillStyle = '#00e676'; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = C.carbon; ctx.stroke();
    });

    // Jamur digambar sebelum blok supaya tampak keluar dari dalamnya
    drawShroom(hov.shroom);

    // Blok
    ctx.textAlign = 'center'; ctx.font = FONT;
    blocks.forEach((b, i) => {
      const hv = hov.block === b;
      const bob = reduce ? 0 : Math.round(Math.sin(S.t * 0.07 + i * 1.5) * 2.5 * b.bobK);
      const y = b.y + bob - (reduce ? 0 : Math.sin(b.bump * Math.PI) * 10) - (hv && !reduce && !b.hold ? 3 : 0);
      if (!b.seen && !b.hold) {
        ctx.globalAlpha = reduce ? 0.3 : 0.3 + 0.3 * Math.sin(S.t * 0.1 + i);
        ctx.fillStyle = C.amber; ctx.fillRect(b.x - 6, y - 6, b.w + 12, b.h + 12);
        ctx.globalAlpha = 1;
      }
      if (hv) { ctx.fillStyle = C.white; ctx.fillRect(b.x - 5, y - 5, b.w + 10, b.h + 10); }
      ctx.fillStyle = C.carbon; ctx.fillRect(b.x - 2, y - 2, b.w + 4, b.h + 4);
      ctx.fillStyle = b.seen ? C.ice : C.amber; ctx.fillRect(b.x, y, b.w, b.h);
      ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fillRect(b.x, y, b.w, 3); ctx.fillRect(b.x, y, 3, b.h);
      ctx.fillStyle = b.seen ? C.chrome : C.gold; ctx.fillRect(b.x, y + b.h - 3, b.w, 3); ctx.fillRect(b.x + b.w - 3, y, 3, b.h);
      ctx.fillStyle = C.carbon; const cx = b.x + b.w / 2, cy = y + b.h / 2;
      if (b.seen) { [[-8, 0], [-4, 4], [0, 0], [4, -4], [8, -8]].forEach(([dx, dy]) => ctx.fillRect(cx + dx - 2, cy + dy - 2, 4, 4)); }
      else { ctx.fillRect(cx - 2, cy - 8, 4, 4); ctx.fillRect(cx - 6, cy - 4, 12, 4); ctx.fillRect(cx - 10, cy, 20, 4); ctx.fillRect(cx - 2, cy + 4, 4, 6); }
      ctx.fillStyle = C.carbon; ctx.fillText(b.label.toUpperCase(), cx + 1, y - 7);
      ctx.fillStyle = C.white; ctx.fillText(b.label.toUpperCase(), cx, y - 8);
      if (hv) { // pil petunjuk di bawah blok
        const tip = (S.ptr && S.ptr.mouse ? 'CLICK · ' : 'TAP · ') + (i + 1);
        const tw = Math.ceil(ctx.measureText(tip).width) + 12, ty = y + b.h + 8;
        ctx.fillStyle = C.carbon; ctx.fillRect(cx - tw / 2 - 2, ty - 2, tw + 4, 18);
        ctx.fillStyle = C.amber; ctx.fillRect(cx - tw / 2, ty, tw, 14);
        ctx.fillStyle = C.carbon; ctx.fillText(tip, cx, ty + 10);
      }
    });

    drawPlayer();

    parts.forEach((q) => {
      ctx.globalAlpha = Math.max(0, 1 - q.life / q.max);
      ctx.fillStyle = q.c; ctx.fillRect(Math.round(q.x), Math.round(q.y), q.s, q.s);
    });
    ctx.globalAlpha = 1;
    ctx.textAlign = 'center'; ctx.font = FONT;
    floats.forEach((f) => {
      ctx.globalAlpha = Math.max(0, 1 - f.life / f.max);
      const fy = f.y - f.life * 0.8;
      const wig = Math.sin(f.life * 0.3) * 2;
      ctx.fillStyle = C.carbon; ctx.fillText(f.txt.toUpperCase(), f.x + 1 + wig, fy + 1);
      ctx.fillStyle = f.c; ctx.fillText(f.txt.toUpperCase(), f.x + wig, fy);
    });
    ctx.globalAlpha = 1;
    ctx.restore(); // akhir dunia

    drawShroomPointer();
    drawBubble();

    // Spanduk menang
    if (S.won && S.winT < 260) {
      const a = Math.min(1, (260 - S.winT) / 40, S.winT / 10);
      ctx.save(); ctx.globalAlpha = Math.max(0, a); ctx.translate(VW / 2, 112);
      const sc = reduce ? 1 : 1 + Math.sin(S.winT * 0.2) * 0.05; ctx.scale(sc, sc);
      ctx.font = '700 15px Silkscreen, Arial, sans-serif'; ctx.textAlign = 'center';
      ctx.fillStyle = C.carbon; ctx.fillText('ALL UNLOCKED!', 2, 2);
      ctx.fillStyle = C.amber; ctx.fillText('ALL UNLOCKED!', 0, 0);
      ctx.restore();
    }

    // HUD + bar progres
    const hudW = gems.length ? 214 : 96;
    ctx.fillStyle = 'rgba(33,36,46,.7)'; ctx.fillRect(8, 8, hudW, 26);
    ctx.textAlign = 'left'; ctx.font = FONT; ctx.fillStyle = C.white;
    ctx.fillText('BLOCKS ' + S.opened + '/' + blocks.length, 15, 22);
    if (gems.length) ctx.fillText('GEMS ' + S.gems + '/' + gems.length, 108, 22);
    ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fillRect(14, 27, hudW - 12, 3);
    ctx.fillStyle = C.amber; ctx.fillRect(14, 27, Math.round((hudW - 12) * (blocks.length ? S.opened / blocks.length : 0)), 3);
    ctx.restore();
  }

  /* ---------- Loop & event ---------- */
  let raf = 0, last = 0, acc = 0, visible = false;
  function frame(t) { raf = requestAnimationFrame(frame); acc += Math.min(t - last, 100); last = t; while (acc >= STEP) { step(); acc -= STEP; } draw(); }
  function sync() {
    const run = visible && !document.hidden;
    if (run && !raf) { last = performance.now(); acc = 0; raf = requestAnimationFrame(frame); }
    else if (!run && raf) { cancelAnimationFrame(raf); raf = 0; }
  }
  if ('IntersectionObserver' in window) { new IntersectionObserver((e) => { visible = e[0].isIntersecting; sync(); }).observe(stage); } else { visible = true; }
  document.addEventListener('visibilitychange', sync); sync(); draw();
  if (document.fonts && document.fonts.load) document.fonts.load('9px Silkscreen').then(draw);

  const press = (k) => { if (!muted) audio(); if (k === 'jump') jumpBuf = 8; else keys[k] = true; };
  const release = (k) => { if (k === 'jump') { if (p.vy < -4) p.vy = -4; jumpBuf = 0; } else keys[k] = false; };
  const MAP = { ArrowLeft: 'left', ArrowRight: 'right', a: 'left', A: 'left', d: 'right', D: 'right', ' ': 'jump', Spacebar: 'jump' };
  stage.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closePanel(); return; }
    if (e.key === 'm' || e.key === 'M') { e.preventDefault(); toggleMute(); return; }
    if (e.key === 'e' || e.key === 'E') { e.preventDefault(); if (!muted) audio(); chaseShroom(); return; }
    if (/^[1-9]$/.test(e.key) && blocks[+e.key - 1]) { e.preventDefault(); if (!muted) audio(); goTo(blocks[+e.key - 1]); return; }
    const k = MAP[e.key]; if (!k) return;
    e.preventDefault(); if (k === 'jump' && e.repeat) return; press(k);
  });
  stage.addEventListener('keyup', (e) => { const k = MAP[e.key]; if (k) { e.preventDefault(); release(k); } });
  stage.addEventListener('blur', () => { keys.left = keys.right = false; });

  root.querySelectorAll('.arena-pad [data-k]').forEach((btn) => {
    const k = btn.dataset.k;
    btn.addEventListener('pointerdown', (e) => { e.preventDefault(); press(k); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => btn.addEventListener(ev, () => release(k)));
  });
})();