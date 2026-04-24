document.addEventListener('DOMContentLoaded', () => { 
    console.log("INKRYPT ONLINE");
    showView('decrypt'); 
});

function showView(viewId) {
    // Cacher toutes les vues
    document.querySelectorAll('.view-content').forEach(v => v.style.display = 'none');
    document.querySelectorAll('.tab-link').forEach(t => t.classList.remove('active'));
    
    // Afficher la vue sélectionnée
    const target = document.getElementById('view-' + viewId);
    if (target) {
        target.style.display = 'flex';
        document.getElementById('tab-' + viewId).classList.add('active');
    }
}

function togglePass() {
    const secret = document.getElementById('secret');
    secret.type = secret.type === 'password' ? 'text' : 'password';
}

function copyResult() {
    const res = document.getElementById('result');
    if (res.value) {
        navigator.clipboard.writeText(res.value);
        alert("DONNÉES COPIÉES");
    }
}