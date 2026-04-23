const canvas = document.getElementById('matrix-bg');
const ctx = canvas.getContext('2d');

// On ajuste le canvas à la taille de l'écran
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Caractères utilisés (Hacker style)
const characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ$+-*/=%<>!&";
const fontSize = 14;
const columns = canvas.width / fontSize;

// Tableau pour suivre la position verticale de chaque colonne
const drops = Array.from({ length: columns }).fill(1);

function draw() {
    // Fond noir semi-transparent pour l'effet de traînée
    ctx.fillStyle = "rgba(5, 7, 10, 0.15)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Couleur du texte (le vert néon d'Inkrypt)
    ctx.fillStyle = "#00f5c4";
    ctx.font = fontSize + "px 'Fira Code', monospace";

    for (let i = 0; i < drops.length; i++) {
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        // Si la goutte arrive en bas, on la remet en haut aléatoirement
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        drops[i]++;
    }
}

// Redimensionnement automatique si on change la taille de la fenêtre
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// Lancement de l'animation (20 images par seconde pour le look rétro)
setInterval(draw, 50);