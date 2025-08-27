/**
 * Screenshot Protection System for SlowGuardian v9
 * Detects screenshot attempts and shows spoofed content
 */

class ScreenshotProtection {
  constructor() {
    this.enabled = false;
    this.originalContent = null;
    this.spoofContent = null;
    this.isProtectionActive = false;
    this.tabTitle = '';
    this.tabIcon = '';
    this.init();
  }

  init() {
    // Load settings
    this.enabled = localStorage.getItem('screenshot-protection') === 'true';
    
    if (this.enabled) {
      this.setupProtection();
    }
  }

  enable() {
    this.enabled = true;
    localStorage.setItem('screenshot-protection', 'true');
    this.setupProtection();
    
    if (window.showNotification) {
      window.showNotification('Screenshot protection enabled', 'success');
    }
  }

  disable() {
    this.enabled = false;
    localStorage.setItem('screenshot-protection', 'false');
    this.removeProtection();
    
    if (window.showNotification) {
      window.showNotification('Screenshot protection disabled', 'info');
    }
  }

  toggle() {
    if (this.enabled) {
      this.disable();
    } else {
      this.enable();
    }
  }

  setupProtection() {
    if (!this.enabled) return;

    // Get current tab cloak settings
    this.updateSpoofSettings();

    // Detect various screenshot scenarios
    this.setupVisibilityDetection();
    this.setupPrintDetection();
    this.setupDevToolsDetection();
    this.setupKeyboardDetection();
  }

  updateSpoofSettings() {
    // Get current tab cloaking settings
    this.tabTitle = localStorage.getItem('name') || 'My Drive - Google Drive';
    this.tabIcon = localStorage.getItem('icon') || 'https://ssl.gstatic.com/docs/doclist/images/mediatype/icon_1_document_x16.png';
    
    // Create spoof content based on current cloak settings
    this.createSpoofContent();
  }

  createSpoofContent() {
    // Generate spoof content based on the current tab cloak
    const selectedOption = localStorage.getItem('selectedOption') || 'gDrive';
    
    let spoofHTML = '';
    
    switch(selectedOption) {
      case 'gDrive':
        spoofHTML = this.createGoogleDriveSpoof();
        break;
      case 'gClass':
        spoofHTML = this.createGoogleClassroomSpoof();
        break;
      case 'gMail':
        spoofHTML = this.createGmailSpoof();
        break;
      case 'gMeet':
        spoofHTML = this.createGoogleMeetSpoof();
        break;
      case 'netflix':
        spoofHTML = this.createNetflixSpoof();
        break;
      case 'spotify':
        spoofHTML = this.createSpotifySpoof();
        break;
      case 'youtube':
        spoofHTML = this.createYouTubeSpoof();
        break;
      case 'canvas':
        spoofHTML = this.createCanvasSpoof();
        break;
      default:
        spoofHTML = this.createGenericSpoof();
    }

    // Create spoof overlay
    if (!this.spoofContent) {
      this.spoofContent = document.createElement('div');
      this.spoofContent.id = 'spoof-overlay';
      this.spoofContent.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: white;
        z-index: 999999;
        display: none;
        overflow: hidden;
      `;
    }
    
    this.spoofContent.innerHTML = spoofHTML;
  }

  createGoogleDriveSpoof() {
    return `
      <div style="background: #f8f9fa; height: 100vh; font-family: 'Roboto', Arial, sans-serif;">
        <div style="background: white; border-bottom: 1px solid #dadce0; padding: 8px 20px; display: flex; align-items: center;">
          <img src="https://ssl.gstatic.com/docs/doclist/images/drive_2022q3_32dp.png" alt="Drive" style="width: 32px; height: 32px; margin-right: 12px;">
          <span style="font-size: 22px; color: #5f6368;">Drive</span>
        </div>
        <div style="padding: 20px; max-width: 1200px; margin: 0 auto;">
          <div style="margin-bottom: 20px;">
            <h2 style="color: #202124; font-size: 24px; margin: 0;">My Drive</h2>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px;">
            <div style="border: 1px solid #dadce0; border-radius: 8px; padding: 16px; background: white; cursor: pointer;">
              <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <img src="https://ssl.gstatic.com/docs/doclist/images/mediatype/icon_1_document_x16.png" style="width: 16px; height: 16px; margin-right: 8px;">
                <span style="color: #202124; font-size: 14px;">Assignment Report.docx</span>
              </div>
              <span style="color: #5f6368; font-size: 12px;">Modified today</span>
            </div>
            <div style="border: 1px solid #dadce0; border-radius: 8px; padding: 16px; background: white; cursor: pointer;">
              <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <img src="https://ssl.gstatic.com/docs/doclist/images/mediatype/icon_1_presentation_x16.png" style="width: 16px; height: 16px; margin-right: 8px;">
                <span style="color: #202124; font-size: 14px;">Project Presentation.pptx</span>
              </div>
              <span style="color: #5f6368; font-size: 12px;">Modified yesterday</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  createGoogleClassroomSpoof() {
    return `
      <div style="background: #f8f9fa; height: 100vh; font-family: 'Roboto', Arial, sans-serif;">
        <div style="background: #1976d2; color: white; padding: 16px 24px; display: flex; align-items: center;">
          <span style="font-size: 20px; font-weight: 500;">Classroom</span>
        </div>
        <div style="padding: 24px; max-width: 1200px; margin: 0 auto;">
          <h2 style="color: #202124; margin-bottom: 24px;">Your classes</h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">
            <div style="border: 1px solid #dadce0; border-radius: 8px; overflow: hidden; background: white;">
              <div style="height: 120px; background: linear-gradient(135deg, #1976d2, #42a5f5); position: relative;">
                <div style="position: absolute; bottom: 16px; left: 16px; color: white;">
                  <h3 style="margin: 0; font-size: 18px;">Mathematics</h3>
                  <p style="margin: 4px 0 0 0; opacity: 0.9;">Mr. Johnson</p>
                </div>
              </div>
              <div style="padding: 16px;">
                <p style="color: #5f6368; margin: 0; font-size: 14px;">No new assignments</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  createGmailSpoof() {
    return `
      <div style="background: white; height: 100vh; font-family: 'Roboto', Arial, sans-serif;">
        <div style="background: #f8f9fa; border-bottom: 1px solid #dadce0; padding: 12px 24px; display: flex; align-items: center;">
          <img src="https://ssl.gstatic.com/ui/v1/icons/mail/rfr/logo_gmail_lockup_default_1x_r2.png" alt="Gmail" style="height: 28px;">
        </div>
        <div style="display: flex; height: calc(100vh - 52px);">
          <div style="width: 200px; border-right: 1px solid #dadce0; padding: 16px;">
            <div style="background: #c2e7ff; border-radius: 16px; padding: 8px 16px; margin-bottom: 8px; color: #001d35;">
              Inbox
            </div>
            <div style="padding: 8px 16px; color: #5f6368; cursor: pointer;">Sent</div>
            <div style="padding: 8px 16px; color: #5f6368; cursor: pointer;">Drafts</div>
          </div>
          <div style="flex: 1; padding: 16px;">
            <div style="border-bottom: 1px solid #dadce0; padding: 12px 0; display: flex; align-items: center;">
              <div style="width: 32px; height: 32px; border-radius: 50%; background: #1976d2; color: white; display: flex; align-items: center; justify-content: center; margin-right: 12px; font-size: 14px;">JD</div>
              <div style="flex: 1;">
                <div style="color: #202124; font-weight: 500;">John Doe</div>
                <div style="color: #5f6368; font-size: 14px;">Weekly team update</div>
              </div>
              <div style="color: #5f6368; font-size: 12px;">10:30 AM</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  createGenericSpoof() {
    const customName = localStorage.getItem('CustomName') || this.tabTitle;
    return `
      <div style="background: white; height: 100vh; font-family: Arial, sans-serif; display: flex; align-items: center; justify-content: center;">
        <div style="text-align: center;">
          <h1 style="color: #333; margin-bottom: 20px;">${customName}</h1>
          <p style="color: #666;">Loading...</p>
        </div>
      </div>
    `;
  }

  setupVisibilityDetection() {
    // Detect when page becomes hidden (potential screenshot)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.enabled) {
        this.activateProtection();
        // Revert after a short delay
        setTimeout(() => this.deactivateProtection(), 2000);
      }
    });

    // Detect window blur (potential alt-tab to screenshot tool)
    let blurTimeout;
    window.addEventListener('blur', () => {
      if (this.enabled) {
        blurTimeout = setTimeout(() => {
          this.activateProtection();
        }, 50); // Reduced delay for faster response
      }
    });

    window.addEventListener('focus', () => {
      clearTimeout(blurTimeout);
      this.deactivateProtection();
    });

    // Additional detection for window resize (common during screenshots)
    let resizeTimeout;
    window.addEventListener('resize', () => {
      if (this.enabled) {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          this.activateProtection();
          setTimeout(() => this.deactivateProtection(), 1000);
        }, 100);
      }
    });

    // Detect context menu (right-click) which might indicate screenshot attempts
    document.addEventListener('contextmenu', (e) => {
      if (this.enabled) {
        this.activateProtection();
        setTimeout(() => this.deactivateProtection(), 1500);
      }
    });
  }

  setupPrintDetection() {
    // Detect print attempts
    window.addEventListener('beforeprint', () => {
      if (this.enabled) {
        this.activateProtection();
      }
    });

    window.addEventListener('afterprint', () => {
      this.deactivateProtection();
    });
  }

  setupDevToolsDetection() {
    // Basic devtools detection
    let devtools = { open: false };
    
    setInterval(() => {
      if (this.enabled && 
          (window.outerHeight - window.innerHeight > 200 || 
           window.outerWidth - window.innerWidth > 200)) {
        if (!devtools.open) {
          devtools.open = true;
          this.activateProtection();
        }
      } else {
        if (devtools.open) {
          devtools.open = false;
          this.deactivateProtection();
        }
      }
    }, 500);
  }

  setupKeyboardDetection() {
    // Detect common screenshot key combinations
    document.addEventListener('keydown', (e) => {
      if (!this.enabled) return;

      // Print Screen key
      if (e.key === 'PrintScreen') {
        e.preventDefault(); // Try to prevent the screenshot
        this.activateProtection();
        setTimeout(() => this.deactivateProtection(), 2000);
      }

      // Windows + Shift + S (Windows Snipping Tool)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        this.activateProtection();
        setTimeout(() => this.deactivateProtection(), 2000);
      }

      // Cmd + Shift + 3/4/5 (macOS screenshots)
      if (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key)) {
        e.preventDefault();
        this.activateProtection();
        setTimeout(() => this.deactivateProtection(), 2000);
      }

      // Alt + Print Screen (Windows active window screenshot)
      if (e.altKey && e.key === 'PrintScreen') {
        e.preventDefault();
        this.activateProtection();
        setTimeout(() => this.deactivateProtection(), 2000);
      }

      // Ctrl + Print Screen (some applications)
      if (e.ctrlKey && e.key === 'PrintScreen') {
        e.preventDefault();
        this.activateProtection();
        setTimeout(() => this.deactivateProtection(), 2000);
      }
    });

    // Also detect key combinations that might not trigger keydown
    document.addEventListener('keyup', (e) => {
      if (!this.enabled) return;
      
      if (e.key === 'PrintScreen') {
        this.activateProtection();
        setTimeout(() => this.deactivateProtection(), 2000);
      }
    });
  }

  activateProtection() {
    if (this.isProtectionActive || !this.enabled) return;

    this.isProtectionActive = true;
    
    // Update spoof content with current settings
    this.updateSpoofSettings();
    
    // Store original content
    this.originalContent = document.body.style.cssText;
    
    // Add spoof overlay to page
    if (!document.getElementById('spoof-overlay')) {
      document.body.appendChild(this.spoofContent);
    }
    
    // Show spoof content
    this.spoofContent.style.display = 'block';
    
    // Update title and favicon
    const originalTitle = document.title;
    const originalIcon = document.querySelector('link[rel*="icon"]')?.href;
    
    document.title = this.tabTitle;
    const favicon = document.querySelector('link[rel*="icon"]');
    if (favicon) {
      favicon.href = this.tabIcon;
    }
    
    // Store originals for restoration
    this.originalTitle = originalTitle;
    this.originalIcon = originalIcon;
  }

  deactivateProtection() {
    if (!this.isProtectionActive) return;

    this.isProtectionActive = false;
    
    // Hide spoof content
    if (this.spoofContent) {
      this.spoofContent.style.display = 'none';
    }
    
    // Restore original title and icon
    if (this.originalTitle) {
      document.title = this.originalTitle;
    }
    
    if (this.originalIcon) {
      const favicon = document.querySelector('link[rel*="icon"]');
      if (favicon) {
        favicon.href = this.originalIcon;
      }
    }
  }

  removeProtection() {
    this.deactivateProtection();
    
    if (this.spoofContent && this.spoofContent.parentNode) {
      this.spoofContent.parentNode.removeChild(this.spoofContent);
    }
  }

  // Additional spoof content creators for other services
  createNetflixSpoof() {
    return `
      <div style="background: #000; height: 100vh; color: white; font-family: 'Helvetica Neue', Arial, sans-serif;">
        <div style="background: rgba(0,0,0,0.9); padding: 20px; display: flex; align-items: center;">
          <img src="https://assets.nflxext.com/ffe/siteui/common/icons/nficon2016.png" alt="Netflix" style="height: 32px; margin-right: 20px;">
          <span style="font-size: 24px; color: #e50914; font-weight: bold;">NETFLIX</span>
        </div>
        <div style="padding: 40px; text-align: center;">
          <h2 style="margin-bottom: 20px;">Continue Watching</h2>
          <div style="display: flex; justify-content: center; gap: 20px;">
            <div style="width: 200px; height: 112px; background: #333; border-radius: 4px; position: relative;">
              <div style="position: absolute; bottom: 8px; left: 8px; background: rgba(0,0,0,0.8); padding: 4px 8px; border-radius: 4px;">
                <span style="font-size: 12px;">Documentary</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  createSpotifySpoof() {
    return `
      <div style="background: #191414; height: 100vh; color: white; font-family: 'Spotify Circular', Arial, sans-serif;">
        <div style="background: #000; padding: 16px 24px; display: flex; align-items: center;">
          <span style="color: #1db954; font-size: 24px; font-weight: bold;">Spotify</span>
        </div>
        <div style="padding: 24px;">
          <h2 style="margin-bottom: 24px;">Good afternoon</h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
            <div style="background: linear-gradient(135deg, #1db954, #1ed760); border-radius: 8px; padding: 20px; position: relative;">
              <h3 style="margin: 0; font-size: 16px;">Liked Songs</h3>
              <p style="margin: 8px 0 0 0; opacity: 0.7; font-size: 14px;">457 songs</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  createYouTubeSpoof() {
    return `
      <div style="background: white; height: 100vh; font-family: 'Roboto', Arial, sans-serif;">
        <div style="background: white; border-bottom: 1px solid #e0e0e0; padding: 8px 16px; display: flex; align-items: center;">
          <img src="https://www.youtube.com/s/desktop/12345678/img/favicon_32x32.png" alt="YouTube" style="width: 32px; height: 32px; margin-right: 12px;">
          <span style="font-size: 20px; color: #ff0000; font-weight: bold;">YouTube</span>
        </div>
        <div style="padding: 20px;">
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px;">
            <div style="cursor: pointer;">
              <div style="width: 100%; height: 180px; background: #f0f0f0; border-radius: 8px; margin-bottom: 12px; display: flex; align-items: center; justify-content: center; color: #666;">
                Video Thumbnail
              </div>
              <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #030303;">Educational Video Title</h3>
              <p style="margin: 0; color: #606060; font-size: 14px;">Channel Name</p>
              <p style="margin: 4px 0 0 0; color: #606060; font-size: 14px;">123K views • 2 days ago</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  createCanvasSpoof() {
    return `
      <div style="background: #f5f5f5; height: 100vh; font-family: 'Lato', Arial, sans-serif;">
        <div style="background: #394b58; color: white; padding: 12px 20px; display: flex; align-items: center;">
          <span style="font-size: 20px; font-weight: bold;">Canvas</span>
        </div>
        <div style="padding: 24px; max-width: 1200px; margin: 0 auto;">
          <h2 style="color: #2d3b45; margin-bottom: 24px;">Dashboard</h2>
          <div style="background: white; border: 1px solid #c7cdd1; border-radius: 4px; padding: 20px; margin-bottom: 20px;">
            <h3 style="color: #2d3b45; margin: 0 0 16px 0;">Recent Activity</h3>
            <div style="border-left: 3px solid #008ee2; padding-left: 16px; margin-bottom: 12px;">
              <p style="margin: 0; color: #2d3b45; font-weight: 500;">Assignment: Research Paper</p>
              <p style="margin: 4px 0 0 0; color: #666; font-size: 14px;">English Literature - Due in 3 days</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  createGoogleMeetSpoof() {
    return `
      <div style="background: #f9f9f9; height: 100vh; font-family: 'Roboto', Arial, sans-serif;">
        <div style="background: white; border-bottom: 1px solid #dadce0; padding: 16px 24px; display: flex; align-items: center;">
          <img src="https://fonts.gstatic.com/s/i/productlogos/meet_2020q4/v6/web-32dp/logo_meet_2020q4_color_2x_web_32dp.png" alt="Meet" style="width: 32px; height: 32px; margin-right: 12px;">
          <span style="font-size: 22px; color: #5f6368;">Google Meet</span>
        </div>
        <div style="padding: 40px; text-align: center;">
          <h2 style="color: #202124; margin-bottom: 20px;">Ready to join your meeting?</h2>
          <div style="max-width: 400px; margin: 0 auto; background: white; border-radius: 8px; padding: 20px; border: 1px solid #dadce0;">
            <div style="width: 300px; height: 200px; background: #f8f9fa; border-radius: 8px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; color: #5f6368;">
              Camera Preview
            </div>
            <button style="background: #1976d2; color: white; border: none; padding: 12px 24px; border-radius: 4px; cursor: pointer; font-size: 16px;">Join now</button>
          </div>
        </div>
      </div>
    `;
  }
}

// Initialize screenshot protection
const screenshotProtection = new ScreenshotProtection();

// Make it globally available
window.ScreenshotProtection = screenshotProtection;