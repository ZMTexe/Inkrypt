// js/app.js - Le cerveau qui gère l'affichage et les menus

/**
 * Change la vue entre le Terminal et l'Éditeur de notes
 * @param {string} viewId - L'id de la vue ('decrypt' ou 'notes')
 */
function showView(viewId) {
    // 1. On cache toutes les sections de contenu
    document.querySelectorAll('.view-content').forEach(view => {
        view.classList.remove('active');
    });

    // 2. On retire l'état "actif" de tous les boutons du menu
    document.querySelectorAll('.tab-link').forEach(tab => {
        tab.classList.remove('active');
    });

    // 3. On affiche la section demandée
    const targetView = document.getElementById('view-' + viewId);
    if (targetView) {
        targetView.classList.add('active');
    }

    // 4. On allume le bouton cliqué dans le menu
    const targetTab = document.getElementById('tab-' + viewId);
    if (targetTab) {
        targetTab.classList.add('active');
    }
}

/**
 * Affiche ou cache le mot de passe dans l'input
 */
function togglePass() {
    const input = document.getElementById('secret');
    if (input.type === 'password') {
        input.type = 'text';
    } else {
        input.type = 'password';
    }
}

/**
 * Copie le contenu du résultat dans le presse-papier
 */
function copyResult() {
    const copyText = document.getElementById('result');
    if (copyText.value === "") return; // Rien à copier
    
    copyText.select();
    copyText.setSelectionRange(0, 99999); // Pour mobile
    navigator.clipboard.writeText(copyText.value);
    
    alert("Données copiées !");
}