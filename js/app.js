document.addEventListener('DOMContentLoaded', () => { showView('decrypt'); });

function showView(viewId) {
    document.querySelectorAll('.view-content').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.tab-link').forEach(t => t.classList.remove('active'));
    
    const target = document.getElementById('view-' + viewId);
    if (target) target.classList.add('active');
    document.getElementById('tab-' + viewId).classList.add('active');
}

function togglePass() {
    const secret = document.getElementById('secret');
    secret.type = secret.type === 'password' ? 'text' : 'password';
}

function copyResult() {
    const res = document.getElementById('result');
    navigator.clipboard.writeText(res.value);
    alert("Copié !");
}