/**
 * Moveable Buttons System for SlowGuardian v9
 * Allows users to move, hide, and customize floating UI elements
 */

class MoveableButtons {
  constructor() {
    this.buttons = new Map();
    this.positions = JSON.parse(getCookie('button-positions') || localStorage.getItem('button-positions') || '{}');
    this.hiddenButtons = JSON.parse(getCookie('hidden-buttons') || localStorage.getItem('hidden-buttons') || '[]');
    this.dragState = { isDragging: false, currentButton: null, startX: 0, startY: 0 };
    this.init();
  }

  init() {
    console.log('🎛️ Initializing Moveable Buttons System...');
    this.createCoreButtons();
    this.setupEventListeners();
    this.restorePositions();
    this.createControlPanel();
    console.log('✅ Moveable Buttons System initialized');
  }

  createCoreButtons() {
    // Notes button
    this.addButton('notes', {
      icon: '📝',
      label: 'Notes',
      action: () => this.toggleNotes(),
      defaultPosition: { right: '20px', bottom: '80px' },
      category: 'productivity'
    });

    // Screenshots button  
    this.addButton('screenshot', {
      icon: '📸',
      label: 'Screenshot',
      action: () => this.takeScreenshot(),
      defaultPosition: { right: '20px', bottom: '140px' },
      category: 'tools'
    });

    // Bookmarks button
    this.addButton('bookmarks', {
      icon: '🔖',
      label: 'Bookmarks',
      action: () => this.toggleBookmarks(),
      defaultPosition: { right: '20px', bottom: '200px' },
      category: 'productivity'
    });

    // Quick Settings button
    this.addButton('quick-settings', {
      icon: '⚡',
      label: 'Quick Settings',
      action: () => this.toggleQuickSettings(),
      defaultPosition: { right: '20px', bottom: '260px' },
      category: 'system'
    });

    // Plugin Manager button
    this.addButton('plugin-manager', {
      icon: '🔌',
      label: 'Plugins',
      action: () => window.pluginSystem?.showPluginManager(),
      defaultPosition: { left: '20px', bottom: '80px' },
      category: 'system'
    });

    // Theme Switcher button
    this.addButton('theme-switcher', {
      icon: '🎨',
      label: 'Themes',
      action: () => this.toggleThemeSwitcher(),
      defaultPosition: { left: '20px', bottom: '140px' },
      category: 'customization'
    });
  }

  addButton(id, config) {
    const buttonElement = this.createButtonElement(id, config);
    this.buttons.set(id, { element: buttonElement, config });
    
    // Add to DOM if not hidden
    if (!this.hiddenButtons.includes(id)) {
      document.body.appendChild(buttonElement);
    }
  }

  createButtonElement(id, config) {
    const button = document.createElement('div');
    button.className = 'moveable-button';
    button.id = `moveable-btn-${id}`;
    button.setAttribute('data-button-id', id);
    
    button.innerHTML = `
      <div class="button-content">
        <span class="button-icon">${config.icon}</span>
        <span class="button-label">${config.label}</span>
      </div>
      <div class="button-controls" style="display: none;">
        <button class="btn-mini" onclick="window.moveableButtons.hideButton('${id}')" title="Hide">👁️</button>
        <button class="btn-mini" onclick="window.moveableButtons.resetPosition('${id}')" title="Reset Position">🔄</button>
      </div>
    `;

    // Apply styles
    this.applyButtonStyles(button, config);
    
    // Add event listeners
    this.setupButtonEventListeners(button, id, config);
    
    return button;
  }

  applyButtonStyles(button, config) {
    button.style.cssText = `
      position: fixed;
      background: rgba(26, 26, 46, 0.95);
      backdrop-filter: blur(10px);
      border: 1px solid var(--border-primary);
      border-radius: 12px;
      padding: 8px 12px;
      cursor: pointer;
      z-index: 9999;
      transition: all 0.3s ease;
      user-select: none;
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 50px;
      max-width: 200px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;

    // Apply default position
    Object.assign(button.style, config.defaultPosition);
  }

  setupButtonEventListeners(button, id, config) {
    // Click action
    button.addEventListener('click', (e) => {
      if (!this.dragState.isDragging && e.target.classList.contains('button-content')) {
        config.action();
      }
    });

    // Right click for controls
    button.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.toggleButtonControls(button);
    });

    // Drag functionality
    button.addEventListener('mousedown', (e) => {
      if (e.target.closest('.button-controls')) return;
      
      this.startDrag(button, id, e);
    });

    // Hover effects
    button.addEventListener('mouseenter', () => {
      button.style.transform = 'scale(1.05)';
      button.style.boxShadow = '0 6px 16px rgba(0,0,0,0.4)';
    });

    button.addEventListener('mouseleave', () => {
      if (!this.dragState.isDragging) {
        button.style.transform = 'scale(1)';
        button.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
      }
    });
  }

  setupEventListeners() {
    // Global mouse events for dragging
    document.addEventListener('mousemove', (e) => this.handleDrag(e));
    document.addEventListener('mouseup', () => this.endDrag());
    
    // Hide controls when clicking elsewhere
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.moveable-button')) {
        this.hideAllControls();
      }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey) {
        switch(e.key) {
          case 'B':
            e.preventDefault();
            this.toggleControlPanel();
            break;
          case 'H':
            e.preventDefault();
            this.hideAllButtons();
            break;
          case 'R':
            e.preventDefault();
            this.resetAllPositions();
            break;
        }
      }
    });
  }

  startDrag(button, id, e) {
    this.dragState = {
      isDragging: true,
      currentButton: button,
      buttonId: id,
      startX: e.clientX - button.offsetLeft,
      startY: e.clientY - button.offsetTop
    };

    button.style.cursor = 'grabbing';
    button.style.zIndex = '10000';
    button.style.transform = 'scale(1.1)';
    
    // Add visual feedback
    button.style.boxShadow = '0 8px 20px rgba(0,0,0,0.5)';
  }

  handleDrag(e) {
    if (!this.dragState.isDragging) return;

    const button = this.dragState.currentButton;
    const x = e.clientX - this.dragState.startX;
    const y = e.clientY - this.dragState.startY;

    // Constrain to viewport
    const maxX = window.innerWidth - button.offsetWidth;
    const maxY = window.innerHeight - button.offsetHeight;
    
    const constrainedX = Math.max(0, Math.min(x, maxX));
    const constrainedY = Math.max(0, Math.min(y, maxY));

    button.style.left = constrainedX + 'px';
    button.style.top = constrainedY + 'px';
    button.style.right = 'auto';
    button.style.bottom = 'auto';
  }

  endDrag() {
    if (!this.dragState.isDragging) return;

    const button = this.dragState.currentButton;
    const buttonId = this.dragState.buttonId;

    // Save position
    this.savePosition(buttonId, {
      left: button.style.left,
      top: button.style.top,
      right: 'auto',
      bottom: 'auto'
    });

    // Reset visual state
    button.style.cursor = 'pointer';
    button.style.zIndex = '9999';
    button.style.transform = 'scale(1)';
    button.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';

    this.dragState = { isDragging: false, currentButton: null, startX: 0, startY: 0 };
  }

  savePosition(buttonId, position) {
    this.positions[buttonId] = position;
    setCookie('button-positions', JSON.stringify(this.positions));
    localStorage.setItem('button-positions', JSON.stringify(this.positions));
  }

  restorePositions() {
    for (const [buttonId, position] of Object.entries(this.positions)) {
      const button = this.buttons.get(buttonId);
      if (button) {
        Object.assign(button.element.style, position);
      }
    }
  }

  hideButton(buttonId) {
    const button = this.buttons.get(buttonId);
    if (button) {
      button.element.style.display = 'none';
      
      if (!this.hiddenButtons.includes(buttonId)) {
        this.hiddenButtons.push(buttonId);
        this.saveHiddenButtons();
      }
    }
  }

  showButton(buttonId) {
    const button = this.buttons.get(buttonId);
    if (button) {
      button.element.style.display = 'flex';
      
      const index = this.hiddenButtons.indexOf(buttonId);
      if (index > -1) {
        this.hiddenButtons.splice(index, 1);
        this.saveHiddenButtons();
      }
    }
  }

  saveHiddenButtons() {
    setCookie('hidden-buttons', JSON.stringify(this.hiddenButtons));
    localStorage.setItem('hidden-buttons', JSON.stringify(this.hiddenButtons));
  }

  resetPosition(buttonId) {
    const button = this.buttons.get(buttonId);
    if (button) {
      const defaultPos = button.config.defaultPosition;
      Object.assign(button.element.style, defaultPos);
      
      // Remove from saved positions
      delete this.positions[buttonId];
      this.savePosition(buttonId, defaultPos);
    }
  }

  toggleButtonControls(button) {
    const controls = button.querySelector('.button-controls');
    if (controls) {
      const isVisible = controls.style.display !== 'none';
      
      // Hide all other controls first
      this.hideAllControls();
      
      if (!isVisible) {
        controls.style.display = 'flex';
        controls.style.gap = '4px';
        controls.style.marginTop = '4px';
      }
    }
  }

  hideAllControls() {
    this.buttons.forEach(({ element }) => {
      const controls = element.querySelector('.button-controls');
      if (controls) {
        controls.style.display = 'none';
      }
    });
  }

  createControlPanel() {
    const style = document.createElement('style');
    style.textContent = `
      .moveable-control-panel {
        position: fixed;
        top: 50%;
        right: -300px;
        transform: translateY(-50%);
        width: 280px;
        background: rgba(26, 26, 46, 0.98);
        backdrop-filter: blur(15px);
        border: 1px solid var(--border-primary);
        border-radius: 12px 0 0 12px;
        padding: 20px;
        z-index: 10001;
        transition: right 0.3s ease;
        box-shadow: -4px 0 12px rgba(0,0,0,0.3);
      }
      
      .moveable-control-panel.open {
        right: 0;
      }
      
      .control-panel-toggle {
        position: absolute;
        left: -40px;
        top: 50%;
        transform: translateY(-50%);
        background: rgba(26, 26, 46, 0.95);
        border: 1px solid var(--border-primary);
        border-right: none;
        border-radius: 8px 0 0 8px;
        padding: 8px 6px;
        cursor: pointer;
        color: var(--text-primary);
        font-size: 16px;
      }
      
      .button-list {
        max-height: 300px;
        overflow-y: auto;
      }
      
      .button-list-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid var(--border-secondary);
      }
      
      .btn-mini {
        background: var(--bg-tertiary);
        border: 1px solid var(--border-primary);
        color: var(--text-secondary);
        padding: 2px 6px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 10px;
        margin: 0 2px;
      }
      
      .btn-mini:hover {
        background: var(--accent-primary);
        color: white;
      }
    `;
    document.head.appendChild(style);
  }

  toggleControlPanel() {
    let panel = document.getElementById('moveable-control-panel');
    
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'moveable-control-panel';
      panel.className = 'moveable-control-panel';
      
      panel.innerHTML = `
        <div class="control-panel-toggle" onclick="window.moveableButtons.toggleControlPanel()">
          🎛️
        </div>
        
        <h3 style="margin: 0 0 15px 0; color: var(--text-primary);">🎛️ Button Manager</h3>
        
        <div class="button-list">
          ${Array.from(this.buttons.entries()).map(([id, { config }]) => `
            <div class="button-list-item">
              <div>
                <span>${config.icon} ${config.label}</span>
                <small style="display: block; color: var(--text-secondary);">${config.category}</small>
              </div>
              <div>
                <button class="btn-mini" onclick="window.moveableButtons.${this.hiddenButtons.includes(id) ? 'show' : 'hide'}Button('${id}')" title="${this.hiddenButtons.includes(id) ? 'Show' : 'Hide'}">
                  ${this.hiddenButtons.includes(id) ? '👁️' : '🙈'}
                </button>
                <button class="btn-mini" onclick="window.moveableButtons.resetPosition('${id}')" title="Reset">🔄</button>
              </div>
            </div>
          `).join('')}
        </div>
        
        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid var(--border-secondary);">
          <button class="btn btn-sm btn-secondary" onclick="window.moveableButtons.resetAllPositions()" style="width: 100%; margin-bottom: 8px;">
            🔄 Reset All Positions
          </button>
          <button class="btn btn-sm btn-warning" onclick="window.moveableButtons.hideAllButtons()" style="width: 100%;">
            🙈 Hide All Buttons
          </button>
        </div>
        
        <div style="margin-top: 10px; font-size: 11px; color: var(--text-tertiary);">
          <strong>Tips:</strong><br>
          • Right-click buttons for controls<br>
          • Drag to move buttons<br>
          • Ctrl+Shift+B: Toggle panel<br>
          • Ctrl+Shift+H: Hide all<br>
          • Ctrl+Shift+R: Reset all
        </div>
      `;
      
      document.body.appendChild(panel);
    }
    
    panel.classList.toggle('open');
  }

  resetAllPositions() {
    this.positions = {};
    this.buttons.forEach(({ element, config }, buttonId) => {
      Object.assign(element.style, config.defaultPosition);
    });
    setCookie('button-positions', '{}');
    localStorage.setItem('button-positions', '{}');
    
    if (window.showNotification) {
      window.showNotification('All button positions reset', 'success');
    }
  }

  hideAllButtons() {
    this.buttons.forEach((_, buttonId) => this.hideButton(buttonId));
    
    if (window.showNotification) {
      window.showNotification('All buttons hidden. Use Ctrl+Shift+B to manage.', 'info');
    }
  }

  // Button action implementations
  toggleNotes() {
    // Implementation for notes functionality
    this.showNotification('Notes feature - Coming soon!', 'info');
  }

  takeScreenshot() {
    // Implementation for screenshot functionality
    this.showNotification('Screenshot feature - Coming soon!', 'info');
  }

  toggleBookmarks() {
    // Implementation for bookmarks functionality
    this.showNotification('Bookmarks feature - Coming soon!', 'info');
  }

  toggleQuickSettings() {
    // Implementation for quick settings
    this.showNotification('Quick Settings - Coming soon!', 'info');
  }

  toggleThemeSwitcher() {
    // Implementation for theme switcher
    this.showNotification('Theme Switcher - Coming soon!', 'info');
  }

  showNotification(message, type = 'info') {
    if (window.showNotification) {
      window.showNotification(message, type);
    } else {
      console.log(`[${type.toUpperCase()}] ${message}`);
    }
  }
}

// Initialize Moveable Buttons System
const moveableButtons = new MoveableButtons();
window.moveableButtons = moveableButtons;

// Export for modules
if (typeof module !== 'undefined') {
  module.exports = MoveableButtons;
}