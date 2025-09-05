/**
 * Premium Branding Manager
 * Automatically hides premium upgrade elements when premium is active
 */

class PremiumBrandingManager {
  constructor() {
    this.isPremium = false;
    this.init();
  }

  init() {
    // Check premium status on load
    this.checkPremiumStatus();
    
    // Set up observer to hide new premium elements
    this.setupMutationObserver();
    
    // Check periodically for status changes
    setInterval(() => {
      this.checkPremiumStatus();
    }, 5000);
  }

  checkPremiumStatus() {
    const premiumActive = getCookie('premium-active') === 'true';
    const premiumKey = getCookie('premium-key');
    const localPremium = localStorage.getItem('premium-status');
    
    let isCurrentlyPremium = false;
    
    if (premiumActive && premiumKey) {
      isCurrentlyPremium = true;
    } else if (localPremium) {
      try {
        const premiumData = JSON.parse(localPremium);
        isCurrentlyPremium = premiumData.active === true;
      } catch (e) {
        // Invalid data, ignore
      }
    }
    
    // Update branding if status changed
    if (isCurrentlyPremium !== this.isPremium) {
      this.isPremium = isCurrentlyPremium;
      
      if (this.isPremium) {
        this.hidePremiumBranding();
        this.showPremiumStatus();
        console.log('✅ Premium user detected - hiding upgrade prompts');
      } else {
        this.showPremiumBranding();
        this.hidePremiumStatus();
        console.log('👤 Free user detected - showing upgrade prompts');
      }
    }
  }

  hidePremiumBranding() {
    // Comprehensive list of premium-related selectors
    const premiumSelectors = [
      '.get-premium-btn',
      '.premium-upgrade',
      '.upgrade-premium',
      '.premium-cta',
      '.premium-banner',
      '[href="/premium"]',
      '[href="premium.html"]',
      '[href="/premium.html"]',
      '.premium-sidebar-btn',
      '.upgrade-to-premium',
      '.premium-notice',
      '#premium-popup',
      '.premium-floating-btn'
    ];

    premiumSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        element.style.display = 'none';
        element.setAttribute('data-premium-hidden', 'true');
      });
    });

    // Hide specific navbar links
    const navLinks = document.querySelectorAll('nav a, .nav-menu a, .sidebar a');
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && (href.includes('premium') || href.includes('upgrade'))) {
        link.style.display = 'none';
        link.setAttribute('data-premium-hidden', 'true');
      }
    });

    // Hide premium text content
    const textElements = document.querySelectorAll('*');
    textElements.forEach(element => {
      if (element.children.length === 0) { // Only text nodes
        const text = element.textContent.toLowerCase();
        if (text.includes('upgrade to premium') || 
            text.includes('get premium') || 
            text.includes('premium features')) {
          const parent = element.parentElement;
          if (parent && !parent.hasAttribute('data-premium-hidden')) {
            parent.style.display = 'none';
            parent.setAttribute('data-premium-hidden', 'true');
          }
        }
      }
    });
  }

  showPremiumBranding() {
    // Show all hidden premium elements
    const hiddenElements = document.querySelectorAll('[data-premium-hidden="true"]');
    hiddenElements.forEach(element => {
      element.style.display = '';
      element.removeAttribute('data-premium-hidden');
    });
  }

  showPremiumStatus() {
    // Add premium indicator to navbar if not already present
    if (!document.querySelector('.premium-status-indicator')) {
      const navbar = document.querySelector('.navbar, .nav-menu, .sidebar, header');
      if (navbar) {
        const premiumIndicator = document.createElement('div');
        premiumIndicator.className = 'premium-status-indicator';
        premiumIndicator.innerHTML = `
          <span class="premium-badge" style="
            background: linear-gradient(45deg, #fbbf24, #f59e0b);
            color: #000;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: bold;
            margin: 0 8px;
            display: inline-flex;
            align-items: center;
            gap: 4px;
          ">⭐ PREMIUM</span>
        `;
        navbar.appendChild(premiumIndicator);
      }
    }

    // Add premium styling to body
    document.body.classList.add('premium-user');
    
    // Add premium CSS if not already added
    if (!document.querySelector('#premium-user-styles')) {
      const style = document.createElement('style');
      style.id = 'premium-user-styles';
      style.textContent = `
        .premium-user .ads-container,
        .premium-user .advertisement,
        .premium-user .ad-banner,
        .premium-user [id*="ad"],
        .premium-user [class*="ad-"] {
          display: none !important;
        }
        
        .premium-user .content-wrapper {
          margin: 0 !important;
          padding: 0 !important;
        }
        
        .premium-badge {
          animation: premium-pulse 2s infinite;
        }
        
        @keyframes premium-pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `;
      document.head.appendChild(style);
    }
  }

  hidePremiumStatus() {
    // Remove premium indicator
    const indicator = document.querySelector('.premium-status-indicator');
    if (indicator) {
      indicator.remove();
    }

    // Remove premium styling
    document.body.classList.remove('premium-user');
    
    // Remove premium CSS
    const style = document.querySelector('#premium-user-styles');
    if (style) {
      style.remove();
    }
  }

  setupMutationObserver() {
    // Watch for new elements being added to the DOM
    const observer = new MutationObserver(mutations => {
      if (this.isPremium) {
        mutations.forEach(mutation => {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              this.checkElementForPremiumContent(node);
            }
          });
        });
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  checkElementForPremiumContent(element) {
    // Check if the new element contains premium upgrade content
    const premiumKeywords = ['premium', 'upgrade', 'get premium'];
    const text = element.textContent.toLowerCase();
    
    if (premiumKeywords.some(keyword => text.includes(keyword))) {
      const classList = element.classList.toString().toLowerCase();
      const id = element.id.toLowerCase();
      
      if (classList.includes('premium') || classList.includes('upgrade') ||
          id.includes('premium') || id.includes('upgrade')) {
        element.style.display = 'none';
        element.setAttribute('data-premium-hidden', 'true');
      }
    }

    // Check child elements recursively
    element.querySelectorAll('*').forEach(child => {
      this.checkElementForPremiumContent(child);
    });
  }
}

// Initialize the premium branding manager
document.addEventListener('DOMContentLoaded', () => {
  window.premiumBrandingManager = new PremiumBrandingManager();
});

// Also initialize immediately if DOM is already loaded
if (document.readyState === 'loading') {
  // Will be handled by DOMContentLoaded
} else {
  window.premiumBrandingManager = new PremiumBrandingManager();
}

console.log('🎯 Premium Branding Manager loaded');