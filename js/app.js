document.addEventListener('DOMContentLoaded', () => {
    console.log("INKRYPT OS initialized.");
    showView('decrypt'); // Vue par défaut
});

function showView(viewId) {
    // 1. Cacher les vues
    const views = document.querySelectorAll('.view-content');
    views.forEach(v => v.classList.remove('active'));

    // 2. Éteindre les onglets
    const tabs = document.querySelectorAll('.tab-link');
    tabs.forEach(t => t.classList.remove('active'));

    // 3. Activer la cible
    const targetView = document.getElementById('view-' + viewId);
    const targetTab = document.getElementById('tab-' + viewId);

    if (targetView && targetTab) {
        targetView.classList.add('active');
        targetTab.classList.add('active');
        console.log("Switching to: " + viewId);
    }
}

function togglePass() {
    const secret = document.getElementById('secret');
    secret.type = (secret.type === 'password') ? 'text' : 'password';
}

function copyResult() {
    const result = document.getElementById('result');
    if (result.value) {
        navigator.clipboard.writeText(result.value);
        alert("Copié !");
    }
}

// Sécurité pour éviter les erreurs si les autres fichiers sont vides
if (typeof createNewNote !== 'function') window.createNewNote = () => {};
if (typeof autoSaveNote !== 'function') window.autoSaveNote = () => {};
if (typeof handleEncrypt !== 'function') window.handleEncrypt = () => {};
if (typeof handleDecrypt !== 'function') window.handleDecrypt = () => {};