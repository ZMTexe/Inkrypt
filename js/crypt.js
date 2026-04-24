window.handleEncrypt = function() {
    const message = document.getElementById('message').value;
    const secret = document.getElementById('secret').value;
    const resultArea = document.getElementById('result');

    if (!message || secret.length < 8) {
        alert("Erreur: Message vide ou clé trop courte (min 8).");
        return;
    }

    let encrypted = "";
    for (let i = 0; i < message.length; i++) {
        const charCode = message.charCodeAt(i) ^ secret.charCodeAt(i % secret.length);
        encrypted += String.fromCharCode(charCode);
    }
    resultArea.value = btoa(unescape(encodeURIComponent(encrypted)));
};

window.handleDecrypt = function() {
    const message = document.getElementById('message').value;
    const secret = document.getElementById('secret').value;
    const resultArea = document.getElementById('result');

    try {
        const encrypted = decodeURIComponent(escape(atob(message)));
        let decrypted = "";
        for (let i = 0; i < encrypted.length; i++) {
            const charCode = encrypted.charCodeAt(i) ^ secret.charCodeAt(i % secret.length);
            decrypted += String.fromCharCode(charCode);
        }
        resultArea.value = decrypted;
    } catch (e) {
        alert("Échec du déchiffrement : Hash ou clé invalide.");
    }
};