'use strict';

const Notes = (() => {
  const LS = {
    get: (k, fb = null) => { try { return localStorage.getItem(k) ?? fb; } catch { return fb; } },
    set: (k, v)         => { try { localStorage.setItem(k, v); }           catch {} }
  };

  function loadData() {
    try { return JSON.parse(LS.get('inkrypt_notes', 'null')) || { folders: [], loose: [] }; }
    catch { return { folders: [], loose: [] }; }
  }
  function saveData(d) { LS.set('inkrypt_notes', JSON.stringify(d)); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2,6); }
  function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  let data = loadData();
  let activeNoteId = null, activeFolderId = null;
  let elTree, elTitle, elContent, elStatus;

  function init() {
    elTree    = document.getElementById('fileTree');
    elTitle   = document.getElementById('noteTitle');
    elContent = document.getElementById('noteContent');
    elStatus  = document.getElementById('noteStatus');

    document.getElementById('btnNewFolder')?.addEventListener('click', createFolder);
    document.getElementById('btnNewNote')?.addEventListener('click', () => createNote(null));
    document.getElementById('btnSaveNote')?.addEventListener('click', saveNote);
    document.getElementById('btnDeleteNote')?.addEventListener('click', deleteNote);
    renderTree();
  }

  function renderTree() {
    if (!elTree) return;
    elTree.innerHTML = '';
    data.loose.forEach(n => elTree.appendChild(makeNoteItem(n, null)));
    data.folders.forEach(f => {
      const li = document.createElement('li');
      li.className = 'tree-folder';
      const header = document.createElement('div');
      header.className = 'tree-folder-header';
      header.innerHTML = `
        <span class="tree-folder-toggle">▸</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="13" height="13">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
        </svg>
        <span class="tree-folder-name">${esc(f.name)}</span>
        <button class="tree-btn-add" data-fid="${f.id}">+</button>
        <button class="tree-btn-del-folder" data-fid="${f.id}">✕</button>`;
      const ul = document.createElement('ul');
      ul.className = 'tree-folder-notes';
      f.notes.forEach(n => ul.appendChild(makeNoteItem(n, f.id)));
      header.querySelector('.tree-btn-add').addEventListener('click', e => { e.stopPropagation(); createNote(f.id); });
      header.querySelector('.tree-btn-del-folder').addEventListener('click', e => { e.stopPropagation(); deleteFolder(f.id); });
      header.addEventListener('click', () => {
        li.classList.toggle('open');
        header.querySelector('.tree-folder-toggle').textContent = li.classList.contains('open') ? '▾' : '▸';
      });
      if (f.notes.some(n => n.id === activeNoteId)) { li.classList.add('open'); header.querySelector('.tree-folder-toggle').textContent = '▾'; }
      li.appendChild(header); li.appendChild(ul); elTree.appendChild(li);
    });
  }

  function makeNoteItem(note, folderId) {
    const li = document.createElement('li');
    li.className = 'tree-note' + (note.id === activeNoteId ? ' active' : '');
    li.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="11" height="11"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><span>${esc(note.title||'Sans titre')}</span>`;
    li.addEventListener('click', () => openNote(note.id, folderId));
    return li;
  }

  function openNote(noteId, folderId) {
    activeNoteId = noteId; activeFolderId = folderId;
    const note = folderId
      ? data.folders.find(f=>f.id===folderId)?.notes.find(n=>n.id===noteId)
      : data.loose.find(n=>n.id===noteId);
    if (!note) return;
    if (elTitle)   elTitle.value   = note.title;
    if (elContent) elContent.value = note.content;
    setStatus(''); renderTree();
    document.getElementById('notesExplorer')?.classList.remove('mobile-open');
  }

  function createFolder() {
    const name = prompt('Nom du dossier :');
    if (!name?.trim()) return;
    data.folders.push({ id: uid(), name: name.trim(), notes: [] });
    saveData(data); renderTree();
  }

  function createNote(folderId) {
    const note = { id: uid(), title: 'Nouvelle note', content: '' };
    if (folderId) { const f = data.folders.find(f=>f.id===folderId); if(f) f.notes.push(note); }
    else data.loose.push(note);
    saveData(data); openNote(note.id, folderId);
  }

  function saveNote() {
    if (!activeNoteId) return;
    const note = activeFolderId
      ? data.folders.find(f=>f.id===activeFolderId)?.notes.find(n=>n.id===activeNoteId)
      : data.loose.find(n=>n.id===activeNoteId);
    if (!note) return;
    note.title   = elTitle?.value   || 'Sans titre';
    note.content = elContent?.value || '';
    saveData(data); setStatus('✓ Sauvegardé'); renderTree();
    setTimeout(() => setStatus(''), 2000);
  }

  function deleteNote() {
    if (!activeNoteId || !confirm('Supprimer cette note ?')) return;
    if (activeFolderId) { const f = data.folders.find(f=>f.id===activeFolderId); if(f) f.notes = f.notes.filter(n=>n.id!==activeNoteId); }
    else data.loose = data.loose.filter(n=>n.id!==activeNoteId);
    saveData(data); activeNoteId = null; activeFolderId = null;
    if (elTitle)   elTitle.value   = '';
    if (elContent) elContent.value = '';
    setStatus(''); renderTree();
  }

  function deleteFolder(folderId) {
    if (!confirm('Supprimer ce dossier et toutes ses notes ?')) return;
    data.folders = data.folders.filter(f=>f.id!==folderId);
    if (activeFolderId === folderId) { activeNoteId = null; activeFolderId = null; if(elTitle) elTitle.value=''; if(elContent) elContent.value=''; }
    saveData(data); renderTree();
  }

  function setStatus(msg) { if (elStatus) elStatus.textContent = msg; }

  return { init, renderTree };
})();