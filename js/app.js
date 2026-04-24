// js/app.js

document.addEventListener('DOMContentLoaded', () => { 
    console.log("INKRYPT : Prêt (Dossier 'js' détecté)");
    showView('decrypt'); 
});

window.showView = function(viewId) {
    console.log("Switching to: " + viewId);
    
    // 1. Cacher toutes les vues proprement
    document.querySelectorAll('.view-content').forEach(v => {
        v.classList.remove('active');
        v.style.display = 'none';
    });

    // 2. Éteindre les onglets
    document.querySelectorAll('.tab-link').forEach(t => t.classList.remove('active'));

    // 3. Activer la cible
    const targetView = document.getElementById('view-' + viewId);
    const targetTab = document.getElementById('tab-' + viewId);

    if (targetView && targetTab) {
        targetView.classList.add('active');
        targetView.style.display = 'flex'; // On force le flex pour le layout
        targetTab.classList.add('active');
    }
};

// Fonctions utilitaires partagées
window.togglePass = function() {
    const s = document.getElementById('secret');
    s.type = s.type === 'password' ? 'text' : 'password';
};

window.copyResult = function() {
    const res = document.getElementById('result');
    if (res.value) {
        navigator.clipboard.writeText(res.value);
        alert("SYSTÈME : Données copiées.");
    }
};