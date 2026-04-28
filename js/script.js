/* ═══════════════════════════════════════════
   INKRYPT — script.js
   Chiffrement AES-256-GCM via WebCrypto API
   ═══════════════════════════════════════════ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

  // ── DOM refs ────────────────────────────────────────────────────────────────
  const elMsg       = document.getElementById('message');
  const elSecret    = document.getElementById('secret');
  const elResult    = document.getElementById('result');
  const elEncrypt   = document.getElementById('btnEncrypt');
  const elDecrypt   = document.getElementById('btnDecrypt');
  const elCopy      = document.getElementById('btnCopy');
  const elTogglePwd = document.getElementById('togglePwd');
  const elStrength  = document.getElementById('strengthFill');
  const elStatus    = document.getElementById('statusDot');
  const elCard      = document.getElementById('card');
  const elToast     = document.getElementById('toast');
  const nav         = document.getElementById('mainNav');
  const btnCollapse = document.getElementById('navCollapse');

  // ══════════════════════════════════════════
  // MATRIX DIGITAL RAIN
  // ══════════════════════════════════════════
  const canvas = document.getElementById('matrix-bg');
  const ctx    = canvas.getContext('2d');
  const SZ     = 14;
  let cols, drops;

  function matrixInit() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    cols  = Math.floor(canvas.width / SZ);
    drops = Array.from({ length: cols }, () => Math.random() * -100 | 0);
  }

  function matrixDraw() {
    ctx.fillStyle = 'rgba(8,11,16,0.18)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00f5c4';
    ctx.font      = SZ + 'px "Share Tech Mono", monospace';
    for (let i = 0; i < cols; i++) {
      ctx.fillText(Math.random() > .5 ? '1' : '0', i * SZ, drops[i] * SZ);
      if (drops[i] * SZ > canvas.height && Math.random() > .975) drops[i] = 0;
      drops[i]++;
    }
  }

  matrixInit();
  setInterval(matrixDraw, 50);
  window.addEventListener('resize', matrixInit);

  // ══════════════════════════════════════════
  // SIDEBAR COLLAPSE
  // ══════════════════════════════════════════
  if (localStorage.getItem('inkrypt_sb') === '1') {
    nav.classList.add('collapsed');
    document.body.classList.add('sb-collapsed');
  }

  btnCollapse.addEventListener('click', () => {
    const c = nav.classList.toggle('collapsed');
    document.body.classList.toggle('sb-collapsed', c);
    localStorage.setItem('inkrypt_sb', c ? '1' : '0');
  });

  // ══════════════════════════════════════════
  // ROUTER SPA
  // ══════════════════════════════════════════
  window.basculer = function(page) {
    document.getElementById('section-cryptage').style.display = page === 'cryptage' ? 'flex' : 'none';
    document.getElementById('section-notes').style.display    = page === 'notes'    ? 'flex' : 'none';
    document.querySelectorAll('.nav-btn[data-page]').forEach(b =>
      b.classList.toggle('active', b.dataset.page === page)
    );
    localStorage.setItem('inkrypt_page', page);
    if (page === 'notes') renderTree();
  };

  // Restaurer dernier onglet
  basculer(localStorage.getItem('inkrypt_page') || 'cryptage');

  // ══════════════════════════════════════════
  // SCRAMBLE EFFECT
  // ══════════════════════════════════════════
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

  // ══════════════════════════════════════════
  // CRYPTO — PBKDF2 + AES-GCM
  // ══════════════════════════════════════════
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

  async function encrypt(plaintext, password) {
    const enc  = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv   = crypto.getRandomValues(new Uint8Array(12));
    const key  = await deriveKey(password, salt);
    const ct   = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(plaintext));
    const buf  = new Uint8Array(16 + 12 + ct.byteLength);
    buf.set(salt, 0); buf.set(iv, 16); buf.set(new Uint8Array(ct), 28);
    return btoa(String.fromCharCode(...buf));
  }

  async function decrypt(payload, password) {
    const raw = Uint8Array.from(atob(payload), c => c.charCodeAt(0));
    const key = await deriveKey(password, raw.slice(0, 16));
    const pt  = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: raw.slice(16, 28) }, key, raw.slice(28)
    );
    return new TextDecoder().decode(pt);
  }

  // ══════════════════════════════════════════
  // UI HELPERS
  // ══════════════════════════════════════════
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

  let toastTimer;
  function showToast(msg) {
    elToast.innerHTML = msg
      ? `<span class="toast-icon">${msg.split(' ')[0]}</span> ${msg.split(' ').slice(1).join(' ')}`
      : `<span class="toast-icon">✓</span> Copié dans le presse-papiers`;
    elToast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => elToast.classList.remove('show'), 2200);
  }

  // ══════════════════════════════════════════
  // FORCE MOT DE PASSE
  // ══════════════════════════════════════════
  elSecret.addEventListener('input', () => {
    const v = elSecret.value;
    let score = 0;
    if (v.length >= 8)          score += 25;
    if (v.length >= 14)         score += 15;
    if (/[A-Z]/.test(v))        score += 15;
    if (/[0-9]/.test(v))        score += 20;
    if (/[^A-Za-z0-9]/.test(v)) score += 25;
    const pct = Math.min(score, 100);
    elStrength.style.width      = pct + '%';
    elStrength.style.background = pct < 35 ? 'var(--danger)' : pct < 65 ? '#f5a623' : 'var(--accent)';
  });

  // ── Toggle visibilité mot de passe ────────────────────────────────────────
  elTogglePwd.addEventListener('click', () => {
    const show = elSecret.type === 'password';
    elSecret.type = show ? 'text' : 'password';
    elTogglePwd.style.color = show ? 'var(--accent)' : '';
  });

  // ── Chiffrer ─────────────────────────────────────────────────────────────
  elEncrypt.addEventListener('click', async () => {
    const msg = elMsg.value.trim();
    const pwd = elSecret.value;
    if (!msg) { flashError('Message vide.'); return; }
    if (!pwd) { flashError('Clé secrète requise.'); return; }
    setProcessing(true); setStatus('active'); startScramble(64);
    try {
      elResult.value = await encrypt(msg, pwd);
      stopScramble(); setStatus('ok');
    } catch (e) {
      stopScramble(); flashError('Erreur : ' + e.message);
    } finally {
      setProcessing(false);
    }
  });

  // ── Déchiffrer ───────────────────────────────────────────────────────────
  elDecrypt.addEventListener('click', async () => {
    const payload = elMsg.value.trim();
    const pwd     = elSecret.value;
    if (!payload) { flashError('Collez le message chiffré dans le champ source.'); return; }
    if (!pwd)     { flashError('Clé secrète requise.'); return; }
    setProcessing(true); setStatus('active'); startScramble(48);
    try {
      elResult.value = await decrypt(payload, pwd);
      stopScramble(); setStatus('ok');
    } catch {
      stopScramble(); flashError('Déchiffrement échoué — clé incorrecte ou données corrompues.');
    } finally {
      setProcessing(false);
    }
  });

  // ── Copier ───────────────────────────────────────────────────────────────
  elCopy.addEventListener('click', async () => {
    const txt = elResult.value;
    if (!txt || txt.startsWith('⚠')) return;
    try { await navigator.clipboard.writeText(txt); }
    catch { elResult.select(); document.execCommand('copy'); }
    showToast();
  });

  // ══════════════════════════════════════════
  // NOTES — localStorage
  // ══════════════════════════════════════════
  function loadData()  { return JSON.parse(localStorage.getItem('inkrypt_notes') || '{"folders":[],"notes":[]}'); }
  function saveData(d) { localStorage.setItem('inkrypt_notes', JSON.stringify(d)); }
  function uid()       { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function esc(s)      { return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function fmtDate(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleDateString('fr-CH', { day: '2-digit', month: '2-digit' })
      + ' ' + d.toLocaleTimeString('fr-CH', { hour: '2-digit', minute: '2-digit' });
  }

  let activeNoteId = null;

  function renderTree() {
    const data = loadData();
    const tree = document.getElementById('fileTree');
    if (!tree) return;
    tree.innerHTML = '';
    data.notes.filter(n => !n.folderId).forEach(n => tree.appendChild(makeNoteEl(n)));
    data.folders.forEach(f => {
      const li = document.createElement('li');
      li.className = 'tree-folder';
      li.innerHTML = `<span>📁</span>
        <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(f.name)}</span>
        <button class="tree-del">✕</button>`;
      li.querySelector('.tree-del').addEventListener('click', e => {
        e.stopPropagation();
        if (!confirm('Supprimer ce dossier et ses notes ?')) return;
        const d = loadData();
        d.folders = d.folders.filter(x => x.id !== f.id);
        d.notes   = d.notes.filter(x => x.folderId !== f.id);
        saveData(d); renderTree();
      });
      tree.appendChild(li);
      data.notes.filter(n => n.folderId === f.id).forEach(n => tree.appendChild(makeNoteEl(n)));
    });
  }

  function makeNoteEl(note) {
    const li = document.createElement('li');
    li.className = 'tree-note' + (note.id === activeNoteId ? ' active' : '');
    li.innerHTML = `<span>📄</span>
      <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(note.title || '(sans titre)')}</span>
      <button class="tree-del">✕</button>`;
    li.addEventListener('click', () => openNote(note.id));
    li.querySelector('.tree-del').addEventListener('click', e => {
      e.stopPropagation();
      if (!confirm('Supprimer cette note ?')) return;
      const d = loadData();
      d.notes = d.notes.filter(x => x.id !== note.id);
      saveData(d);
      if (activeNoteId === note.id) { activeNoteId = null; clearEditor(); }
      renderTree();
    });
    return li;
  }

  function openNote(id) {
    const note = loadData().notes.find(n => n.id === id);
    if (!note) return;
    activeNoteId = id;
    document.getElementById('noteTitle').value   = note.title   || '';
    document.getElementById('noteContent').value = note.content || '';
    document.getElementById('noteStatus').textContent = fmtDate(note.updatedAt);
    renderTree();
  }

  function clearEditor() {
    document.getElementById('noteTitle').value   = '';
    document.getElementById('noteContent').value = '';
    document.getElementById('noteStatus').textContent = '';
  }

  function saveCurrentNote() {
    if (!activeNoteId) return;
    const d    = loadData();
    const note = d.notes.find(n => n.id === activeNoteId);
    if (!note) return;
    note.title     = document.getElementById('noteTitle').value.trim() || '(sans titre)';
    note.content   = document.getElementById('noteContent').value;
    note.updatedAt = Date.now();
    saveData(d);
    document.getElementById('noteStatus').textContent = '✓ ' + fmtDate(note.updatedAt);
    renderTree();
  }

  document.getElementById('btnNewNote').addEventListener('click', () => {
    const d    = loadData();
    const note = { id: uid(), folderId: null, title: 'Nouvelle note', content: '', createdAt: Date.now(), updatedAt: Date.now() };
    d.notes.push(note); saveData(d);
    openNote(note.id);
    setTimeout(() => { const t = document.getElementById('noteTitle'); t.focus(); t.select(); }, 50);
  });

  document.getElementById('btnNewFolder').addEventListener('click', () => {
    const name = prompt('Nom du dossier :');
    if (!name?.trim()) return;
    const d = loadData();
    d.folders.push({ id: uid(), name: name.trim() });
    saveData(d); renderTree();
  });

  document.getElementById('btnSaveNote').addEventListener('click', saveCurrentNote);

  document.getElementById('noteContent').addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveCurrentNote(); }
  });

  document.getElementById('btnDeleteNote').addEventListener('click', () => {
    if (!activeNoteId || !confirm('Supprimer cette note ?')) return;
    const d = loadData();
    d.notes = d.notes.filter(n => n.id !== activeNoteId);
    saveData(d); activeNoteId = null; clearEditor(); renderTree();
  });

}); // fin DOMContentLoaded