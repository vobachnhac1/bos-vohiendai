/**
 * Polyfills for Node.js compatibility
 */

// Ensure crypto is available globally
if (typeof globalThis.crypto === 'undefined') {
  const crypto = require('crypto');
  
  // Add randomUUID if not available
  if (!crypto.randomUUID) {
    crypto.randomUUID = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };
  }
  
  globalThis.crypto = crypto;
}

export {};
