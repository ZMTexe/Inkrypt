// JS/obsidian.js - Gestion du coffre-fort de notes

let notes = JSON.parse(localStorage.getItem('inkrypt_notes')) || [];
let currentNoteId = null;

// 1. Initialisation au chargement
document.addEventListener('DOMContentLoaded', () => {
    renderNoteList();
});

// 2. Créer une nouvelle note
window.createNewNote = function() {
    const newNote = {
        id: Date.now(),
        title: "Nouvelle Note " + (notes.length + 1),
        content: ""
    };
    notes.unshift(newNote); // Ajoute au début de la liste
    saveAndRender();
    loadNote(newNote.id);
    showView('notes'); // Bascule automatiquement sur l'éditeur
};

// 3. Charger une note dans l'éditeur
function loadNote(id) {
    currentNoteId = id;
    const note = notes.find(n => n.id === id);
    if (note) {
        document.getElementById('note-title-input').value = note.title;
        document.getElementById('note-textarea').value = note.content;
        updatePreview();
    }
}

// 4. Sauvegarde automatique (appelée par oninput dans le HTML)
window.autoSaveNote = function() {
    if (!currentNoteId) return;

    const title = document.getElementById('note-title-input').value;
    const content = document.getElementById('note-textarea').value;

    const noteIndex = notes.findIndex(n => n.id === currentNoteId);
    if (noteIndex !== -1) {
        notes[noteIndex].title = title;
        notes[noteIndex].content = content;
        
        localStorage.setItem('inkrypt_notes', JSON.stringify(notes));
        renderNoteList();
        updatePreview();
    }
};

// 5. Mise à jour de la prévisualisation Markdown
function updatePreview() {
    const content = document.getElementById('note-textarea').value;
    // On utilise la bibliothèque "marked" chargée dans le HTML
    document.getElementById('markdown-preview').innerHTML = marked.parse(content);
}

// 6. Afficher la liste des notes dans la sidebar
function renderNoteList() {
    const listElement = document.getElementById('note-list');
    listElement.innerHTML = "";

    notes.forEach(note => {
        const item = document.createElement('div');
        item.className = 'note-item' + (note.id === currentNoteId ? ' active' : '');
        item.innerHTML = `<span>${note.title || "Sans titre"}</span>`;
        item.onclick = () => loadNote(note.id);
        listElement.appendChild(item);
    });
}

function saveAndRender() {
    localStorage.setItem('inkrypt_notes', JSON.stringify(notes));
    renderNoteList();
}

// 7. Recherche (Filtrage)
window.filterNotes = function() {
    const term = document.getElementById('note-search').value.toLowerCase();
    const filtered = notes.filter(n => n.title.toLowerCase().includes(term));
    // Optionnel : tu peux adapter renderNoteList pour accepter un tableau filtré
};