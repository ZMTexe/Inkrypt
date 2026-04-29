'use strict';

document.addEventListener('DOMContentLoaded', () => {

  Matrix.start();

  const LS = {
    get: (k, fb = null) => { try { return localStorage.getItem(k) ?? fb; } catch { return fb; } },
    set: (k, v)         => { try { localStorage.setItem(k, v); }           catch {} }
  };

  // Sidebar collapse (desktop)
  const nav = document.getElementById('mainNav');
  document.getElementById('navCollapse')?.addEventListener('click', () => {
    const c = nav?.classList.toggle('collapsed');
    document.body.classList.toggle('sb-collapsed', !!c);
    LS.set('inkrypt_sb', c ? '1' : '0');
  });
  if (LS.get('inkrypt_sb') === '1') { nav?.classList.add('collapsed'); document.body.classList.add('sb-collapsed'); }

  // Menu mobile
  function closeMobileNav() { document.body.classList.remove('mobile-nav-open'); }
  document.getElementById('mobileMenuBtn')?.addEventListener('click', () => document.body.classList.toggle('mobile-nav-open'));
  document.getElementById('mobileOverlay')?.addEventListener('click', closeMobileNav);
  window.addEventListener('resize', () => { if (window.innerWidth > 768) closeMobileNav(); });

  // Navigation
  window.basculer = function(page) {
    const crypt = document.getElementById('section-cryptage');
    const notes = document.getElementById('section-notes');
        const generator = document.getElementById('section-generator');
    if (crypt) crypt.style.display = page === 'cryptage' ? 'flex' : 'none';
    if (notes) notes.style.display = page === 'notes'    ? 'flex' : 'none';
        if (generator) generator.style.display = page === 'generator' ? 'flex' : 'none';
    document.querySelectorAll('.nav-btn[data-page]').forEach(b =>
      b.classList.toggle('active', b.dataset.page === page));
    LS.set('inkrypt_page', page);
    if (page === 'notes') Notes.renderTree();
    if (window.innerWidth <= 768) closeMobileNav();
  };

  // Toggle explorateur notes (mobile)
  document.getElementById('btnExplorerToggle')?.addEventListener('click', () =>
    document.getElementById('notesExplorer')?.classList.toggle('mobile-open'));

  Notes.init();

  // Chiffrement
  const elMsg = document.getElementById('message');
  const elSecret = document.getElementById('secret');
  const elResult = document.getElementById('result');
  const elFill = document.getElementById('strengthFill');
  const elDot = document.getElementById('statusDot');
  const elCard = document.getElementById('card');
  const elToast = document.getElementById('toast');

  function showDot(ok) {
    if (!elDot) return;
    elDot.className = 'status-dot ' + (ok ? 'ok' : 'err');
    setTimeout(() => { elDot.className = 'status-dot'; }, 3000);
  }

  function showToast() {
    elToast?.classList.add('show');
    setTimeout(() => elToast?.classList.remove('show'), 2000);
  }

  document.getElementById('togglePwd')?.addEventListener('click', () => {
    if (elSecret) elSecret.type = elSecret.type === 'password' ? 'text' : 'password';
  });

  elSecret?.addEventListener('input', () => {
    if (!elFill) return;
    const p = elSecret.value; let s = 0;
    if (p.length >= 8)  s++; if (p.length >= 12) s++;
    if (/[A-Z]/.test(p)) s++; if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    elFill.style.width = `${s * 20}%`;
    elFill.className = `strength-fill lvl-${s}`;
  });

  document.getElementById('btnEncrypt')?.addEventListener('click', async () => {
    const msg = elMsg?.value.trim(), pwd = elSecret?.value;
    if (!msg || !pwd) return;
    try { elCard?.classList.add('loading'); elResult.value = await Crypt.encrypt(msg, pwd); showDot(true); }
    catch { showDot(false); } finally { elCard?.classList.remove('loading'); }
  });

  document.getElementById('btnDecrypt')?.addEventListener('click', async () => {
    const msg = elMsg?.value.trim(), pwd = elSecret?.value;
    if (!msg || !pwd) return;
    try { elCard?.classList.add('loading'); elResult.value = await Crypt.decrypt(msg, pwd); showDot(true); }
    catch { elResult.value = 'Clé incorrecte ou données corrompues.'; showDot(false); }
    finally { elCard?.classList.remove('loading'); }
  });

  document.getElementById('btnCopy')?.addEventListener('click', () => {
    if (elResult?.value) navigator.clipboard.writeText(elResult.value).then(showToast);
  });

  basculer(LS.get('inkrypt_page', 'cryptage'));
});

// ===== PASSWORD GENERATOR =====
const genLength = document.getElementById('genLength');
const genLengthValue = document.getElementById('genLengthValue');
const genUppercase = document.getElementById('genUppercase');
const genLowercase = document.getElementById('genLowercase');
const genNumbers = document.getElementById('genNumbers');
const genSymbols = document.getElementById('genSymbols');
const genPassword = document.getElementById('genPassword');
const btnGenerate = document.getElementById('btnGenerate');
const btnCopyGen = document.getElementById('btnCopyGen');
const genStrengthFill = document.getElementById('genStrengthFill');
const genStrengthText = document.getElementById('genStrengthText');

const CHARSET = {
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lower: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

genLength?.addEventListener('input', () => {
  genLengthValue.textContent = genLength.value;
});

function generatePassword() {
  const length = parseInt(genLength.value);
  let charset = '';
  if (genUppercase.checked) charset += CHARSET.upper;
  if (genLowercase.checked) charset += CHARSET.lower;
  if (genNumbers.checked) charset += CHARSET.numbers;
  if (genSymbols.checked) charset += CHARSET.symbols;
  
  if (!charset) {
    genPassword.value = 'Sélectionnez au moins une option';
    return;
  }
  
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset[array[i] % charset.length];
  }
  
  genPassword.value = password;
  updateStrength(password);
}

function updateStrength(pwd) {
  let s = 0;
  if (pwd.length >= 12) s++;
  if (pwd.length >= 16) s++;
  if (/[a-z]/.test(pwd)) s++;
  if (/[A-Z]/.test(pwd)) s++;
  if (/[0-9]/.test(pwd)) s++;
  if (/[^a-zA-Z0-9]/.test(pwd)) s++;
  
  const pct = (s / 6) * 100;
  genStrengthFill.style.width = `${pct}%`;
  
  if (s <= 2) {
    genStrengthFill.style.background = 'var(--danger)';
    genStrengthText.textContent = 'FAIBLE';
  } else if (s <= 4) {
    genStrengthFill.style.background = 'var(--accent2)';
    genStrengthText.textContent = 'MOYEN';
  } else {
    genStrengthFill.style.background = 'var(--accent)';
    genStrengthText.textContent = 'FORT';
  }
}

btnGenerate?.addEventListener('click', generatePassword);

btnCopyGen?.addEventListener('click', () => {
  if (genPassword.value) {
    navigator.clipboard.writeText(genPassword.value).then(showToast);
  }
});

// ===== COPY WITH TIMEOUT =====
let clipboardTimeout = null;

document.getElementById('btnCopy')?.addEventListener('click', () => {
  const result = elResult?.value;
  if (!result) return;
  
  navigator.clipboard.writeText(result).then(() => {
    showToast();
    
    // Clear existing timeout
    if (clipboardTimeout) clearTimeout(clipboardTimeout);
    
    // Auto-clear clipboard after 30s
    clipboardTimeout = setTimeout(() => {
      navigator.clipboard.writeText('').catch(() => {});
    }, 30000);
  });
});