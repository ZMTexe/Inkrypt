'use strict';

document.addEventListener('DOMContentLoaded', () => {

  // ── Matrix ──
  Matrix.start();

  // ── localStorage securise ──
  const LS = {
    get: (k, fb = null) => { try { return localStorage.getItem(k) ?? fb; } catch { return fb; } },
    set: (k, v)         => { try { localStorage.setItem(k, v); } catch {} }
  };

  // ── Sidebar collapse ──
  const nav         = document.getElementById('mainNav');
  const btnCollapse = document.getElementById('navCollapse');
  if (LS.get('inkrypt_sb') === '1') {
    nav?.classList.add('collapsed');
    document.body.classList.add('sb-collapsed');
  }
  btnCollapse?.addEventListener('click', () => {
    const c = nav?.classList.toggle('collapsed');
    document.body.classList.toggle('sb-collapsed', !!c);
    LS.set('inkrypt_sb', c ? '1' : '0');
  });

  // ── Navigation entre pages ──
  window.basculer = function(page) {
    const crypt = document.getElementById('section-cryptage');
    const notes = document.getElementById('section-notes');
    if (crypt) crypt.style.display = page === 'cryptage' ? 'flex' : 'none';
    if (notes) notes.style.display = page === 'notes'    ? 'flex' : 'none';
    document.querySelectorAll('.nav-btn[data-page]').forEach(b =>
      b.classList.toggle('active', b.dataset.page === page)
    );
    LS.set('inkrypt_page', page);
    if (page === 'notes') Notes.renderTree();
  };

  // ── Init Notes ──
  Notes.init();

  // ── Elements chiffrement ──
  const elMsg    = document.getElementById('message');
  const elSecret = document.getElementById('secret');
  const elResult = document.getElementById('result');
  const elFill   = document.getElementById('strengthFill');
  const elDot    = document.getElementById('statusDot');
  const elCard   = document.getElementById('card');
  const elToast  = document.getElementById('toast');

  function showDot(ok) {
    if (!elDot) return;
    elDot.className = 'status-dot ' + (ok ? 'ok' : 'err');
    setTimeout(() => elDot.className = 'status-dot', 3000);
  }

  function showToast() {
    elToast?.classList.add('show');
    setTimeout(() => elToast?.classList.remove('show'), 2000);
  }

  // Toggle mot de passe
  document.getElementById('togglePwd')?.addEventListener('click', () => {
    elSecret.type = elSecret.type === 'password' ? 'text' : 'password';
  });

  // Barre de force du mot de passe
  elSecret?.addEventListener('input', () => {
    if (!elFill) return;
    const p = elSecret.value;
    let s = 0;
    if (p.length >= 8)          s++;
    if (p.length >= 12)         s++;
    if (/[A-Z]/.test(p))        s++;
    if (/[0-9]/.test(p))        s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    elFill.style.width = `${s * 20}%`;
    elFill.className   = `strength-fill lvl-${s}`;
  });

  // Chiffrer
  document.getElementById('btnEncrypt')?.addEventListener('click', async () => {
    const msg = elMsg?.value.trim();
    const pwd = elSecret?.value;
    if (!msg || !pwd) return;
    try {
      elCard?.classList.add('loading');
      elResult.value = await Crypt.encrypt(msg, pwd);
      showDot(true);
    } catch { showDot(false); }
    finally { elCard?.classList.remove('loading'); }
  });

  // Dechiffrer
  document.getElementById('btnDecrypt')?.addEventListener('click', async () => {
    const msg = elMsg?.value.trim();
    const pwd = elSecret?.value;
    if (!msg || !pwd) return;
    try {
      elCard?.classList.add('loading');
      elResult.value = await Crypt.decrypt(msg, pwd);
      showDot(true);
    } catch {
      elResult.value = 'Cle incorrecte ou donnees corrompues.';
      showDot(false);
    }
    finally { elCard?.classList.remove('loading'); }
  });

  // Copier
  document.getElementById('btnCopy')?.addEventListener('click', () => {
    if (elResult?.value) navigator.clipboard.writeText(elResult.value).then(showToast);
  });

  // ── Page par defaut ──
  basculer(LS.get('inkrypt_page', 'cryptage'));

});