// Anti-Adblock Detection and Management System
(function() {
  'use strict';
  
  // Check if ads are blocked
  function detectAdBlock() {
    // Method 1: Check if AdSense script loaded
    const adsenseLoaded = typeof window.adsbygoogle !== 'undefined';
    
    // Method 2: Create bait element
    const bait = document.createElement('div');
    bait.className = 'adsbygoogle ad-banner ads advertisement';
    bait.style.cssText = 'position:absolute;top:-1px;left:-1px;width:1px;height:1px;';
    document.body.appendChild(bait);
    
    // Check if bait is hidden
    const baitHidden = bait.offsetHeight === 0 || 
                       window.getComputedStyle(bait).display === 'none' ||
                       window.getComputedStyle(bait).visibility === 'hidden';
    
    document.body.removeChild(bait);
    
    // Method 3: Check for common adblocker patterns
    const adblockPatterns = [
      'AdBlock',
      'Adblock Plus', 
      'uBlock Origin',
      'Ghostery',
      'Privacy Badger'
    ];
    
    let extensionDetected = false;
    for (const pattern of adblockPatterns) {
      if (navigator.userAgent.includes(pattern)) {
        extensionDetected = true;
        break;
      }
    }
    
    return !adsenseLoaded || baitHidden || extensionDetected;
  }
  
  // Show anti-adblock modal
  function showAdBlockModal() {
    // Create modal HTML
    const modalHTML = `
      <div id="adblock-modal" style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: Arial, sans-serif;
      ">
        <div style="
          background: white;
          padding: 40px;
          border-radius: 10px;
          max-width: 500px;
          text-align: center;
          box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        ">
          <div style="font-size: 48px; margin-bottom: 20px;">🚫</div>
          <h2 style="color: #d32f2f; margin-bottom: 20px;">AdBlock Detected!</h2>
          <p style="color: #333; margin-bottom: 20px; line-height: 1.6;">
            This site is heavily monetized and requires ads to remain free. 
            Please disable your ad blocker to continue using SlowGuardian.
          </p>
          <p style="color: #666; margin-bottom: 30px; font-size: 14px;">
            We use ads to keep our service running and free for everyone.
          </p>
          <button id="adblock-refresh" style="
            background: #4CAF50;
            color: white;
            border: none;
            padding: 12px 30px;
            font-size: 16px;
            border-radius: 5px;
            cursor: pointer;
            margin-right: 10px;
          ">I've Disabled AdBlock</button>
          <button id="adblock-info" style="
            background: #2196F3;
            color: white;
            border: none;
            padding: 12px 30px;
            font-size: 16px;
            border-radius: 5px;
            cursor: pointer;
          ">How to Disable</button>
        </div>
      </div>
    `;
    
    // Inject modal
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add event listeners
    document.getElementById('adblock-refresh').addEventListener('click', function() {
      window.location.reload();
    });
    
    document.getElementById('adblock-info').addEventListener('click', function() {
      alert('To disable your ad blocker:\n\n1. Click on your ad blocker extension icon\n2. Select "Disable on this site" or similar option\n3. Refresh the page\n\nThank you for supporting SlowGuardian!');
    });
    
    // Blur main content
    document.body.style.overflow = 'hidden';
  }
  
  // Initialize ad placement system
  function initAdPlacements() {
    // Create ad container helper
    window.createAdUnit = function(slot, format = 'auto', layout = null) {
      const adDiv = document.createElement('div');
      adDiv.className = 'ad-container';
      adDiv.style.cssText = 'margin: 20px 0; min-height: 90px; display: flex; justify-content: center; align-items: center;';
      
      const ins = document.createElement('ins');
      ins.className = 'adsbygoogle';
      ins.style.cssText = 'display:block;';
      ins.setAttribute('data-ad-client', 'ca-pub-2510115202431848');
      ins.setAttribute('data-ad-slot', slot);
      ins.setAttribute('data-ad-format', format);
      
      if (layout) {
        ins.setAttribute('data-ad-layout', layout);
      }
      
      if (format === 'auto') {
        ins.setAttribute('data-full-width-responsive', 'true');
      }
      
      adDiv.appendChild(ins);
      
      // Push ad
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error('Ad push failed:', e);
      }
      
      return adDiv;
    };
  }
  
  // Run detection after page loads
  window.addEventListener('load', function() {
    setTimeout(function() {
      if (detectAdBlock()) {
        showAdBlockModal();
      }
    }, 1000);
  });
  
  // Re-check periodically
  setInterval(function() {
    if (detectAdBlock() && !document.getElementById('adblock-modal')) {
      showAdBlockModal();
    }
  }, 5000);
  
  // Initialize ad placement system
  initAdPlacements();
  
  // Protect against ad removal
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      mutation.removedNodes.forEach(function(node) {
        if (node.className && node.className.includes('adsbygoogle')) {
          if (!document.getElementById('adblock-modal')) {
            showAdBlockModal();
          }
        }
      });
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
})();
