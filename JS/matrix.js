// js/app.js - Le chef d'orchestre
function showView(viewId) {
    // 1. Cacher toutes les vues
    document.querySelectorAll('.view-content').forEach(view => {
        view.classList.remove('active');
    });
    // 2. Désactiver tous les onglets
    document.querySelectorAll('.tab-link').forEach(tab => {
        tab.classList.remove('active');
    });

    // 3. Activer la vue et l'onglet demandés
    document.getElementById('view-' + viewId).classList.add('active');
    document.getElementById('tab-' + viewId).classList.add('active');
}

// Fonction pour afficher/cacher le mot de passe
function togglePass() {
    const input = document.getElementById('secret');
    input.type = input.type === 'password' ? 'text' : 'password';
}

// Fonction pour copier le résultat
function copyResult() {
    const copyText = document.getElementById('result');
    copyText.select();
    document.execCommand("copy");
    alert("Copié dans le presse-papier");
}