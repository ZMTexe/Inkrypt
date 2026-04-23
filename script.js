/* ═══════════════════════════════════════════
   INKRYPT — script.js
   Chiffrement AES-256-GCM via WebCrypto API
   ═══════════════════════════════════════════ */

'use strict';

// ── DOM refs ──────────────────────────────────────────────────────────────────
const elMsg      = document.getElementById('message');
const elSecret   = document.getElementById('secret');
const elResult   = document.getElementById('result');
const elEncrypt  = document.getElementById('btnEncrypt');
const elDecrypt  = document.getElementById('btnDecrypt');
const elCopy     = document.getElementById('btnCopy');
const elTogglePwd= document.getElementById('togglePwd');
const elStrength = document.getElementById('strengthFill');
const elStatus   = document.getElementById('statusDot');
const elCard     = document.getElementById('card');
const elToast    = document.getElementById('toast');

// ── Scramble effect ───────────────────────────────────────────────────────────
const GLYPHS = '▓░▒█▄▀◈◉⬡⬢◆■□▪▫01ABCDEFabcdef!@#$%^&*';
let scrambleTimer = null;

function startScramble(length = 48) {
  elResult.classList.add('scrambling');
  let ticks = 0;
  const total = 22;
  scrambleTimer = setInterval(() => {
    const chars = Array.from({ length: Math.min(length, 64) }, () =>
      GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
    ).join('');
    elResult.value = chars;
    ticks++;
    if (ticks >= total) stopScramble();
  }, 40);
}

function stopScramble() {
  clearInterval(scrambleTimer);
  scrambleTimer = null;
  elResult.classList.remove('scrambling');
}

// ── Key derivation (PBKDF2 → AES-GCM) ────────────────────────────────────────
async function deriveKey(password, salt) {
  const enc = new TextEncoder();
  const raw = await crypto.subtle.importKey(
    'raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 250_000, hash: 'SHA-256' },
    raw,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// ── Encrypt ───────────────────────────────────────────────────────────────────
async function encrypt(plaintext, password) {
  const enc  = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv   = crypto.getRandomValues(new Uint8Array(12));
  const key  = await deriveKey(password, salt);
  const ct   = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(plaintext)
  );
  // Payload compact : [salt(16)] + [iv(12)] + [ciphertext]
  const buf = new Uint8Array(salt.length + iv.length + ct.byteLength);
  buf.set(salt, 0);
  buf.set(iv, 16);
  buf.set(new Uint8Array(ct), 28);
  return btoa(String.fromCharCode(...buf));
}

// ── Decrypt ───────────────────────────────────────────────────────────────────
async function decrypt(payload, password) {
  const raw  = Uint8Array.from(atob(payload), c => c.charCodeAt(0));
  const salt = raw.slice(0, 16);
  const iv   = raw.slice(16, 28);
  const ct   = raw.slice(28);
  const key  = await deriveKey(password, salt);
  const pt   = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
  return new TextDecoder().decode(pt);
}

// ── UI helpers ────────────────────────────────────────────────────────────────
function setStatus(type) {
  elStatus.className = 'status-dot' + (type ? ' ' + type : '');
}

function setProcessing(on) {
  elCard.classList.toggle('processing', on);
  elEncrypt.disabled = on;
  elDecrypt.disabled = on;
}

function flashError(msg) {
  elResult.value = '⚠ ' + msg;
  setStatus('error');
  elCard.classList.add('shake');
  elCard.addEventListener('animationend', () => elCard.classList.remove('shake'), { once: true });
}

function showToast() {
  elToast.classList.add('show');
  setTimeout(() => elToast.classList.remove('show'), 2200);
}

// ── Password strength ─────────────────────────────────────────────────────────
elSecret.addEventListener('input', () => {
  const v = elSecret.value;
  let score = 0;
  if (v.length >= 8)           score += 25;
  if (v.length >= 14)          score += 15;
  if (/[A-Z]/.test(v))         score += 15;
  if (/[0-9]/.test(v))         score += 20;
  if (/[^A-Za-z0-9]/.test(v))  score += 25;
  const pct = Math.min(score, 100);
  elStrength.style.width = pct + '%';
  elStrength.style.background =
    pct < 35 ? 'var(--danger)' :
    pct < 65 ? '#f5a623' :
               'var(--accent)';
});

// ── Toggle password visibility ────────────────────────────────────────────────
elTogglePwd.addEventListener('click', () => {
  const show = elSecret.type === 'password';
  elSecret.type = show ? 'text' : 'password';
  elTogglePwd.style.color = show ? 'var(--accent)' : '';
});

// ── Encrypt handler ───────────────────────────────────────────────────────────
elEncrypt.addEventListener('click', async () => {
  const msg = elMsg.value.trim();
  const pwd = elSecret.value;
  if (!msg) { flashError('Message vide.'); return; }
  if (!pwd) { flashError('Clé secrète requise.'); return; }

  setProcessing(true);
  setStatus('active');
  startScramble(64);

  try {
    const result = await encrypt(msg, pwd);
    stopScramble();
    elResult.value = result;
    setStatus('ok');
  } catch (e) {
    stopScramble();
    flashError('Erreur de chiffrement : ' + e.message);
  } finally {
    setProcessing(false);
  }
});

// ── Decrypt handler ───────────────────────────────────────────────────────────
elDecrypt.addEventListener('click', async () => {
  const payload = elMsg.value.trim();
  const pwd     = elSecret.value;
  if (!payload) { flashError('Collez le message chiffré dans le champ source.'); return; }
  if (!pwd)     { flashError('Clé secrète requise.'); return; }

  setProcessing(true);
  setStatus('active');
  startScramble(48);

  try {
    const result = await decrypt(payload, pwd);
    stopScramble();
    elResult.value = result;
    setStatus('ok');
  } catch {
    stopScramble();
    flashError('Déchiffrement échoué — clé incorrecte ou données corrompues.');
  } finally {
    setProcessing(false);
  }
});

// ── Copy handler ──────────────────────────────────────────────────────────────
elCopy.addEventListener('click', async () => {
  const txt = elResult.value;
  if (!txt || txt.startsWith('⚠')) return;
  try {
    await navigator.clipboard.writeText(txt);
    showToast();
  } catch {
    elResult.select();
    document.execCommand('copy');
    showToast();
  }
});

/* ── Matrix Digital Rain ─────────────────────────────────────────────────── */
(function () {
  const canvas  = document.getElementById('matrix-bg');
  const ctx     = canvas.getContext('2d');
  const COLOR   = '#00f5c4';
  const FONT_SZ = 14;
  let cols, drops;

  function init() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    cols  = Math.floor(canvas.width / FONT_SZ);
    drops = Array.from({ length: cols }, () => Math.random() * -100 | 0);
  }

  function draw() {
    ctx.fillStyle = 'rgba(8, 11, 16, 0.18)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = COLOR;
    ctx.font      = FONT_SZ + 'px "Share Tech Mono", monospace';

    for (let i = 0; i < cols; i++) {
      const char = Math.random() > 0.5 ? '1' : '0';
      ctx.fillText(char, i * FONT_SZ, drops[i] * FONT_SZ);
      if (drops[i] * FONT_SZ > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
  }

  init();
  setInterval(draw, 50);
  window.addEventListener('resize', init);
})();