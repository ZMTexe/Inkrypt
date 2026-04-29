'use strict';

// Password Generator Module
const Generator = (() => {
  // Character sets
  const CHAR_SETS = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
  };

  // DOM elements
  let elements = {};

  // Initialize the generator
  function init() {
    // Get DOM elements
    elements = {
      password: document.getElementById('genPassword'),
      length: document.getElementById('genLength'),
      lengthVal: document.getElementById('genLengthVal'),
      uppercase: document.getElementById('genUppercase'),
      lowercase: document.getElementById('genLowercase'),
      numbers: document.getElementById('genNumbers'),
      symbols: document.getElementById('genSymbols'),
      btnGenerate: document.getElementById('btnGenerate'),
      btnCopy: document.getElementById('btnCopyGen'),
      strengthBar: document.getElementById('genStrengthBar'),
      strengthText: document.getElementById('genStrengthText')
    };

    // Add event listeners
    if (elements.length) {
      elements.length.addEventListener('input', updateLengthDisplay);
    }
    if (elements.btnGenerate) {
      elements.btnGenerate.addEventListener('click', generatePassword);
    }
    if (elements.btnCopy) {
      elements.btnCopy.addEventListener('click', copyPassword);
    }

    // Generate initial password
    generatePassword();
  }

  // Update length display
  function updateLengthDisplay() {
    if (elements.lengthVal) {
      elements.lengthVal.textContent = elements.length.value;
    }
  }

  // Generate password
  function generatePassword() {
    const length = parseInt(elements.length.value);
    let charset = '';

    // Build charset based on selected options
    if (elements.uppercase.checked) charset += CHAR_SETS.uppercase;
    if (elements.lowercase.checked) charset += CHAR_SETS.lowercase;
    if (elements.numbers.checked) charset += CHAR_SETS.numbers;
    if (elements.symbols.checked) charset += CHAR_SETS.symbols;

    // If no option selected, use all
    if (charset === '') {
      charset = CHAR_SETS.uppercase + CHAR_SETS.lowercase + CHAR_SETS.numbers + CHAR_SETS.symbols;
    }

    // Generate password
    let password = '';
    const charsetLength = charset.length;
    const randomValues = new Uint32Array(length);
    crypto.getRandomValues(randomValues);

    for (let i = 0; i < length; i++) {
      password += charset[randomValues[i] % charsetLength];
    }

    // Update UI
    elements.password.value = password;
    updateStrength(password, length);
  }

  // Calculate and update password strength
  function updateStrength(password, length) {
    let strength = 0;
    let strengthText = '';
    let strengthColor = '';

    // Calculate strength score
    if (elements.uppercase.checked) strength += 26;
    if (elements.lowercase.checked) strength += 26;
    if (elements.numbers.checked) strength += 10;
    if (elements.symbols.checked) strength += 32;

    const entropy = Math.log2(Math.pow(strength, length));

    // Determine strength level
    if (entropy < 40) {
      strengthText = 'Faible';
      strengthColor = '#ef4444';
    } else if (entropy < 60) {
      strengthText = 'Moyenne';
      strengthColor = '#f59e0b';
    } else if (entropy < 80) {
      strengthText = 'Bonne';
      strengthColor = '#10b981';
    } else {
      strengthText = 'Excellente';
      strengthColor = '#06b6d4';
    }

    // Update UI
    if (elements.strengthText) {
      elements.strengthText.textContent = strengthText;
      elements.strengthText.style.color = strengthColor;
    }
  }

  // Copy password to clipboard
  function copyPassword() {
    const password = elements.password.value;
    if (!password || password === 'Cliquez sur Générer...') return;

    navigator.clipboard.writeText(password).then(() => {
      // Show toast notification
      showToast('Mot de passe copié !');
    }).catch(err => {
      console.error('Erreur lors de la copie:', err);
    });
  }

  // Show toast notification
  function showToast(message) {
    // Use existing toast if available, or create simple feedback
    const toast = document.getElementById('toast');
    if (toast) {
      const icon = toast.querySelector('.toast-icon');
      const text = toast.querySelector('.toast-text');
      if (icon) icon.innerHTML = '✓';
      if (text) text.textContent = message;
      toast.style.display = 'flex';
      setTimeout(() => { toast.style.display = 'none'; }, 2000);
    }
  }

  // Public API
  return {
    init
  };
})();

// Auto-initialize when on generator page
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('section-generator')) {
      Generator.init();
    }
  });
} else {
  if (document.getElementById('section-generator')) {
    Generator.init();
  }
}