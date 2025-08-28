/**
 * Notes Manager Plugin for SlowGuardian v9
 * Provides note-taking functionality
 */

class NotesManagerPlugin {
  constructor() {
    this.name = 'Notes Manager';
    this.version = '1.0.0';
    this.notes = JSON.parse(getCookie('user-notes') || localStorage.getItem('user-notes') || '[]');
    this.isOpen = false;
    this.notePanel = null;
  }

  init() {
    console.log('📝 Notes Manager Plugin initialized');
    this.createNotesPanel();
    this.registerHooks();
  }

  enable() {
    console.log('📝 Notes Manager Plugin enabled');
    if (this.notePanel) {
      this.notePanel.style.display = 'block';
    }
  }

  disable() {
    console.log('📝 Notes Manager Plugin disabled');
    if (this.notePanel) {
      this.notePanel.style.display = 'none';
    }
    this.isOpen = false;
  }

  registerHooks() {
    if (window.pluginSystem) {
      window.pluginSystem.addHook('page_load', (data) => {
        this.onPageLoad(data);
      }, 'notes-manager');
    }
  }

  onPageLoad(data) {
    // Auto-save current note when navigating
    this.autoSave();
  }

  createNotesPanel() {
    const style = document.createElement('style');
    style.textContent = `
      .notes-panel {
        position: fixed;
        right: -320px;
        top: 20%;
        width: 300px;
        height: 400px;
        background: rgba(26, 26, 46, 0.98);
        backdrop-filter: blur(15px);
        border: 1px solid var(--border-primary);
        border-radius: 12px 0 0 12px;
        z-index: 9998;
        transition: right 0.3s ease;
        box-shadow: -4px 0 12px rgba(0,0,0,0.3);
        display: flex;
        flex-direction: column;
      }
      
      .notes-panel.open {
        right: 0;
      }
      
      .notes-header {
        padding: 15px;
        border-bottom: 1px solid var(--border-secondary);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .notes-content {
        flex: 1;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
      
      .notes-tabs {
        display: flex;
        border-bottom: 1px solid var(--border-secondary);
      }
      
      .notes-tab {
        flex: 1;
        padding: 8px 12px;
        cursor: pointer;
        border: none;
        background: transparent;
        color: var(--text-secondary);
        font-size: 12px;
      }
      
      .notes-tab.active {
        background: var(--accent-primary);
        color: white;
      }
      
      .notes-list {
        flex: 1;
        overflow-y: auto;
        padding: 10px;
      }
      
      .note-item {
        background: var(--bg-tertiary);
        border: 1px solid var(--border-secondary);
        border-radius: 6px;
        padding: 8px;
        margin-bottom: 8px;
        cursor: pointer;
        font-size: 12px;
      }
      
      .note-item:hover {
        border-color: var(--accent-primary);
      }
      
      .note-item.active {
        background: var(--accent-primary);
        color: white;
      }
      
      .note-editor {
        flex: 1;
        display: none;
        flex-direction: column;
        padding: 10px;
      }
      
      .note-editor.active {
        display: flex;
      }
      
      .note-title-input {
        background: var(--bg-tertiary);
        border: 1px solid var(--border-secondary);
        color: var(--text-primary);
        padding: 8px;
        border-radius: 4px;
        margin-bottom: 8px;
        font-size: 12px;
      }
      
      .note-content-input {
        flex: 1;
        background: var(--bg-tertiary);
        border: 1px solid var(--border-secondary);
        color: var(--text-primary);
        padding: 8px;
        border-radius: 4px;
        resize: none;
        font-size: 12px;
        font-family: 'JetBrains Mono', monospace;
      }
      
      .notes-actions {
        padding: 10px;
        border-top: 1px solid var(--border-secondary);
        display: flex;
        gap: 5px;
      }
      
      .notes-toggle {
        position: absolute;
        left: -30px;
        top: 50%;
        transform: translateY(-50%);
        background: rgba(26, 26, 46, 0.95);
        border: 1px solid var(--border-primary);
        border-right: none;
        border-radius: 6px 0 0 6px;
        padding: 6px 4px;
        cursor: pointer;
        color: var(--text-primary);
        font-size: 14px;
      }
    `;
    document.head.appendChild(style);

    this.notePanel = document.createElement('div');
    this.notePanel.className = 'notes-panel';
    this.notePanel.innerHTML = `
      <div class="notes-toggle" onclick="window.notesManager.toggle()">📝</div>
      
      <div class="notes-header">
        <h4 style="margin: 0; color: var(--text-primary);">📝 Notes</h4>
        <button onclick="window.notesManager.toggle()" style="background: none; border: none; color: var(--text-secondary); cursor: pointer; font-size: 16px;">&times;</button>
      </div>
      
      <div class="notes-content">
        <div class="notes-tabs">
          <button class="notes-tab active" onclick="window.notesManager.showTab('list')">All Notes</button>
          <button class="notes-tab" onclick="window.notesManager.showTab('editor')">New Note</button>
        </div>
        
        <div class="notes-list" id="notes-list">
          <div class="empty-state" style="text-align: center; color: var(--text-secondary); padding: 20px;">
            No notes yet. Click "New Note" to start.
          </div>
        </div>
        
        <div class="note-editor" id="note-editor">
          <input type="text" class="note-title-input" id="note-title" placeholder="Note title...">
          <textarea class="note-content-input" id="note-content" placeholder="Write your note here..."></textarea>
        </div>
      </div>
      
      <div class="notes-actions">
        <button class="btn btn-sm btn-primary" onclick="window.notesManager.saveNote()" style="flex: 1;">Save</button>
        <button class="btn btn-sm btn-secondary" onclick="window.notesManager.newNote()">New</button>
        <button class="btn btn-sm btn-danger" onclick="window.notesManager.deleteNote()">Delete</button>
      </div>
    `;

    document.body.appendChild(this.notePanel);
    
    this.loadNotes();
    this.currentNote = null;
    this.currentTab = 'list';
  }

  toggle() {
    this.isOpen = !this.isOpen;
    this.notePanel.classList.toggle('open', this.isOpen);
    
    if (this.isOpen) {
      this.loadNotes();
    }
  }

  showTab(tabName) {
    // Update tab buttons
    const tabs = this.notePanel.querySelectorAll('.notes-tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    tabs[tabName === 'list' ? 0 : 1].classList.add('active');
    
    // Show appropriate content
    const notesList = this.notePanel.querySelector('#notes-list');
    const noteEditor = this.notePanel.querySelector('#note-editor');
    
    if (tabName === 'list') {
      notesList.style.display = 'block';
      noteEditor.style.display = 'none';
    } else {
      notesList.style.display = 'none';
      noteEditor.style.display = 'flex';
    }
    
    this.currentTab = tabName;
  }

  loadNotes() {
    const notesList = this.notePanel.querySelector('#notes-list');
    
    if (this.notes.length === 0) {
      notesList.innerHTML = `
        <div class="empty-state" style="text-align: center; color: var(--text-secondary); padding: 20px;">
          No notes yet. Click "New Note" to start.
        </div>
      `;
      return;
    }
    
    notesList.innerHTML = this.notes.map((note, index) => `
      <div class="note-item" onclick="window.notesManager.loadNote(${index})">
        <div style="font-weight: bold; margin-bottom: 4px;">${note.title || 'Untitled'}</div>
        <div style="color: var(--text-secondary); font-size: 10px;">${this.formatDate(note.date)}</div>
        <div style="color: var(--text-secondary); margin-top: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          ${note.content.substring(0, 50)}${note.content.length > 50 ? '...' : ''}
        </div>
      </div>
    `).join('');
  }

  loadNote(index) {
    this.currentNote = index;
    const note = this.notes[index];
    
    // Switch to editor tab
    this.showTab('editor');
    
    // Load note data
    this.notePanel.querySelector('#note-title').value = note.title || '';
    this.notePanel.querySelector('#note-content').value = note.content || '';
    
    // Highlight the note in the list
    const noteItems = this.notePanel.querySelectorAll('.note-item');
    noteItems.forEach((item, i) => {
      item.classList.toggle('active', i === index);
    });
  }

  newNote() {
    this.currentNote = null;
    this.showTab('editor');
    
    // Clear editor
    this.notePanel.querySelector('#note-title').value = '';
    this.notePanel.querySelector('#note-content').value = '';
    
    // Remove active highlighting
    this.notePanel.querySelectorAll('.note-item').forEach(item => {
      item.classList.remove('active');
    });
  }

  saveNote() {
    const title = this.notePanel.querySelector('#note-title').value.trim();
    const content = this.notePanel.querySelector('#note-content').value.trim();
    
    if (!title && !content) {
      if (window.showNotification) {
        window.showNotification('Note is empty', 'warning');
      }
      return;
    }
    
    const note = {
      title: title || 'Untitled',
      content: content,
      date: new Date().toISOString(),
      url: window.location.href
    };
    
    if (this.currentNote !== null) {
      // Update existing note
      this.notes[this.currentNote] = note;
    } else {
      // Add new note
      this.notes.unshift(note);
    }
    
    this.saveNotes();
    this.loadNotes();
    
    if (window.showNotification) {
      window.showNotification('Note saved', 'success');
    }
  }

  deleteNote() {
    if (this.currentNote !== null) {
      if (confirm('Delete this note?')) {
        this.notes.splice(this.currentNote, 1);
        this.saveNotes();
        this.loadNotes();
        this.newNote();
        
        if (window.showNotification) {
          window.showNotification('Note deleted', 'success');
        }
      }
    }
  }

  saveNotes() {
    setCookie('user-notes', JSON.stringify(this.notes));
    localStorage.setItem('user-notes', JSON.stringify(this.notes));
  }

  autoSave() {
    if (this.currentTab === 'editor' && this.currentNote !== null) {
      const title = this.notePanel.querySelector('#note-title')?.value.trim();
      const content = this.notePanel.querySelector('#note-content')?.value.trim();
      
      if (title || content) {
        this.saveNote();
      }
    }
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  }
}

// Register plugin
const notesManager = new NotesManagerPlugin();
window.notesManager = notesManager;

if (window.pluginSystem) {
  window.pluginSystem.registerPlugin('notes-manager', notesManager);
} else {
  // Wait for plugin system to load
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      if (window.pluginSystem) {
        window.pluginSystem.registerPlugin('notes-manager', notesManager);
      }
    }, 100);
  });
}