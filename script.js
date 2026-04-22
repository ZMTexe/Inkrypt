/* ═══════════════════════════════════════════
   INKRYPT — script.js
   Router SPA + Chiffrement AES-256-GCM
   ═══════════════════════════════════════════ */

'use strict';

import { initPasswords } from './modules/passwords.js';
import { initNotes }     from './modules/notes.js';
import { initCleaner }   from './modules/cleaner.js';

// ══════════════════════════════════════════════
// API GLOBALE (accessible par les modules)
// ══════════════════════════════════════════════
window.inkrypt = {
  showToast(msg) {
    const icon = document.querySelector('.toast-icon');
    const txt  = document.getElementById('toastMsg');
    if (msg) {
      const parts = msg.split(' ');
      icon.textContent = parts[0];
      txt.textContent  = ' ' + parts.slice(1).join(' ');
    } else {
      icon.textContent = '✓';
      txt.textContent  = ' Copié dans le presse-papiers';
    }
    const el = document.getElementById('toast');
    el.classList.add('show');
    clearTimeout(window.inkrypt._toastTimer);
    window.inkrypt._toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
  },
  _toastTimer: null
};

// ══════════════════════════════════════════════
// ROUTER SPA
// ══════════════════════════════════════════════
const MODULES = {
  cipher:    { el: null, init: null,          loaded: true  },
  passwords: { el: null, init: initPasswords, loaded: false },
  notes:     { el: null, init: initNotes,     loaded: false },
  cleaner:   { el: null, init: initCleaner,   loaded: false },
};

let activeModule = localStorage.getItem('inkrypt_tab') || 'cipher';

function navigate(id) {
  if (!MODULES[id]) return;

  // Cacher tous les modules
  Object.keys(MODULES).forEach(k => {
    const el = document.getElementById('module-' + k);
    if (el) el.hidden = (k !== id);
  });

  // Mettre à jour sidebar
  document.querySelectorAll('.sb-btn[data-module]').forEach(btn =>
    btn.classList.toggle('active', btn.dataset.module === id)
  );

  // Charger module si nécessaire
  const mod = MODULES[id];
  if (!mod.loaded && mod.init) {
    const container = document.getElementById('module-' + id);
    mod.init(container);
    mod.loaded = true;
  }

  activeModule = id;
  localStorage.setItem('inkrypt_tab', id);
}

// Écouteurs sidebar
document.querySelectorAll('.sb-btn[data-module]').forEach(btn => {
  btn.addEventListener('click', () => navigate(btn.dataset.module));
});

// Toggle compact
const sidebar  = document.getElementById('sidebar');
const sbToggle = document.getElementById('sbToggle');
const isCompact = localStorage.getItem('inkrypt_sb_compact') === '1';

if (isCompact) {
  sidebar.classList.add('compact');
  document.body.classList.add('sb-compact');
  sbToggle.querySelector('.sb-icon').textContent  = '⟩';
  sbToggle.querySelector('.sb-label').textContent = 'Étendre';
}

sbToggle.addEventListener('click', () => {
  const compact = sidebar.classList.toggle('compact');
  document.body.classList.toggle('sb-compact', compact);
  sbToggle.querySelector('.sb-icon').textContent  = compact ? '⟩' : '⟨';
  sbToggle.querySelector('.sb-label').textContent = compact ? 'Étendre' : 'Réduire';
  localStorage.setItem('inkrypt_sb_compact', compact ? '1' : '0');
});

// Navigation initiale
navigate(activeModule);

// ══════════════════════════════════════════════
// CHIFFREMENT — constantes et helpers
// ══════════════════════════════════════════════
const PAYLOAD_V = 'v2';

const elMsg       = document.getElementById('message');
const elSecret    = document.getElementById('secret');
const elResult    = document.getElementById('result');
const elEncrypt   = document.getElementById('btnEncrypt');
const elDecrypt   = document.getElementById('btnDecrypt');
const elCopy      = document.getElementById('btnCopy');
const elTogglePwd = document.getElementById('togglePwd');
const elStrength  = document.getElementById('strengthFill');
const elStrLabel  = document.getElementById('strengthLabel');
const elStatus    = document.getElementById('statusDot');
const elCard      = document.getElementById('card');
const elResultMeta   = document.getElementById('resultMeta');
const elHintDisplay  = document.getElementById('hintDisplay');
const elBtnDl        = document.getElementById('btnDownload');
const elBtnShare     = document.getElementById('btnShare');
const elBtnClear     = document.getElementById('btnClear');
const elQrWrap       = document.getElementById('qrWrap');
const elQrCode       = document.getElementById('qrCode');
const elOptHint      = document.getElementById('optHint');
const elOptOnce      = document.getElementById('optOnce');
const elOptNoTrace   = document.getElementById('optNoTrace');
const elOptExpiry    = document.getElementById('optExpiry');
const elBtnGenKey    = document.getElementById('btnGenKey');
const elToggleFile   = document.getElementById('toggleFileMode');
const elFilePanel    = document.getElementById('filePanel');
const elFileBadge    = document.getElementById('fileBadge');
const elDropZone     = document.getElementById('dropZone');
const elFileInput    = document.getElementById('fileInput');
const elFileInfo     = document.getElementById('fileInfo');
const elFileName     = document.getElementById('fileName');
const elBtnClearFile = document.getElementById('btnClearFile');
const elBtnEncFile   = document.getElementById('btnEncryptFile');
const elBtnDecFile   = document.getElementById('btnDecryptFile');

let currentFile   = null;
let autoWipeTimer = null;

// ── Scramble effect ───────────────────────────────────────────────────────────
const GLYPHS = '▓░▒█▄▀◈◉⬡⬢◆■□▪▫01ABCDEFabcdef!@#$%^&*';
let scrambleTimer = null;

function startScramble(length = 48) {
  elResult.classList.add('scrambling');
  let ticks = 0;
  scrambleTimer = setInterval(() => {
    elResult.value = Array.from({ length: Math.min(length, 64) }, () =>
      GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
    ).join('');
    if (++ticks >= 22) stopScramble();
  }, 40);
}

function stopScramble() {
  clearInterval(scrambleTimer);
  scrambleTimer = null;
  elResult.classList.remove('scrambling');
}

// ── Dérivation clé ────────────────────────────────────────────────────────────
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

// ── Encrypt v2 ────────────────────────────────────────────────────────────────
async function encrypt(plaintext, password) {
  const enc  = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv   = crypto.getRandomValues(new Uint8Array(12));
  const key  = await deriveKey(password, salt);

  const meta = {
    v:      PAYLOAD_V,
    once:   elOptOnce?.checked  || false,
    expiry: elOptExpiry?.value  ? Date.now() + parseInt(elOptExpiry.value) * 1000 : null,
  };
  const ct = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv }, key,
    enc.encode(JSON.stringify(meta) + '\x00' + plaintext)
  );

  const buf = new Uint8Array(16 + 12 + ct.byteLength);
  buf.set(salt, 0); buf.set(iv, 16); buf.set(new Uint8Array(ct), 28);
  let b64 = btoa(String.fromCharCode(...buf));

  const hint = elOptHint?.value.trim();
  if (hint) b64 += '§' + btoa(unescape(encodeURIComponent(hint)));
  return b64;
}

// ── Decrypt v2 ────────────────────────────────────────────────────────────────
async function decrypt(payload, password) {
  let hint = null;
  if (payload.includes('§')) {
    [payload, hint] = payload.split('§');
    try { hint = decodeURIComponent(escape(atob(hint))); } catch { hint = atob(hint); }
  }
  const raw  = Uint8Array.from(atob(payload), c => c.charCodeAt(0));
  const key  = await deriveKey(password, raw.slice(0, 16));
  const pt   = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: raw.slice(16, 28) }, key, raw.slice(28)
  );
  const full = new TextDecoder().decode(pt);
  const sep  = full.indexOf('\x00');
  let text   = full, meta = {};
  if (sep !== -1) {
    try { meta = JSON.parse(full.slice(0, sep)); } catch {}
    text = full.slice(sep + 1);
  }
  if (meta.expiry && Date.now() > meta.expiry) throw new Error('Payload expiré.');
  if (meta.once) {
    const k = 'read_' + btoa(payload).slice(0, 16);
    if (!elOptNoTrace?.checked) {
      if (sessionStorage.getItem(k)) throw new Error('Lecture unique — déjà lu.');
      sessionStorage.setItem(k, '1');
    }
  }
  return { text, hint };
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

function updateResultMeta(text) {
  elResultMeta.textContent = text ? `${text.length} car.` : '';
}

function renderQR(payload) {
  elQrCode.innerHTML = '';
  if (!payload || payload.length > 2048 || typeof QRCode === 'undefined') {
    elQrWrap.hidden = true; return;
  }
  try {
    new QRCode(elQrCode, {
      text: payload, width: 140, height: 140,
      colorDark: '#00f5c4', colorLight: '#0d1117',
      correctLevel: QRCode.CorrectLevel.M
    });
    elQrWrap.hidden = false;
  } catch { elQrWrap.hidden = true; }
}

function scrollToResult() {
  elResult.closest('.field-group').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function scheduleAutoWipe() {
  clearTimeout(autoWipeTimer);
  if (elOptNoTrace?.checked) {
    autoWipeTimer = setTimeout(() => {
      elResult.value = ''; elMsg.value = '';
      elResultMeta.textContent = '';
      elQrWrap.hidden = true; elHintDisplay.hidden = true;
      window.inkrypt.showToast('🔒 Effacement automatique');
    }, 30_000);
  }
}

// ── Entropie ──────────────────────────────────────────────────────────────────
function calcEntropy(pwd) {
  const cs =
    (/[a-z]/.test(pwd) ? 26 : 0) + (/[A-Z]/.test(pwd) ? 26 : 0) +
    (/[0-9]/.test(pwd)  ? 10 : 0) + (/[^a-zA-Z0-9]/.test(pwd) ? 32 : 0);
  return cs > 0 ? Math.floor(pwd.length * Math.log2(cs)) : 0;
}

elSecret.addEventListener('input', () => {
  const v = elSecret.value, e = calcEntropy(v);
  let score = 0;
  if (v.length >= 8)          score += 25;
  if (v.length >= 14)         score += 15;
  if (/[A-Z]/.test(v))        score += 15;
  if (/[0-9]/.test(v))        score += 20;
  if (/[^A-Za-z0-9]/.test(v)) score += 25;
  const color = e < 40 ? 'var(--danger)' : e < 70 ? '#f5a623' : 'var(--accent)';
  elStrength.style.width      = Math.min(score, 100) + '%';
  elStrength.style.background = color;
  elStrLabel.textContent = v.length ? `${e < 40 ? 'FAIBLE' : e < 70 ? 'MOYEN' : 'FORT'} · ${e} bits` : '—';
  elStrLabel.style.color = v.length ? color : 'var(--text-dim)';
});

// ── Génération clé ────────────────────────────────────────────────────────────
elBtnGenKey.addEventListener('click', () => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%&*-_';
  const arr   = crypto.getRandomValues(new Uint8Array(20));
  elSecret.value = Array.from(arr, b => chars[b % chars.length]).join('');
  elSecret.type  = 'text';
  elSecret.dispatchEvent(new Event('input'));
});

// ── Toggle pwd ────────────────────────────────────────────────────────────────
elTogglePwd.addEventListener('click', () => {
  const show = elSecret.type === 'password';
  elSecret.type = show ? 'text' : 'password';
  elTogglePwd.style.color = show ? 'var(--accent)' : '';
});

// ── Encrypt handler ───────────────────────────────────────────────────────────
elEncrypt.addEventListener('click', async () => {
  const msg = elMsg.value.trim(), pwd = elSecret.value;
  if (!msg) { flashError('Message vide.'); return; }
  if (!pwd) { flashError('Clé secrète requise.'); return; }
  setProcessing(true); setStatus('active'); startScramble(64);
  try {
    const result = await encrypt(msg, pwd);
    stopScramble(); elResult.value = result;
    setStatus('ok'); updateResultMeta(result);
    renderQR(result); scheduleAutoWipe(); scrollToResult();
  } catch (e) { stopScramble(); flashError('Erreur : ' + e.message); }
  finally { setProcessing(false); }
});

// ── Decrypt handler ───────────────────────────────────────────────────────────
elDecrypt.addEventListener('click', async () => {
  const payload = elMsg.value.trim(), pwd = elSecret.value;
  if (!payload) { flashError('Collez le message chiffré dans le champ source.'); return; }
  if (!pwd)     { flashError('Clé secrète requise.'); return; }
  setProcessing(true); setStatus('active'); startScramble(48);
  try {
    const { text, hint } = await decrypt(payload, pwd);
    stopScramble(); elResult.value = text;
    setStatus('ok'); updateResultMeta(text); renderQR(text);
    elHintDisplay.hidden  = !hint;
    if (hint) elHintDisplay.textContent = '💡 Indice : ' + hint;
    scheduleAutoWipe(); scrollToResult();
  } catch (e) { stopScramble(); flashError(e.message || 'Clé incorrecte ou données corrompues.'); }
  finally { setProcessing(false); }
});

// ── Copy ──────────────────────────────────────────────────────────────────────
elCopy.addEventListener('click', async () => {
  const txt = elResult.value;
  if (!txt || txt.startsWith('⚠')) return;
  try { await navigator.clipboard.writeText(txt); }
  catch { elResult.select(); document.execCommand('copy'); }
  window.inkrypt.showToast();
  if (elOptNoTrace?.checked) {
    setTimeout(async () => { try { await navigator.clipboard.writeText(''); } catch {} }, 15_000);
  }
});

// ── Download ──────────────────────────────────────────────────────────────────
elBtnDl.addEventListener('click', () => {
  const txt = elResult.value;
  if (!txt || txt.startsWith('⚠')) return;
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(new Blob([txt], { type: 'text/plain' })),
    download: 'inkrypt-' + Date.now() + '.inkrypt'
  });
  a.click(); URL.revokeObjectURL(a.href);
  window.inkrypt.showToast('⬇ Fichier téléchargé');
});

// ── Share link ────────────────────────────────────────────────────────────────
elBtnShare.addEventListener('click', async () => {
  const txt = elResult.value;
  if (!txt || txt.startsWith('⚠')) return;
  const url = location.origin + location.pathname + '#' + encodeURIComponent(txt);
  try { await navigator.clipboard.writeText(url); window.inkrypt.showToast('🔗 Lien copié'); }
  catch { window.inkrypt.showToast('🔗 Lien trop long'); }
});

// ── Clear ─────────────────────────────────────────────────────────────────────
elBtnClear.addEventListener('click', () => {
  elMsg.value = ''; elResult.value = ''; elSecret.value = '';
  elResultMeta.textContent = '';
  elStrength.style.width = '0%'; elStrLabel.textContent = '—';
  elStrLabel.style.color = 'var(--text-dim)';
  elQrWrap.hidden = true; elHintDisplay.hidden = true;
  setStatus(''); clearTimeout(autoWipeTimer);
  elMsg.style.height = ''; elResult.style.height = '';
});

// ── Auto-resize ───────────────────────────────────────────────────────────────
[elMsg, elResult].forEach(el => {
  el.addEventListener('input', () => {
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  });
});

// ── Paste detection ───────────────────────────────────────────────────────────
elMsg.addEventListener('paste', () => {
  setTimeout(() => {
    if (/^[A-Za-z0-9+/=§]{60,}$/.test(elMsg.value.trim()))
      window.inkrypt.showToast('📥 Payload détecté — renseignez la clé');
  }, 50);
});

// ── Import from URL hash ──────────────────────────────────────────────────────
(function () {
  const hash = location.hash.slice(1);
  if (!hash) return;
  try {
    elMsg.value = decodeURIComponent(hash);
    history.replaceState(null, '', location.pathname);
    window.inkrypt.showToast('📥 Payload importé depuis le lien');
  } catch {}
})();

// ── Mode fichier ──────────────────────────────────────────────────────────────
elToggleFile.addEventListener('click', () => {
  const open = elFilePanel.hidden;
  elFilePanel.hidden = !open;
  elFileBadge.textContent = open ? 'on' : 'off';
  elFileBadge.classList.toggle('on', open);
});

elDropZone.addEventListener('click', () => elFileInput.click());
elDropZone.addEventListener('dragover',  e => { e.preventDefault(); elDropZone.classList.add('dragover'); });
elDropZone.addEventListener('dragleave', () => elDropZone.classList.remove('dragover'));
elDropZone.addEventListener('drop', e => {
  e.preventDefault(); elDropZone.classList.remove('dragover'); setFile(e.dataTransfer.files[0]);
});
elFileInput.addEventListener('change', () => setFile(elFileInput.files[0]));
elBtnClearFile.addEventListener('click', () => {
  currentFile = null; elFileInfo.hidden = true; elDropZone.hidden = false; elFileInput.value = '';
});

function setFile(file) {
  if (!file) return;
  currentFile = file;
  elFileName.textContent = file.name + ' (' + (file.size / 1024).toFixed(1) + ' KB)';
  elFileInfo.hidden = false; elDropZone.hidden = true;
}

elBtnEncFile.addEventListener('click', async () => {
  if (!currentFile) { flashError('Aucun fichier sélectionné.'); return; }
  const pwd = elSecret.value;
  if (!pwd) { flashError('Clé secrète requise.'); return; }
  setProcessing(true); setStatus('active');
  try {
    const buf     = await currentFile.arrayBuffer();
    const enc     = new TextEncoder();
    const salt    = crypto.getRandomValues(new Uint8Array(16));
    const iv      = crypto.getRandomValues(new Uint8Array(12));
    const key     = await deriveKey(pwd, salt);
    const nameBuf = enc.encode(currentFile.name + '\x00');
    const combined = new Uint8Array(nameBuf.length + buf.byteLength);
    combined.set(nameBuf, 0); combined.set(new Uint8Array(buf), nameBuf.length);
    const ct  = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, combined);
    const out = new Uint8Array(28 + ct.byteLength);
    out.set(salt, 0); out.set(iv, 16); out.set(new Uint8Array(ct), 28);
    downloadBinary(out, currentFile.name + '.inkrypt');
    setStatus('ok'); window.inkrypt.showToast('✓ Fichier chiffré');
  } catch (e) { flashError('Erreur : ' + e.message); }
  finally { setProcessing(false); }
});

elBtnDecFile.addEventListener('click', async () => {
  if (!currentFile) { flashError('Aucun fichier sélectionné.'); return; }
  const pwd = elSecret.value;
  if (!pwd) { flashError('Clé secrète requise.'); return; }
  setProcessing(true); setStatus('active');
  try {
    const raw  = new Uint8Array(await currentFile.arrayBuffer());
    const key  = await deriveKey(pwd, raw.slice(0, 16));
    const pt   = new Uint8Array(await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: raw.slice(16, 28) }, key, raw.slice(28)
    ));
    const nameEnd  = pt.indexOf(0);
    const origName = nameEnd !== -1 ? new TextDecoder().decode(pt.slice(0, nameEnd)) : 'decrypted';
    downloadBinary(nameEnd !== -1 ? pt.slice(nameEnd + 1) : pt, origName);
    setStatus('ok'); window.inkrypt.showToast('✓ Fichier déchiffré');
  } catch { flashError('Échec — clé incorrecte ?'); }
  finally { setProcessing(false); }
});

function downloadBinary(data, filename) {
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(new Blob([data])), download: filename
  });
  a.click(); URL.revokeObjectURL(a.href);
}

// ══════════════════════════════════════════════
// MATRIX DIGITAL RAIN
// ══════════════════════════════════════════════
(function () {
  const canvas = document.getElementById('matrix-bg');
  const ctx    = canvas.getContext('2d');
  const COLOR  = '#00f5c4';
  const SZ     = 14;
  let cols, drops;

  function init() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    cols  = Math.floor(canvas.width / SZ);
    drops = Array.from({ length: cols }, () => Math.random() * -100 | 0);
  }

  function draw() {
    ctx.fillStyle = 'rgba(8, 11, 16, 0.18)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = COLOR;
    ctx.font      = SZ + 'px "Share Tech Mono", monospace';
    for (let i = 0; i < cols; i++) {
      ctx.fillText(Math.random() > .5 ? '1' : '0', i * SZ, drops[i] * SZ);
      if (drops[i] * SZ > canvas.height && Math.random() > .975) drops[i] = 0;
      drops[i]++;
    }
  }

  init();
  setInterval(draw, 50);
  window.addEventListener('resize', init);
})();