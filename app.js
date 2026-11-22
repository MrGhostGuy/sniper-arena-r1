/* SNIPER ARENA - R1 EDITION
   Canvas 240x282. R1: scrollUp/scrollDown/sideClick/longPressStart.
   Desktop: wheel / arrows / Enter / Esc / M mute. */
(function () {
  'use strict';
  var canvas = document.getElementById('gameCanvas');
  var ctx = canvas.getContext('2d');
  var W = 240, H = 282;
  ctx.imageSmoothingEnabled = false;
  var SAVE_KEY = 'sar1_save_v1';

  // ----------------------------------------------------------- helpers
  function rr(x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath(); ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function txt(s, x, y, size, color, align, bold) {
    ctx.font = (bold ? 'bold ' : '') + size + 'px monospace';
    ctx.fillStyle = color || '#fff'; ctx.textAlign = align || 'left';
    ctx.textBaseline = 'alphabetic'; ctx.fillText(s, x, y);
  }
  function fmt(n) {
    n = Math.floor(n);
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
    return String(n);
  }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function ri(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function rf(a, b) { return a + Math.random() * (b - a); }
  function pick(a) { return a[ri(0, a.length - 1)]; }

  // ----------------------------------------------------------- data
  var RIFLES = [
    { id: 'ssg08',  name: 'SSG08',   tier: 'STARTER', price: 0,      zoom: 1.00, sway: 1.4, reload: 0.95, mult: 1.0, desc: 'Free starter. Balanced, fast reload, still competitive.' },
    { id: 'awp',    name: 'AWP',     tier: 'B',       price: 5000,    zoom: 1.05, sway: 1.2, reload: 0.85, mult: 1.1, desc: 'Classic heavy bolt-action. Satisfying and precise.' },
    { id: 'm82a1',  name: 'M82A1',   tier: 'B',       price: 30000,   zoom: 1.00, sway: 1.0, reload: 0.55, mult: 1.2, desc: 'Semi-automatic anti-materiel rifle. Fast follow-ups.' },
    { id: 'm200',   name: 'M200',    tier: 'A',       price: 50000,   zoom: 1.15, sway: 0.9, reload: 0.90, mult: 1.3, desc: 'Bolt-action long-range rifle. Wide sweet spot.' },
    { id: 'kar98k', name: 'Kar98k',  tier: 'A',       price: 75000,   zoom: 1.10, sway: 0.8, reload: 0.80, mult: 1.4, desc: 'WWII bolt-action classic. Low sway.' },
    { id: 'wa2000', name: 'WA 2000', tier: 'A',       price: 100000,  zoom: 1.05, sway: 0.7, reload: 0.55, mult: 1.5, desc: 'Semi-automatic precision rifle. Smooth and quick.' },
    { id: 'ntw20',  name: 'NTW 20',  tier: 'S',       price: 125000,  zoom: 1.20, sway: 0.6, reload: 1.00, mult: 1.6, desc: 'Heavy anti-materiel rifle. Huge hit window.' },
    { id: 'dsr1',   name: 'DSR-1',   tier: 'S',       price: 150000,  zoom: 1.25, sway: 0.5, reload: 0.70, mult: 1.8, desc: 'Bullpup bolt-action. Rated best by the community.' }
  ];
  function rifle(id) { for (var i = 0; i < RIFLES.length; i++) if (RIFLES[i].id === id) return RIFLES[i]; return RIFLES[0]; }

  var RARITY = {
    COMMON:    { color: '#adb5bd', w: 50,   val: 80 },
    RARE:      { color: '#4dabf7', w: 28,   val: 250 },
    EPIC:      { color: '#b197fc', w: 14,   val: 800 },
    LEGENDARY: { color: '#ffd43b', w: 6,    val: 2600 },
    MYSTIC:    { color: '#ff6b6b', w: 1.7,  val: 9000 },
    EXOTIC:    { color: '#40c9a2', w: 0.3,  val: 42000 }
  };
  var RARITY_ORDER = ['COMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYSTIC', 'EXOTIC'];

  // authentic finishes from Sniper Arena, each with its own procedural pattern
  var SKINS = [
    // COMMON
    { id: 'slblue_ssg',  name: 'Starlord Blue SSG08',  model: 'SSG08',   r: 'COMMON',    c1: '#2563eb', c2: '#93c5fd', pat: 'stripe' },
    { id: 'purpdye_awp', name: 'Purple Dye AWP',       model: 'AWP',     r: 'COMMON',    c1: '#7e22ce', c2: '#d8b4fe', pat: 'solid' },
    { id: 'slgray_dsr',  name: 'Starlord Gray DSR-1',  model: 'DSR-1',   r: 'COMMON',    c1: '#4b5563', c2: '#d1d5db', pat: 'solid' },
    { id: 'starl_kukri', name: 'Starlight Kukri',      model: 'Kukri',   r: 'COMMON',    c1: '#94a3b8', c2: '#f1f5f9', pat: 'glow' },
    { id: 'starry_mach', name: 'Starry Machete',       model: 'Machete', r: 'COMMON',    c1: '#1e293b', c2: '#e2e8f0', pat: 'starfield' },
    { id: 'tiger_stil',  name: 'Tiger Stiletto',       model: 'Stiletto',r: 'COMMON',    c1: '#b45309', c2: '#fcd34d', pat: 'stripe' },
    // RARE
    { id: 'lagoon_spec', name: 'Lagoon Specter',       model: 'Specter', r: 'RARE',      c1: '#0369a1', c2: '#67e8f9', pat: 'gradient' },
    { id: 'slred_kar',   name: 'Starlord Red Kar98k',  model: 'Kar98k',  r: 'RARE',      c1: '#b91c1c', c2: '#fca5a5', pat: 'stripe' },
    { id: 'starfade_r11',name: 'Starfade R11',         model: 'R11',     r: 'RARE',      c1: '#7c3aed', c2: '#f472b6', pat: 'gradient' },
    { id: 'aquac_flip',  name: 'Aqua Core Flip Knife', model: 'Flip Knife', r: 'RARE',   c1: '#0891b2', c2: '#a5f3fc', pat: 'glow' },
    { id: 'wildf_axe',   name: 'Wild Fiend Axe',       model: 'Axe',     r: 'RARE',      c1: '#b91c1c', c2: '#fb923c', pat: 'flame' },
    // EPIC
    { id: 'redser_awp',  name: 'Red Seraph AWP',       model: 'AWP',     r: 'EPIC',      c1: '#dc2626', c2: '#fbbf24', pat: 'flame' },
    { id: 'aquac_m200',  name: 'Aqua Core M200',       model: 'M200',    r: 'EPIC',      c1: '#0e7490', c2: '#cffafe', pat: 'glow' },
    { id: 'phantom_ax',  name: 'Phantom Core AX-50',   model: 'AX-50',   r: 'EPIC',      c1: '#4338ca', c2: '#c4b5fd', pat: 'gradient' },
    { id: 'starveil_mr', name: 'Starveil MR-10',       model: 'MR-10',   r: 'EPIC',      c1: '#6d28d9', c2: '#f5d0fe', pat: 'starfield' },
    { id: 'astral_ssg',  name: 'Astral Verdict SSG08', model: 'SSG08',   r: 'EPIC',      c1: '#1e3a8a', c2: '#bfdbfe', pat: 'starfield' },
    // LEGENDARY
    { id: 'mortis_awp',  name: 'Mortis AWP',           model: 'AWP',     r: 'LEGENDARY', c1: '#111827', c2: '#ef4444', pat: 'glow' },
    { id: 'amedu_wa',    name: 'Ame du Ciel WA 2000',  model: 'WA 2000', r: 'LEGENDARY', c1: '#ec4899', c2: '#fde047', pat: 'rainbow' },
    { id: 'violet_m82',  name: 'Violet Fiend M82A1',   model: 'M82A1',   r: 'LEGENDARY', c1: '#6b21a8', c2: '#f0abfc', pat: 'gradient' },
    { id: 'arcana_dai',  name: 'Arcana Maiden Daisho', model: 'Daisho',  r: 'LEGENDARY', c1: '#4c1d95', c2: '#f9a8d4', pat: 'glow' },
    // MYSTIC
    { id: 'abyss_cross', name: 'Abyss Core Crossbow',  model: 'Crossbow', r: 'MYSTIC',   c1: '#0f172a', c2: '#22d3ee', pat: 'glow' },
    { id: 'cheval_awp',  name: "Chevalier de l'enfer AWP", model: 'AWP', r: 'MYSTIC',    c1: '#7f1d1d', c2: '#fcd34d', pat: 'flame' },
    { id: 'phantom_ntw', name: 'Phantom Core NTW 20',  model: 'NTW 20',  r: 'MYSTIC',     c1: '#312e81', c2: '#a5b4fc', pat: 'gradient' },
    { id: 'starveil_rgb',name: 'Starveil M82A1 RGB',   model: 'M82A1',   r: 'MYSTIC',     c1: '#7c3aed', c2: '#22d3ee', pat: 'rgb' },
    // EXOTIC - the crown jewels
    { id: 'exo_rainbow', name: 'Ame du Ciel Rainbow WA2000', model: 'WA 2000', r: 'EXOTIC', c1: '#ff0080', c2: '#00ffe0', pat: 'rainbow' },
    { id: 'exo_redser',  name: 'Red Seraph DSR-1',     model: 'DSR-1',   r: 'EXOTIC',      c1: '#ff1a1a', c2: '#ffd700', pat: 'flame' },
    { id: 'exo_noir',    name: 'Homeland Noir M82A1',  model: 'M82A1',   r: 'EXOTIC',      c1: '#050505', c2: '#dc2626', pat: 'glow' },
    { id: 'exo_astral',  name: 'Astral Verdict DSR-1', model: 'DSR-1',   r: 'EXOTIC',      c1: '#1e3a8a', c2: '#fbbf24', pat: 'starfield' },
    { id: 'exo_wild',    name: 'Wild Fiend Karambit',  model: 'Karambit',r: 'EXOTIC',      c1: '#ff4500', c2: '#ffcc00', pat: 'flame' },
    { id: 'exo_phantom', name: 'Phantom Core DSR-1',   model: 'DSR-1',   r: 'EXOTIC',      c1: '#4c1d95', c2: '#00ffff', pat: 'rgb' }
  ];
  function skin(id) { for (var i = 0; i < SKINS.length; i++) if (SKINS[i].id === id) return SKINS[i]; return SKINS[0]; }
  function skinValue(s) {
    var v = RARITY[s.r].val;
    if (s.pat === 'rainbow' || s.pat === 'rgb') v = Math.floor(v * 1.15);
    return v;
  }

  var CASES = [
    { id: 'strike',  name: 'Strike Case',  price: 500, series: 'Fire Serpent', desc: 'Coin-purchased case. Fire Serpent drops.' },
    { id: 'release', name: 'Release Case', price: 300, series: 'Release',      desc: 'Release-themed sniper skins.' },
    { id: 'dream',   name: 'Dreamcase',    price: 400, series: 'Dream',        desc: 'Promotional case. Untradeable drops.' },
    { id: 'secret',  name: 'Secret Case',  price: 800, series: 'Secret',       desc: 'Milestone reward case. Spicy odds.' },
    { id: 'lumen',   name: 'Lumen Case',   price: 600, series: 'Lumen',        desc: 'Limited visit-milestone case.' },
    { id: 'neon',    name: 'Neon Core',    price: 600, series: 'Neon Core',    desc: 'Limited Neon Core case.' },
    { id: 'easter',  name: 'Easter Case',  price: 600, series: 'Easter',       desc: 'Seasonal Easter case.' }
  ];

  var OPPONENTS = [
    { name: 'TWITCH', color: '#ff6b6b', speed: 1.5, fire: 0.55, aggr: 5, style: 'Fast strafing. Fires nonstop.' },
    { name: 'CAMP',   color: '#ffd43b', speed: 0.5, fire: 1.40, aggr: 2, style: 'Peeks from cover. Rare, accurate shots.' },
    { name: 'MARK',   color: '#4dabf7', speed: 0.9, fire: 0.75, aggr: 5, style: 'Locks on and squeezes the trigger.' },
    { name: 'GHOST',  color: '#b197fc', speed: 1.1, fire: 1.00, aggr: 3, style: 'Half-visible. Hard to track.' },
    { name: 'RUSH',   color: '#ff922b', speed: 1.8, fire: 0.90, aggr: 4, style: 'Charges straight down the sightline.' }
  ];

  // ----------------------------------------------------------- state
  function freshSave() {
    return {
      credits: 1000, gold: 0, cash: 0,
      rifles: ['ssg08'], rifle: 'ssg08',
      owned: { 'slblue_ssg': 1 },
      skin: 'slblue_ssg',
      stats: { kills: 0, deaths: 0, heads: 0, shots: 0, hits: 0, matches: 0, best: 0, opened: 0 },
      daily: { date: '', heads: 0, done: false }
    };
  }
  var P = freshSave();
  try {
    var raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      var d = JSON.parse(raw);
      if (d && d.rifles && d.owned && d.stats) {
        P = d;
        P.stats.best = P.stats.best || 0; P.stats.opened = P.stats.opened || 0;
        P.daily = P.daily || { date: '', heads: 0, done: false };
      }
    }
  } catch (e) {}
  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(P)); } catch (e) {} }
  function ownsSkin(id) { return (P.owned[id] || 0) > 0; }
  function grantSkin(id) { P.owned[id] = (P.owned[id] || 0) + 1; }

  var screen = 'TITLE';   // TITLE MENU MATCH RESULT ARMORY CASES MARKET STATS HELP
  var sel = 0, sub = 0;
  var fxMsg = '', fxTimer = 0;
  var match = null;
  var caseRoll = null;
  var lastT = 0, muted = false;
  var events = [];

  function log(m, c) { events.unshift({ m: m, c: c || '#9fb0d8' }); if (events.length > 8) events.pop(); }
  function beep(type) {
    if (muted) return;
    try {
      var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      if (!window._ac) window._ac = new AC();
      var ac = window._ac, o = ac.createOscillator(), g = ac.createGain();
      o.connect(g); g.connect(ac.destination);
      var f = 440, d = 0.07, wave = 'square';
      if (type === 'shot') { f = 180; d = 0.12; wave = 'sawtooth'; }
      if (type === 'hit') { f = 900; d = 0.10; wave = 'triangle'; }
      if (type === 'head') { f = 1300; d = 0.20; wave = 'triangle'; }
      if (type === 'hurt') { f = 120; d = 0.25; wave = 'sawtooth'; }
      if (type === 'rare') { f = 520; d = 0.45; wave = 'triangle'; }
      o.type = wave; o.frequency.setValueAtTime(f, ac.currentTime);
      if (type === 'hit' || type === 'head' || type === 'rare') o.frequency.exponentialRampToValueAtTime(f * 2, ac.currentTime + d);
      if (type === 'hurt' || type === 'shot') o.frequency.exponentialRampToValueAtTime(70, ac.currentTime + d);
      g.gain.setValueAtTime(0.03, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + d);
      o.start(); o.stop(ac.currentTime + d);
    } catch (e) {}
  }
  function flash(m, c) { fxMsg = m; fxTimer = 1.3; if (c) log(m, c); }

  // ----------------------------------------------------------- match
  function newMatch() {
    var opps = [];
    var pool = OPPONENTS.slice();
    for (var i = 0; i < 3; i++) opps.push(pool.splice(ri(0, pool.length - 1), 1)[0]);
    var m = {
      t: 90, score: 0, kills: 0, heads: 0, shots: 0, hits: 0, deaths: 0,
      hp: 3, lane: 1, reload: 0, cx: 120, enemies: [], effects: [], shake: 0,
      hurtFlash: 0, muzzle: 0, opps: opps, spawn: 0.6, downed: 0,
      credits: 0, gold: 0
    };
    return m;
  }
  function spawnEnemy(m) {
    var o = pick(m.opps);
    var dir = Math.random() < 0.5 ? 1 : -1;
    var e = {
      o: o, lane: ri(0, 3), x: dir > 0 ? -14 : 254, dir: dir,
      speed: o.speed * rf(0.8, 1.3) * 26, fireT: o.fire * rf(0.6, 1.3),
      peek: 0, life: 0, alpha: o.name === 'GHOST' ? 0.5 : 1
    };
    m.enemies.push(e);
  }
  function fire() {
    var m = match; if (!m) return;
    if (m.downed > 0 || m.reload > 0) return;
    var r = rifle(P.rifle);
    m.shots++;
    m.reload = r.reload; m.muzzle = 0.10; m.shake = 2.5; beep('shot');
    m.effects.push({ kind: 'tracer', x: m.cx, y: 46 + m.lane * 40, t: 0.18 });
    var window = 13 * r.zoom, headWin = 5.5 * r.zoom;
    var best = null, bd = 999;
    for (var i = 0; i < m.enemies.length; i++) {
      var e = m.enemies[i];
      if (e.lane !== m.lane || e.x < -10 || e.x > 250) continue;
      var d = Math.abs(e.x - m.cx);
      if (d < window && d < bd) { bd = d; best = e; }
    }
    if (best) {
      var head = bd <= headWin;
      m.hits++;
      m.kills++;
      if (head) m.heads++;
      var pts = (head ? 150 : 100) + Math.floor(r.mult * 25);
      m.score += pts;
      m.credits += Math.floor((head ? 20 : 12) * r.mult);
      m.gold += Math.floor((head ? 16 : 9) * r.mult);
      P.stats.kills++; P.stats.hits++;
      m.effects.push({ kind: 'hit', x: best.x, y: 46 + m.lane * 40, t: 0.4, head: head });
      m.enemies.splice(m.enemies.indexOf(best), 1);
      beep(head ? 'head' : 'hit');
      flash(head ? 'HEADSHOT +' + pts : 'KILL +' + pts, head ? '#ffd43b' : '#8ce99a');
    } else {
      flash('MISS', '#ff6b6b');
    }
    save();
  }
  function endMatch() {
    var m = match;
    P.credits += m.credits; P.gold += m.gold;
    P.stats.matches++; P.stats.shots += m.shots;
    P.stats.deaths += m.deaths; P.stats.heads += m.heads;
    if (m.score > P.stats.best) P.stats.best = m.score;
    var d = new Date(); var dk = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
    if (P.daily.date !== dk) { P.daily = { date: dk, heads: 0, done: false }; }
    P.daily.heads += m.heads;
    if (!P.daily.done && P.daily.heads >= 10) { P.credits += 500; P.daily.done = true; flash('DAILY +500 CR', '#ffd43b'); }
    save();
    screen = 'RESULT'; sel = 0;
  }
  function updateMatch(dt) {
    var m = match; if (!m) return;
    m.shake = Math.max(0, m.shake - dt * 8);
    m.muzzle = Math.max(0, m.muzzle - dt);
    m.hurtFlash = Math.max(0, m.hurtFlash - dt * 2);
    m.reload = Math.max(0, m.reload - dt);
    if (m.downed > 0) {
      m.downed -= dt;
      if (m.downed <= 0) { m.hp = 3; m.enemies = []; }
      return;
    }
    m.t -= dt;
    if (m.t <= 0) { endMatch(); return; }
    var r = rifle(P.rifle);
    m.cx = 120 + Math.sin(m.t * 2.4) * r.sway * 1.6;
    m.spawn -= dt;
    if (m.spawn <= 0 && m.enemies.length < 6) { spawnEnemy(m); m.spawn = rf(0.9, 1.8); }
    for (var i = m.enemies.length - 1; i >= 0; i--) {
      var e = m.enemies[i]; e.life += dt;
      if (e.peek > 0) { e.peek -= dt; }
      else {
        e.x += e.dir * e.speed * dt;
        if (e.o.name === 'CAMP' && Math.abs(e.x - 120) < 40 && e.life > 1) e.peek = 0.6;
        if (e.x < -22 || e.x > 262) { m.enemies.splice(i, 1); continue; }
      }
      e.fireT -= dt;
      if (e.fireT <= 0) {
        e.fireT = e.o.fire * rf(0.8, 1.5);
        m.effects.push({ kind: 'enemytracer', x: e.x, y: 46 + e.lane * 40, t: 0.25 });
        var hitChance = 0.16 + e.o.aggr * 0.055;
        if (Math.random() < hitChance) {
          m.hp--; m.hurtFlash = 0.7; m.shake = 4; beep('hurt');
          if (m.hp <= 0) { m.deaths++; m.downed = 1.3; flash('DOWNED!', '#ff6b6b'); }
          else flash('HIT! -1 HP', '#ff6b6b');
        }
      }
    }
    for (var j = m.effects.length - 1; j >= 0; j--) {
      m.effects[j].t -= dt;
      if (m.effects[j].t <= 0) m.effects.splice(j, 1);
    }
  }

  // ----------------------------------------------------------- cases
  function rollRarity() {
    var total = 0, k;
    for (k in RARITY) total += RARITY[k].w;
    var r = Math.random() * total;
    for (k in RARITY) { r -= RARITY[k].w; if (r <= 0) return k; }
    return 'COMMON';
  }
  function openCase(idx) {
    var c = CASES[idx];
    if (P.credits < c.price) { flash('NEED ' + (c.price - P.credits) + ' CR', '#ff6b6b'); beep('hurt'); return; }
    P.credits -= c.price; P.stats.opened++;
    var tier = rollRarity();
    // limited cases slightly boost rare odds
    if ((c.id === 'secret' || c.id === 'lumen' || c.id === 'neon') && Math.random() < 0.18) {
      var up = RARITY_ORDER.indexOf(tier);
      tier = RARITY_ORDER[Math.min(5, up + 1)];
    }
    var pool = SKINS.filter(function (s) { return s.r === tier; });
    var got = pool.length ? pick(pool) : SKINS[0];
    grantSkin(got.id); save();
    caseRoll = { skin: got, t: 0, tier: tier, done: false };
    screen = 'CASES'; sub = 2;
    beep(tier === 'EXOTIC' || tier === 'MYSTIC' ? 'rare' : 'hit');
  }

  // ----------------------------------------------------------- input
  var lastNav = 0, lastOk = 0;
  function listLen() {
    if (screen === 'MENU') return 6;
    if (screen === 'ARMORY') return sub === 0 ? RIFLES.length : 2;
    if (screen === 'CASES') return sub === 0 ? CASES.length : 1;
    if (screen === 'MARKET') return sub === 0 ? SKINS.length : 2;
    if (screen === 'STATS' || screen === 'HELP' || screen === 'RESULT') return 1;
    return 1;
  }
  function nav(d) {
    var t = Date.now(); if (t - lastNav < 55) return; lastNav = t;
    if (screen === 'MATCH') { match.lane = clamp(match.lane + d, 0, 3); return; }
    var n = listLen();
    sel = (sel + d + n) % n;
  }
  function confirmRaw() {
    if (screen === 'TITLE') { screen = 'MENU'; sel = 0; return; }
    if (screen === 'HELP' || screen === 'STATS' || screen === 'RESULT') { screen = 'MENU'; sel = 0; return; }
    if (screen === 'MATCH') { fire(); return; }
    if (screen === 'MENU') {
      if (sel === 0) { match = newMatch(); screen = 'MATCH'; return; }
      if (sel === 1) { screen = 'ARMORY'; sel = 0; sub = 0; return; }
      if (sel === 2) { screen = 'CASES'; sel = 0; sub = 0; return; }
      if (sel === 3) { screen = 'MARKET'; sel = 0; sub = 0; return; }
      if (sel === 4) { screen = 'STATS'; return; }
      if (sel === 5) { screen = 'HELP'; return; }
    }
    if (screen === 'ARMORY') {
      if (sub === 0) { armoryIdx = sel; sub = 1; sel = 0; return; }
      if (sel === 0) equipRifle(armoryIdx);
      else { sub = 0; sel = armoryIdx; }
      return;
    }
    if (screen === 'CASES') {
      if (sub === 2) { caseRoll = null; sub = 0; sel = 0; return; }
      if (sub === 0) { openCase(sel); return; }
    }
    if (screen === 'MARKET') {
      if (sub === 1) {
        var sk = SKINS[marketIdx];
        if (sel === 0) sellSkin(marketIdx);
        else { sub = 0; sel = marketIdx; }
        return;
      }
      var s2 = SKINS[sel];
      marketIdx = sel; sub = 1; sel = 0; return;
    }
  }
  function confirm() {
    var t = Date.now(); if (t - lastOk < 90) return; lastOk = t;
    confirmRaw();
  }
  var armoryIdx = 0, marketIdx = 0;
  function equipRifle(i) {
    var r = RIFLES[i];
    if (P.rifles.indexOf(r.id) < 0) {
      if (P.gold < r.price) { flash('NEED ' + fmt(r.price - P.gold) + ' GOLD', '#ff6b6b'); beep('hurt'); return; }
      P.gold -= r.price; P.rifles.push(r.id);
      flash('UNLOCKED ' + r.name, '#ffd43b'); beep('rare');
    } else flash('EQUIPPED ' + r.name, '#8ce99a');
    P.rifle = r.id; save();
  }
  function sellSkin(i) {
    var s = SKINS[i];
    if (!ownsSkin(s.id)) { flash('NOT OWNED', '#ff6b6b'); return; }
    P.owned[s.id]--;
    if (P.owned[s.id] <= 0) delete P.owned[s.id];
    P.cash += skinValue(s);
    flash('SOLD +' + fmt(skinValue(s)) + ' CASH', '#40c9a2'); beep('hit'); save();
  }
  function hold() {
    if (screen === 'MATCH') { screen = 'HELP'; return; }
    if (screen === 'HELP' || screen === 'STATS' || screen === 'RESULT' || screen === 'TITLE') {
      screen = 'MENU'; sel = 0; sub = 0; return;
    }
    if (sub > 0) {
      if (screen === 'ARMORY') sel = armoryIdx;
      else if (screen === 'MARKET') sel = marketIdx;
      else if (screen === 'CASES') sel = 0;
      sub = 0; caseRoll = null; return;
    }
    screen = 'MENU'; sel = 0;
  }
  // input layer: R1 events and desktop fallback call the debounced handlers.
  // The debug hook calls the raw handlers directly so automated checks are deterministic.
  window.addEventListener('scrollUp', function () { nav(-1); });
  window.addEventListener('scrollDown', function () { nav(1); });
  window.addEventListener('sideClick', function () { confirm(); });
  window.addEventListener('longPressStart', function () { hold(); });
  window.addEventListener('wheel', function (e) { e.preventDefault(); nav(e.deltaY < 0 ? -1 : 1); }, { passive: false });
  window.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowUp') { e.preventDefault(); nav(-1); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); nav(1); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); confirm(); }
    else if (e.key === 'Escape' || e.key === 'Backspace') { e.preventDefault(); hold(); }
    else if (e.key === 'm' || e.key === 'M') { muted = !muted; flash(muted ? 'SOUND OFF' : 'SOUND ON'); }
  });
  var ty = null;
  canvas.addEventListener('touchstart', function (e) { ty = e.touches[0].clientY; }, { passive: true });
  canvas.addEventListener('touchend', function (e) {
    if (ty == null) return; var dy = e.changedTouches[0].clientY - ty; ty = null;
    if (dy < -18) nav(-1); else if (dy > 18) nav(1); else confirm();
  }, { passive: true });
  canvas.addEventListener('mousedown', function () { confirm(); });

  // ----------------------------------------------------------- skin rifle art
  function fillPattern(x, y, w, h, sk) {
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    var c1 = sk.c1, c2 = sk.c2, t = Date.now() / 1000;
    if (sk.pat === 'solid') { ctx.fillStyle = c1; ctx.fillRect(x, y, w, h); }
    else if (sk.pat === 'gradient') {
      var g = ctx.createLinearGradient(x, y, x + w, y);
      g.addColorStop(0, c1); g.addColorStop(0.5, c2); g.addColorStop(1, c1);
      ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
    } else if (sk.pat === 'stripe') {
      ctx.fillStyle = c1; ctx.fillRect(x, y, w, h); ctx.fillStyle = c2;
      for (var i = -h; i < w + h; i += 9) {
        ctx.beginPath(); ctx.moveTo(x + i, y + h); ctx.lineTo(x + i + 4, y);
        ctx.lineTo(x + i + 8, y); ctx.lineTo(x + i + 4, y + h); ctx.fill();
      }
    } else if (sk.pat === 'glow') {
      ctx.fillStyle = c1; ctx.fillRect(x, y, w, h);
      ctx.shadowColor = c2; ctx.shadowBlur = 7; ctx.fillStyle = c2;
      ctx.fillRect(x + 1, y + Math.floor(h / 2) - 1, w - 2, 2);
      ctx.shadowBlur = 0;
    } else if (sk.pat === 'flame') {
      var fg = ctx.createLinearGradient(x, y + h, x, y);
      fg.addColorStop(0, c2); fg.addColorStop(1, c1);
      ctx.fillStyle = fg; ctx.fillRect(x, y, w, h);
      ctx.fillStyle = c2;
      for (var f = 0; f < w; f += 10) {
        var fh = 3 + Math.abs(Math.sin(t * 3 + f)) * (h - 3);
        ctx.fillRect(x + f, y + h - fh, 4, fh);
      }
    } else if (sk.pat === 'starfield') {
      ctx.fillStyle = c1; ctx.fillRect(x, y, w, h); ctx.fillStyle = c2;
      for (var s = 0; s < w / 3; s++) {
        var sx = x + ((s * 37) % w), sy = y + ((s * 19 + Math.floor(t * 2)) % h);
        ctx.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(t + s));
        ctx.fillRect(sx, sy, 1, 1);
      }
      ctx.globalAlpha = 1;
    } else if (sk.pat === 'rainbow' || sk.pat === 'rgb') {
      var speed = sk.pat === 'rgb' ? 4 : 1.2;
      var rg = ctx.createLinearGradient(x, y, x + w, y);
      for (var k = 0; k <= 6; k++) rg.addColorStop(k / 6, 'hsl(' + ((t * speed * 60 + k * 60) % 360) + ',95%,60%)');
      ctx.fillStyle = rg; ctx.fillRect(x, y, w, h);
      ctx.shadowColor = c2; ctx.shadowBlur = 6; ctx.fillStyle = '#fff8';
      ctx.fillRect(x, y + 1, w, 1); ctx.shadowBlur = 0;
    }
    ctx.restore();
  }
  function drawRifle(x, y, w, sk) {
    var h = Math.max(8, Math.round(w * 0.19));
    // shadow
    ctx.fillStyle = '#0007'; rr(x + 2, y + 3, w, h, 2); ctx.fill();
    // stock
    ctx.fillStyle = '#1a1d2b';
    ctx.beginPath(); ctx.moveTo(x, y + 2); ctx.lineTo(x + w * 0.26, y + 1);
    ctx.lineTo(x + w * 0.26, y + h - 1); ctx.lineTo(x + w * 0.05, y + h - 1); ctx.closePath(); ctx.fill();
    // barrel + body (skinned)
    fillPattern(x + w * 0.24, y + 2, w * 0.60, h - 4, sk);
    // muzzle
    ctx.fillStyle = '#2b3045'; ctx.fillRect(x + w * 0.84, y + h * 0.25, w * 0.16, h * 0.5);
    // scope
    ctx.fillStyle = '#111520'; rr(x + w * 0.40, y - h * 0.28, w * 0.24, h * 0.36, 2); ctx.fill();
    ctx.fillStyle = sk.c2; ctx.fillRect(x + w * 0.62, y - h * 0.22, 2, h * 0.24);
    // magazine / grip
    ctx.fillStyle = '#232838';
    ctx.beginPath(); ctx.moveTo(x + w * 0.46, y + h - 2); ctx.lineTo(x + w * 0.56, y + h - 2);
    ctx.lineTo(x + w * 0.58, y + h + 5); ctx.lineTo(x + w * 0.48, y + h + 5); ctx.closePath(); ctx.fill();
  }

  // ----------------------------------------------------------- drawing
  function drawTitle() {
    ctx.fillStyle = '#080d1a'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#101a30';
    for (var y = 0; y < H; y += 14) for (var x = (y / 14 % 2) * 14; x < W; x += 28) ctx.fillRect(x, y, 26, 12);
    ctx.fillStyle = '#000a'; ctx.fillRect(0, 96, W, 92);
    txt('SNIPER', W / 2, 120, 24, '#fff', 'center', true);
    txt('ARENA', W / 2, 148, 28, '#ff6b6b', 'center', true);
    txt('- R1 EDITION -', W / 2, 166, 8, '#ffd43b', 'center');
    var s = skin('exo_rainbow'); drawRifle(38, 196, 164, s);
    var blink = (Date.now() % 1000) < 620;
    if (blink) txt('SIDE BUTTON: ENTER', W / 2, 242, 9, '#fff', 'center', true);
    txt('scroll = select   side = OK   hold = ?', W / 2, 266, 6, '#6b789e', 'center');
  }

  function topBar(label) {
    ctx.fillStyle = '#0b1020'; ctx.fillRect(0, 0, W, 17);
    txt(label, 4, 12, 9, '#fff', 'left', true);
    txt('CR ' + fmt(P.credits), 96, 12, 7, '#8ce99a', 'left');
    txt('G ' + fmt(P.gold), 166, 12, 7, '#ffd43b', 'left');
    txt(fmt(P.cash), W - 4, 12, 7, '#40c9a2', 'right');
    ctx.fillStyle = '#23305a'; ctx.fillRect(0, 16, W, 1);
  }
  function drawMenu() {
    topBar('MENU');
    var items = [
      { n: 'PLAY MATCH', c: '#ff6b6b', d: '90s sniper duel - earn CR + Gold' },
      { n: 'ARMORY', c: '#ffd43b', d: 'Unlock 8 rifles with Gold' },
      { n: 'CASES', c: '#b197fc', d: 'Open 7 cases for exotic skins' },
      { n: 'MARKET', c: '#40c9a2', d: 'Sell skins for CASH' },
      { n: 'STATS', c: '#4dabf7', d: 'Your career record' },
      { n: 'HOW TO PLAY', c: '#adb5bd', d: 'Controls and systems' }
    ];
    for (var i = 0; i < items.length; i++) {
      var y = 24 + i * 39, on = sel === i;
      ctx.fillStyle = on ? '#25335f' : '#111a30'; rr(4, y, 232, 35, 4); ctx.fill();
      if (on) { ctx.fillStyle = '#ff6b6b'; ctx.fillRect(4, y, 3, 35); }
      txt(items[i].n, 14, y + 16, 11, items[i].c, 'left', true);
      txt(items[i].d, 14, y + 28, 6, '#9fb0d8', 'left');
    }
    drawFooterHints();
  }
  function drawFooterHints() {
    ctx.fillStyle = '#0b1020'; ctx.fillRect(0, 256, W, 26);
    txt('scroll:select   side:OK   hold:back', W / 2, 269, 6, '#66749c', 'center');
    txt('R1 creation by MrGhostGuy', W / 2, 279, 5, '#3f4a6b', 'center');
  }

  function drawMatch() {
    var m = match; if (!m) return;
    var sx = m.shake ? ri(-m.shake, m.shake) : 0;
    var sy = m.shake ? ri(-m.shake, m.shake) : 0;
    ctx.save(); ctx.translate(sx, sy);
    // sky
    var g = ctx.createLinearGradient(0, 16, 0, 206);
    g.addColorStop(0, '#12203f'); g.addColorStop(0.6, '#1b2c52'); g.addColorStop(1, '#0d1428');
    ctx.fillStyle = g; ctx.fillRect(0, 16, W, 190);
    // skyline
    ctx.fillStyle = '#0a1022';
    for (var b = 0; b < 14; b++) {
      var bw = 14 + (b % 3) * 5, bh = 14 + ((b * 17) % 34);
      ctx.fillRect(b * 18 - 6, 206 - bh, bw, bh);
    }
    ctx.fillStyle = '#070b16'; ctx.fillRect(0, 204, W, 4);
    // lanes
    for (var l = 0; l < 4; l++) {
      var ly = 46 + l * 40;
      if (l === m.lane) {
        ctx.fillStyle = '#ffffff0c'; ctx.fillRect(0, ly - 18, W, 36);
        ctx.fillStyle = '#ff6b6b55'; ctx.fillRect(0, ly - 18, 2, 36); ctx.fillRect(W - 2, ly - 18, 2, 36);
      }
      ctx.fillStyle = '#ffffff10'; ctx.fillRect(0, ly + 17, W, 1);
    }
    // enemies
    for (var i = 0; i < m.enemies.length; i++) {
      var e = m.enemies[i], ey = 46 + e.lane * 40;
      ctx.globalAlpha = e.alpha * (e.peek > 0 ? 0.45 : 1);
      // cover block for campers
      if (e.o.name === 'CAMP') { ctx.fillStyle = '#2a3348'; ctx.fillRect(e.x - 10, ey + 2, 20, 14); }
      ctx.fillStyle = e.o.color;
      ctx.fillRect(e.x - 5, ey - 10, 10, 8);          // head
      ctx.fillRect(e.x - 7, ey - 2, 14, 16);          // body
      ctx.fillStyle = '#0b1020';
      ctx.fillRect(e.x - 2, ey - 8, 2, 2); ctx.fillRect(e.x + 2, ey - 8, 2, 2);
      ctx.globalAlpha = 1;
    }
    // effects
    for (var k = 0; k < m.effects.length; k++) {
      var f = m.effects[k];
      if (f.kind === 'tracer') {
        ctx.strokeStyle = '#ffe066'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(120, 260); ctx.lineTo(f.x, f.y); ctx.stroke();
      } else if (f.kind === 'enemytracer') {
        ctx.strokeStyle = '#ff6b6b99'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.lineTo(120, 258); ctx.stroke();
      } else if (f.kind === 'hit') {
        ctx.strokeStyle = f.head ? '#ffd43b' : '#8ce99a'; ctx.lineWidth = 2;
        var rad = (0.4 - f.t) * 55 + 3;
        ctx.beginPath(); ctx.arc(f.x, f.y, rad, 0, Math.PI * 2); ctx.stroke();
      }
    }
    // crosshair (selected lane)
    var cy = 46 + m.lane * 40;
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(m.cx - 9, cy); ctx.lineTo(m.cx - 3, cy);
    ctx.moveTo(m.cx + 3, cy); ctx.lineTo(m.cx + 9, cy);
    ctx.moveTo(m.cx, cy - 9); ctx.lineTo(m.cx, cy - 3);
    ctx.moveTo(m.cx, cy + 3); ctx.lineTo(m.cx, cy + 9); ctx.stroke();
    ctx.fillStyle = '#ff6b6b'; ctx.fillRect(m.cx - 1, cy - 1, 2, 2);
    if (m.muzzle > 0) {
      ctx.fillStyle = '#fff6b0'; ctx.beginPath();
      ctx.moveTo(120, 258); ctx.lineTo(112, 236); ctx.lineTo(128, 236); ctx.closePath(); ctx.fill();
    }
    ctx.restore();

    // HUD top
    ctx.fillStyle = '#0b1020'; ctx.fillRect(0, 0, W, 17);
    txt('K ' + m.kills + '  HS ' + m.heads, 4, 12, 8, '#fff', 'left', true);
    var mm = Math.floor(m.t / 60), ss = Math.floor(m.t % 60);
    txt(mm + ':' + String(ss).padStart(2, '0'), W / 2, 12, 9, m.t < 15 ? '#ff6b6b' : '#ffd43b', 'center', true);
    txt('SC ' + m.score, W - 4, 12, 8, '#8ce99a', 'right', true);
    // HP pips
    for (var h = 0; h < 3; h++) {
      ctx.fillStyle = h < m.hp ? '#ff6b6b' : '#3a2030';
      rr(4 + h * 14, 210, 11, 5, 2); ctx.fill();
    }
    // opponents
    var ox = 54;
    for (var q = 0; q < m.opps.length; q++) {
      ctx.fillStyle = m.opps[q].color; ctx.fillRect(ox + q * 60, 210, 5, 5);
      txt(m.opps[q].name, ox + q * 60 + 8, 215, 6, m.opps[q].color, 'left');
    }
    // bottom panel
    ctx.fillStyle = '#0b1020'; ctx.fillRect(0, 220, W, 62);
    var r = rifle(P.rifle), sk = skin(P.skin);
    txt(r.name + '  |  ' + sk.model, 4, 232, 8, '#fff', 'left', true);
    txt(sk.name, 4, 242, 6, RARITY[sk.r].color, 'left');
    // reload bar
    ctx.fillStyle = '#1b2440'; rr(4, 248, 232, 5, 2); ctx.fill();
    var ready = 1 - m.reload / r.reload;
    ctx.fillStyle = m.reload > 0 ? '#ff922b' : '#8ce99a';
    rr(4, 248, 232 * clamp(ready, 0, 1), 5, 2); ctx.fill();
    txt(m.reload > 0 ? 'RELOADING' : 'READY - SIDE TO FIRE', 4, 264, 7, m.reload > 0 ? '#ff922b' : '#8ce99a', 'left', true);
    txt('LANE ' + (m.lane + 1) + '/4', W - 4, 264, 7, '#9fb0d8', 'right');
    txt('CR +' + m.credits + '   G +' + m.gold, 4, 276, 6, '#ffd43b', 'left');
    // flash
    if (fxTimer > 0 && !m.downed) {
      ctx.fillStyle = '#000a'; rr(50, 108, 140, 22, 4); ctx.fill();
      txt(fxMsg, W / 2, 123, 9, '#fff', 'center', true);
    }
    if (m.hurtFlash > 0) { ctx.fillStyle = 'rgba(255,0,0,' + (m.hurtFlash * 0.22) + ')'; ctx.fillRect(0, 17, W, 189); }
    if (m.downed > 0) {
      ctx.fillStyle = '#000b'; ctx.fillRect(0, 17, W, 203);
      txt('DOWNED', W / 2, 110, 20, '#ff6b6b', 'center', true);
      txt('RESPAWNING...', W / 2, 130, 8, '#fff', 'center');
    }
  }

  function drawResult() {
    var m = match; if (!m) return;
    topBar('MATCH OVER');
    var rank = m.score >= 3500 ? 'S' : m.score >= 2200 ? 'A' : m.score >= 1200 ? 'B' : 'C';
    var rc = rank === 'S' ? '#ffd43b' : rank === 'A' ? '#40c9a2' : '#9fb0d8';
    ctx.fillStyle = '#111a30'; rr(6, 26, 228, 52, 5); ctx.fill();
    txt(rank, 40, 68, 34, rc, 'center', true);
    txt('RANK', 40, 30, 7, '#9fb0d8', 'center');
    txt('SCORE', 148, 36, 7, '#9fb0d8', 'left');
    txt(String(m.score), 148, 58, 19, '#fff', 'left', true);
    var rows = [
      ['KILLS', String(m.kills)], ['HEADSHOTS', String(m.heads)],
      ['ACCURACY', (m.shots ? Math.round(m.hits / m.shots * 100) : 0) + '%'],
      ['DEATHS', String(m.deaths)],
      ['CREDITS EARNED', '+' + m.credits], ['GOLD EARNED', '+' + m.gold]
    ];
    for (var i = 0; i < rows.length; i++) {
      var y = 92 + i * 21;
      ctx.fillStyle = i % 2 ? '#111a30' : '#0d1425'; ctx.fillRect(6, y, 228, 20);
      txt(rows[i][0], 12, y + 14, 7, '#9fb0d8', 'left');
      txt(rows[i][1], 228, y + 14, 8, i >= 4 ? '#ffd43b' : '#fff', 'right', true);
    }
    if (fxTimer > 0) { ctx.fillStyle = '#0b1020'; rr(6, 224, 228, 20, 3); ctx.fill(); txt(fxMsg, W / 2, 238, 8, '#ffd43b', 'center', true); }
    txt('SIDE BUTTON: MENU', W / 2, 270, 9, '#8ce99a', 'center', true);
  }

  function drawArmory() {
    topBar('ARMORY');
    if (sub === 0) {
      for (var i = 0; i < RIFLES.length; i++) {
        var r = RIFLES[i], y = 24 + i * 28, on = sel === i;
        var owned = P.rifles.indexOf(r.id) >= 0, equipped = P.rifle === r.id;
        ctx.fillStyle = on ? '#25335f' : '#111a30'; rr(3, y, 234, 26, 3); ctx.fill();
        if (on) { ctx.fillStyle = '#ffd43b'; ctx.fillRect(3, y, 3, 26); }
        txt(r.name, 12, y + 11, 9, owned ? '#fff' : '#66749c', 'left', true);
        txt(r.tier, 12, y + 21, 6, r.tier === 'S' ? '#ff6b6b' : r.tier === 'A' ? '#ffd43b' : '#9fb0d8', 'left');
        txt('Z' + r.zoom.toFixed(2) + ' S' + r.sway.toFixed(1) + ' R' + r.reload.toFixed(2), 72, y + 21, 6, '#9fb0d8', 'left');
        drawRifle(158, y + 8, 70, skin(P.skin));
        txt(equipped ? 'EQUIPPED' : owned ? 'OWNED' : fmt(r.price) + ' G', 234, y + 11, 7,
          equipped ? '#8ce99a' : owned ? '#4dabf7' : (P.gold >= r.price ? '#ffd43b' : '#ff6b6b'), 'right', true);
      }
      drawFooterHints(); return;
    }
    var rf3 = RIFLES[armoryIdx];
    ctx.fillStyle = '#0a0f1e'; ctx.fillRect(0, 17, W, H - 17);
    txt(rf3.name, W / 2, 38, 15, '#fff', 'center', true);
    txt('TIER ' + rf3.tier + '  -  ' + fmt(rf3.price) + ' GOLD', W / 2, 54, 8, '#ffd43b', 'center');
    drawRifle(28, 76, 184, skin(P.skin));
    wrapText(rf3.desc, 12, 118, 216, 10, 7, '#c9d6ff');
    var stats = [
      ['ZOOM WINDOW', rf3.zoom.toFixed(2) + 'x'],
      ['Sway (lower better)', rf3.sway.toFixed(2)],
      ['RELOAD', rf3.reload.toFixed(2) + 's'],
      ['CREDIT MULT', 'x' + rf3.mult.toFixed(1)]
    ];
    for (var j = 0; j < stats.length; j++) {
      var yy = 140 + j * 17;
      txt(stats[j][0], 12, yy, 7, '#9fb0d8', 'left');
      txt(stats[j][1], 228, yy, 8, '#fff', 'right', true);
    }
    var owned2 = P.rifles.indexOf(rf3.id) >= 0;
    var act = owned2 ? (P.rifle === rf3.id ? 'EQUIPPED' : 'EQUIP THIS RIFLE') : 'UNLOCK - ' + fmt(rf3.price) + ' G';
    choice(228, 0, act, '#ffd43b'); choice(254, 1, 'BACK', '#c9d6ff');
  }
  function choice(y, i, label, color) {
    var on = sel === i;
    ctx.fillStyle = on ? '#2b3a6b' : '#161f3a'; rr(4, y, 232, 22, 3); ctx.fill();
    if (on) { ctx.strokeStyle = '#ff922b'; rr(4.5, y + .5, 231, 21, 3); ctx.stroke(); }
    txt(label, W / 2, y + 15, 9, color, 'center', true);
  }

  function drawCases() {
    topBar('CASES');
    if (sub === 2 && caseRoll) {
      var sk = caseRoll.skin, rr2 = RARITY[sk.r];
      ctx.fillStyle = '#0a0f1e'; ctx.fillRect(0, 17, W, H - 17);
      txt('CASE OPENED', W / 2, 40, 10, '#9fb0d8', 'center');
      var pulse = 0.6 + 0.4 * Math.abs(Math.sin(Date.now() / 220));
      ctx.globalAlpha = pulse;
      txt(sk.r, W / 2, 68, 20, rr2.color, 'center', true);
      ctx.globalAlpha = 1;
      drawRifle(24, 96, 192, sk);
      txt(sk.name, W / 2, 146, 9, rr2.color, 'center', true);
      txt(sk.model + '  |  MARKET ' + fmt(skinValue(sk)) + ' CASH', W / 2, 162, 7, '#c9d6ff', 'center');
      txt('ODDS  C50 R28 E14 L6 M1.7 X0.3', W / 2, 186, 6, '#66749c', 'center');
      txt('SIDE BUTTON: CONTINUE', W / 2, 250, 8, '#fff', 'center', true);
      return;
    }
    for (var i = 0; i < CASES.length; i++) {
      var c = CASES[i], y = 24 + i * 32, on = sel === i;
      ctx.fillStyle = on ? '#25335f' : '#111a30'; rr(3, y, 234, 29, 3); ctx.fill();
      if (on) { ctx.fillStyle = '#b197fc'; ctx.fillRect(3, y, 3, 29); }
      // case box
      ctx.fillStyle = on ? '#b197fc' : '#564a7a';
      ctx.fillRect(11, y + 8, 14, 14); ctx.fillStyle = '#1a1530'; ctx.fillRect(15, y + 8, 6, 14);
      txt(c.name, 32, y + 13, 9, '#fff', 'left', true);
      txt(c.series + ' series', 32, y + 23, 6, '#9fb0d8', 'left');
      txt(fmt(c.price) + ' CR', 234, y + 18, 8, P.credits >= c.price ? '#8ce99a' : '#ff6b6b', 'right', true);
    }
    txt('SIDE: OPEN CASE  -  ' + P.stats.opened + ' opened', W / 2, 252, 7, '#ffd43b', 'center', true);
    drawFooterHints();
  }

  function drawMarket() {
    topBar('MARKET');
    if (sub === 1) {
      var sk2 = SKINS[marketIdx], rr3 = RARITY[sk2.r];
      ctx.fillStyle = '#0a0f1e'; ctx.fillRect(0, 17, W, H - 17);
      txt(sk2.name, W / 2, 36, 9, rr3.color, 'center', true);
      txt(sk2.r + '  |  ' + sk2.model, W / 2, 50, 7, '#9fb0d8', 'center');
      drawRifle(22, 70, 196, sk2);
      txt('MARKET VALUE', W / 2, 112, 7, '#9fb0d8', 'center');
      txt(fmt(skinValue(sk2)) + ' CASH', W / 2, 132, 16, '#40c9a2', 'center', true);
      txt('OWNED: ' + (P.owned[sk2.id] || 0), W / 2, 152, 8, '#fff', 'center');
      txt('Patterns: ' + sk2.pat.toUpperCase(), W / 2, 170, 6, '#66749c', 'center');
      txt('Skins are cosmetic only - no stat bonuses.', W / 2, 190, 6, '#66749c', 'center');
      choice(216, 0, ownsSkin(sk2.id) ? 'SELL ONE - +' + fmt(skinValue(sk2)) : 'NOT OWNED', '#40c9a2');
      choice(246, 1, 'BACK', '#c9d6ff');
      return;
    }
    var ownedCount = 0;
    for (var q = 0; q < SKINS.length; q++) if (ownsSkin(SKINS[q].id)) ownedCount++;
    txt('COLLECTION ' + ownedCount + '/' + SKINS.length, 4, 27, 7, '#9fb0d8', 'left', true);
    var start = clamp(sel - 7, 0, Math.max(0, SKINS.length - 15));
    for (var i = start; i < Math.min(SKINS.length, start + 15); i++) {
      var s = SKINS[i], y = 31 + (i - start) * 15, on = sel === i;
      if (on) { ctx.fillStyle = '#25335f'; ctx.fillRect(2, y, 236, 14); }
      ctx.fillStyle = RARITY[s.r].color; ctx.fillRect(6, y + 2, 10, 10);
      txt(s.name.slice(0, 24), 21, y + 11, 6, ownsSkin(s.id) ? '#fff' : '#5c6688', 'left');
      txt(ownsSkin(s.id) ? 'x' + P.owned[s.id] : '-', 234, y + 11, 6, ownsSkin(s.id) ? '#40c9a2' : '#4b5578', 'right');
    }
    drawFooterHints();
  }

  function drawStats() {
    topBar('CAREER STATS');
    var rows = [
      ['MATCHES', P.stats.matches], ['KILLS', P.stats.kills],
      ['HEADSHOTS', P.stats.heads], ['DEATHS', P.stats.deaths],
      ['SHOTS FIRED', P.stats.shots],
      ['ACCURACY', (P.stats.shots ? Math.round(P.stats.hits / P.stats.shots * 100) : 0) + '%'],
      ['BEST SCORE', P.stats.best], ['CASES OPENED', P.stats.opened],
      ['RIFLES OWNED', P.rifles.length + '/8'],
      ['SKINS OWNED', Object.keys(P.owned).length + '/' + SKINS.length],
      ['DAILY HEADSHOTS', (P.daily.heads || 0) + '/10']
    ];
    for (var i = 0; i < rows.length; i++) {
      var y = 28 + i * 20;
      ctx.fillStyle = i % 2 ? '#111a30' : '#0d1425'; ctx.fillRect(6, y, 228, 19);
      txt(rows[i][0], 12, y + 13, 7, '#9fb0d8', 'left');
      txt(String(rows[i][1]), 228, y + 13, 8, '#fff', 'right', true);
    }
    txt('SIDE BUTTON: MENU', W / 2, 268, 8, '#8ce99a', 'center', true);
  }

  function drawHelp() {
    ctx.fillStyle = '#0b1020'; ctx.fillRect(0, 0, W, H);
    txt('HOW TO PLAY', W / 2, 24, 13, '#ffd43b', 'center', true);
    var L = [
      'SCROLL: switch aiming lane (1-4)',
      'SIDE BUTTON: fire your rifle',
      'HOLD: back / help',
      '',
      'Hit the tight center for a',
      'HEADSHOT - double points.',
      'Enemies shoot back. 3 HP,',
      'then a 1.3s respawn.',
      '',
      'MATCH rewards: Credits + Gold.',
      'Gold unlocks 8 real rifles -',
      'better zoom, less sway,',
      'faster reload, more CR.',
      '',
      'CASES drop cosmetic skins across',
      '6 rarities up to EXOTIC. Sell',
      'duplicates on the MARKET for CASH.',
      '',
      '10 daily headshots = +500 CR.'
    ];
    for (var i = 0; i < L.length; i++) txt(L[i], 10, 42 + i * 10.5, 6.5, i < 3 ? '#fff' : '#9fb0d8', 'left');
    txt('SIDE = CLOSE', W / 2, 274, 8, '#8ce99a', 'center', true);
  }

  function wrapText(s, x, y, maxW, lh, size, color) {
    ctx.font = size + 'px monospace';
    var words = s.split(' '), line = '', yy = y;
    for (var i = 0; i < words.length; i++) {
      var test = line ? line + ' ' + words[i] : words[i];
      if (ctx.measureText(test).width > maxW && line) { txt(line, x, yy, size, color, 'left'); line = words[i]; yy += lh; }
      else line = test;
    }
    if (line) txt(line, x, yy, size, color, 'left');
  }

  // ----------------------------------------------------------- loop
  function update(dt) {
    if (screen === 'MATCH') updateMatch(dt);
    if (fxTimer > 0) fxTimer -= dt;
  }
  function draw() {
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    if (screen === 'TITLE') drawTitle();
    else if (screen === 'MENU') drawMenu();
    else if (screen === 'MATCH') drawMatch();
    else if (screen === 'RESULT') drawResult();
    else if (screen === 'ARMORY') drawArmory();
    else if (screen === 'CASES') drawCases();
    else if (screen === 'MARKET') drawMarket();
    else if (screen === 'STATS') drawStats();
    else if (screen === 'HELP') drawHelp();
  }
  function loop(t) {
    var dt = Math.min(0.1, (t - lastT) / 1000 || 0); lastT = t;
    update(dt); draw(); requestAnimationFrame(loop);
  }
  // fix armory index tracking
  var _origNav = nav;
  window.__sar1hook = {
    get P() { return P; }, get screen() { return screen; }, get match() { return match; },
    setScreen: function (s) { screen = s; }, nav: nav, confirm: confirmRaw,
    hold: hold, fire: fire, openCase: openCase, equip: equipRifle, sell: sellSkin,
    setSel: function (v) { sel = v; }, setSub: function (v) { sub = v; },
    setArmory: function (v) { armoryIdx = v; }, setMarket: function (v) { marketIdx = v; },
    tick: update, skins: SKINS, rifles: RIFLES, cases: CASES
  };
  requestAnimationFrame(function (t) { lastT = t; requestAnimationFrame(loop); });
})();
