/**
 * Global Modal Handler for SlowGuardian
 * Handles all modal open/close functionality
 * Works with both .modal and .modal-overlay structures
 */

class ModalHandler {
  constructor() {
    this.activeModal = null;
    this.overlay = null;
    this.init();
  }

  init() {
    // Create a global overlay for modals if needed
    this.createOverlay();

    // Listen for clicks on modal triggers
    document.addEventListener('click', (e) => {
      // Open modal if element has data-modal attribute
      const trigger = e.target.closest('[data-modal]');
      if (trigger) {
        e.preventDefault();
        const modalId = trigger.getAttribute('data-modal');
        this.openModal(modalId);
        return;
      }

      // Close modal if clicked on overlay or close button
      if (e.target === this.overlay ||
          e.target.classList.contains('modal-close') ||
          e.target.closest('.modal-close')) {
        this.closeModal();
      }
    });

    // Close modal on ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.activeModal) {
        this.closeModal();
      }
    });
  }

  createOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'modal-overlay-backdrop';
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(5px);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;
    document.body.appendChild(this.overlay);
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) {
      console.warn(`Modal with id "${modalId}" not found`);
      return;
    }

    // Close any existing modal first
    if (this.activeModal) {
      this.closeModal();
    }

    // Show overlay
    this.overlay.style.display = 'flex';
    setTimeout(() => {
      this.overlay.style.opacity = '1';
    }, 10);

    // Show modal
    modal.style.display = 'block';
    modal.style.position = 'relative';
    modal.style.zIndex = '10000';
    modal.classList.add('active');

    // Add modal to overlay
    this.overlay.appendChild(modal);

    document.body.style.overflow = 'hidden';
    this.activeModal = modal;

    // Focus first input if exists
    const firstInput = modal.querySelector('input, textarea, select');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 100);
    }
  }

  closeModal() {
    if (!this.activeModal) return;

    this.activeModal.classList.remove('active');
    this.overlay.style.opacity = '0';

    // Fade out animation
    setTimeout(() => {
      if (this.activeModal) {
        this.activeModal.style.display = 'none';
        // Move modal back to its original position in DOM
        document.body.appendChild(this.activeModal);
      }
      this.overlay.style.display = 'none';
    }, 300);

    document.body.style.overflow = '';
    this.activeModal = null;
  }

  // Public API
  static open(modalId) {
    if (window.modalHandler) {
      window.modalHandler.openModal(modalId);
    }
  }

  static close() {
    if (window.modalHandler) {
      window.modalHandler.closeModal();
    }
  }
}

// Initialize global modal handler
if (typeof window !== 'undefined') {
  window.modalHandler = new ModalHandler();

  // Expose public API
  window.openModal = (id) => ModalHandler.open(id);
  window.closeModal = () => ModalHandler.close();
}
