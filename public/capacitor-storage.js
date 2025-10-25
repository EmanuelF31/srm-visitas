/**
 * Capacitor Storage Mock for Web/Native compatibility
 * This provides a unified storage API that works on both web and mobile
 */

(function() {
  'use strict';

  // Check if we're running in Capacitor native environment
  const isNative = window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform();

  // Storage implementation
  const storage = {
    async get(key, shared = false) {
      try {
        const storageKey = shared ? `shared_${key}` : `local_${key}`;
        const value = localStorage.getItem(storageKey);
        
        if (value === null) {
          throw new Error(`Key "${key}" not found`);
        }
        
        return {
          key: key,
          value: value,
          shared: shared
        };
      } catch (error) {
        console.error('Storage get error:', error);
        throw error;
      }
    },

    async set(key, value, shared = false) {
      try {
        const storageKey = shared ? `shared_${key}` : `local_${key}`;
        localStorage.setItem(storageKey, value);
        
        return {
          key: key,
          value: value,
          shared: shared
        };
      } catch (error) {
        console.error('Storage set error:', error);
        return null;
      }
    },

    async delete(key, shared = false) {
      try {
        const storageKey = shared ? `shared_${key}` : `local_${key}`;
        localStorage.removeItem(storageKey);
        
        return {
          key: key,
          deleted: true,
          shared: shared
        };
      } catch (error) {
        console.error('Storage delete error:', error);
        return null;
      }
    },

    async list(prefix = '', shared = false) {
      try {
        const storagePrefix = shared ? `shared_` : `local_`;
        const fullPrefix = storagePrefix + prefix;
        const keys = [];
        
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key.startsWith(fullPrefix)) {
            keys.push(key.replace(storagePrefix, ''));
          }
        }
        
        return {
          keys: keys,
          prefix: prefix,
          shared: shared
        };
      } catch (error) {
        console.error('Storage list error:', error);
        return null;
      }
    }
  };

  // Expose storage to window object
  window.storage = storage;

  console.log('✅ Capacitor Storage initialized:', isNative ? 'Native' : 'Web');
})();