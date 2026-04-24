let notes = JSON.parse(localStorage.getItem('inkrypt_notes')) || [];
let currentNoteId = null;

document.addEventListener('DOMContentLoaded', () => { renderNoteList(); });

window.createNewNote = function() {
    const newNote = { id: Date.now(), title: "Note " + (notes.length + 1), content: "" };
    notes.unshift(newNote);
    saveToDisk();
    loadNote(newNote.id);
};

window.deleteCurrentNote = function() {
    if (!currentNoteId) return;
    if (confirm("Supprimer cette note ?")) {
        notes = notes.filter(n => n.id !== currentNoteId);
        currentNoteId = null;
        document.getElementById('note-title-input').value = "";
        document.getElementById('note-textarea').value = "";
        document.getElementById('markdown-preview').innerHTML = "";
        saveToDisk();
        renderNoteList();
    }
};

window.loadNote = function(id) {
    currentNoteId = id;
    const note = notes.find(n => n.id === id);
    if (note) {
        document.getElementById('note-title-input').value = note.title;
        document.getElementById('note-textarea').value = note.content;
        updatePreview();
        renderNoteList();
    }
};

window.autoSaveNote = function() {
    if (!currentNoteId) return;
    const index = notes.findIndex(n => n.id === currentNoteId);
    if (index !== -1) {
        notes[index].title = document.getElementById('note-title-input').value;
        notes[index].content = document.getElementById('note-textarea').value;
        saveToDisk();
        updatePreview();
        renderNoteList();
    }
};

window.insertFormat = function(type) {
    const textarea = document.getElementById('note-textarea');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    let formatted = "";

    switch(type) {
        case 'bold': formatted = `**${selected}**`; break;
        case 'italic': formatted = `_${selected}_`; break;
        case 'h1': formatted = `\n# ${selected}`; break;
        case 'h2': formatted = `\n## ${selected}`; break;
        case 'list': formatted = `\n- ${selected}`; break;
        case 'code': formatted = `\`${selected}\``; break;
    }
    textarea.value = text.substring(0, start) + formatted + text.substring(end);
    autoSaveNote();
};

function updatePreview() {
    const content = document.getElementById('note-textarea').value;
    document.getElementById('markdown-preview').innerHTML = marked.parse(content);
}

function renderNoteList() {
    const list = document.getElementById('note-list');
    list.innerHTML = "";
    notes.forEach(note => {
        const item = document.createElement('div');
        item.className = 'note-item' + (note.id === currentNoteId ? ' active' : '');
        item.innerHTML = `<span>${note.title || "Sans titre"}</span>`;
        item.onclick = () => loadNote(note.id);
        list.appendChild(item);
    });
}

function saveToDisk() { localStorage.setItem('inkrypt_notes', JSON.stringify(notes)); }