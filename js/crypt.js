'use strict';

const Crypt = (() => {
  const ENC = new TextEncoder();
  const DEC = new TextDecoder();

  async function deriveKey(password, salt) {
    const keyMaterial = await crypto.subtle.importKey(
      'raw', ENC.encode(password), 'PBKDF2', false, ['deriveKey']
    );
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: 200000, hash: 'SHA-256' },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false, ['encrypt', 'decrypt']
    );
  }

  async function encrypt(message, password) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv   = crypto.getRandomValues(new Uint8Array(12));
    const key  = await deriveKey(password, salt);
    const enc  = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, ENC.encode(message));
    const buf  = new Uint8Array(16 + 12 + enc.byteLength);
    buf.set(salt, 0); buf.set(iv, 16); buf.set(new Uint8Array(enc), 28);
    return btoa(String.fromCharCode(...buf));
  }

  async function decrypt(ciphertext, password) {
    const buf  = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));
    const key  = await deriveKey(password, buf.slice(0, 16));
    const dec  = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: buf.slice(16, 28) }, key, buf.slice(28));
    return DEC.decode(dec);
  }

  return { encrypt, decrypt };
})();