'use strict';

const Notes = (() => {
  const KEY = 'inkrypt_notes';

  const store = {
    get()   { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } },
    save(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch {} }
  };

  let notes    = store.get();
  let activeId = null;

  const el = (id) => document.getElementById(id);

  function renderTree() {
    const tree = el('fileTree');
    if (!tree) return;
    tree.innerHTML = '';
    const folders = [...new Set(notes.map(n => n.folder || 'General'))];
    folders.forEach(folder => {
      const li = document.createElement('li');
      li.className = 'tree-folder';
      li.innerHTML = `<span class="folder-label">📁 ${folder}</span><ul></ul>`;
      const ul = li.querySelector('ul');
      notes.filter(n => (n.folder || 'General') === folder).forEach(note => {
        const noteEl = document.createElement('li');
        noteEl.className  = 'tree-note' + (note.id === activeId ? ' active' : '');
        noteEl.textContent = note.title || 'Sans titre';
        noteEl.addEventListener('click', () => openNote(note.id));
        ul.appendChild(noteEl);
      });
      tree.appendChild(li);
    });
  }

  function openNote(id) {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    activeId = id;
    el('noteTitle').value   = note.title   || '';
    el('noteContent').value = note.content || '';
    const s = el('noteStatus');
    if (s) s.textContent = '';
    renderTree();
  }

  function saveNote() {
    if (!activeId) return;
    const note = notes.find(n => n.id === activeId);
    if (!note) return;
    note.title     = el('noteTitle').value;
    note.content   = el('noteContent').value;
    note.updatedAt = new Date().toISOString();
    store.save(notes);
    const s = el('noteStatus');
    if (s) { s.textContent = 'Sauvegarde'; setTimeout(() => s.textContent = '', 2000); }
    renderTree();
  }

  function newNote(folder = 'General') {
    const note = {
      id: crypto.randomUUID(),
      title: 'Nouvelle note',
      content: '',
      folder,
      createdAt: new Date().toISOString()
    };
    notes.push(note);
    store.save(notes);
    openNote(note.id);
  }

  function newFolder() {
    const name = prompt('Nom du dossier :');
    if (name?.trim()) newNote(name.trim());
  }

  function deleteNote() {
    if (!activeId || !confirm('Supprimer cette note ?')) return;
    notes    = notes.filter(n => n.id !== activeId);
    activeId = null;
    el('noteTitle').value   = '';
    el('noteContent').value = '';
    store.save(notes);
    renderTree();
  }

  function init() {
    el('btnSaveNote')  ?.addEventListener('click', saveNote);
    el('btnDeleteNote')?.addEventListener('click', deleteNote);
    el('btnNewNote')   ?.addEventListener('click', () => newNote());
    el('btnNewFolder') ?.addEventListener('click', newFolder);
    renderTree();
  }

  return { init, renderTree };
})();