/**
 * Cookie Utility Functions
 * Shared across all SlowGuardian v9 components
 */

// Cookie helper functions
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}

function setCookie(name, value, days = 365) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

// Make functions globally available
window.getCookie = getCookie;
window.setCookie = setCookie;
window.deleteCookie = deleteCookie;

// Mark module as loaded
if (typeof window.markModuleLoaded === 'function') {
  window.markModuleLoaded('cookie-utils');
}
