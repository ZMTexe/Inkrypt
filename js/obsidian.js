// JS/obsidian.js - Le gestionnaire de ton coffre-fort

let notes = JSON.parse(localStorage.getItem('inkrypt_notes')) || [];
let currentNoteId = null;

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    renderNoteList();
});

/**
 * Crée une nouvelle note vide et l'ajoute à la liste
 */
window.createNewNote = function() {
    const newNote = {
        id: Date.now(),
        title: "Nouvelle Note " + (notes.length + 1),
        content: ""
    };
    notes.unshift(newNote); // On l'ajoute en haut de la pile
    saveToDisk();
    loadNote(newNote.id);
    renderNoteList();
    console.log("Système : Nouvelle note générée.");
};

/**
 * Charge une note spécifique dans l'éditeur
 */
window.loadNote = function(id) {
    currentNoteId = id;
    const note = notes.find(n => n.id === id);
    if (note) {
        document.getElementById('note-title-input').value = note.title;
        document.getElementById('note-textarea').value = note.content;
        updatePreview();
        renderNoteList(); // Pour mettre à jour l'état "actif" visuellement
    }
};

/**
 * Sauvegarde automatique lors de la frappe
 */
window.autoSaveNote = function() {
    if (!currentNoteId) return;

    const titleInput = document.getElementById('note-title-input').value;
    const contentInput = document.getElementById('note-textarea').value;

    const index = notes.findIndex(n => n.id === currentNoteId);
    if (index !== -1) {
        notes[index].title = titleInput;
        notes[index].content = contentInput;
        saveToDisk();
        updatePreview();
        // On ne refresh pas toute la liste à chaque lettre pour éviter les lags
        // On met juste à jour le titre dans la sidebar
        const sidebarNote = document.querySelector(`.note-item[data-id="${currentNoteId}"] span`);
        if (sidebarNote) sidebarNote.innerText = titleInput || "Sans titre";
    }
};

/**
 * Met à jour le rendu Markdown à droite
 */
function updatePreview() {
    const content = document.getElementById('note-textarea').value;
    const previewArea = document.getElementById('markdown-preview');
    // Utilise la librairie "marked" injectée dans le HTML
    if (window.marked) {
        previewArea.innerHTML = marked.parse(content);
    } else {
        previewArea.innerText = content;
    }
}

/**
 * Affiche la liste des notes dans la sidebar
 */
function renderNoteList() {
    const listElement = document.getElementById('note-list');
    if (!listElement) return;

    listElement.innerHTML = "";
    notes.forEach(note => {
        const item = document.createElement('div');
        item.className = 'note-item' + (note.id === currentNoteId ? ' active' : '');
        item.setAttribute('data-id', note.id);
        item.innerHTML = `<span>${note.title || "Sans titre"}</span>`;
        item.onclick = () => loadNote(note.id);
        listElement.appendChild(item);
    });
}

function saveToDisk() {
    localStorage.setItem('inkrypt_notes', JSON.stringify(notes));
}

/**
 * Barre de recherche
 */
window.filterNotes = function() {
    const term = document.getElementById('note-search').value.toLowerCase();
    const items = document.querySelectorAll('.note-item');
    items.forEach(item => {
        const title = item.innerText.toLowerCase();
        item.style.display = title.includes(term) ? 'block' : 'none';
    });
};