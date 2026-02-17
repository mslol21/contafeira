import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock matchMedia if needed
global.matchMedia = global.matchMedia || function() {
  return {
    matches: false,
    addListener: function() {},
    removeListener: function() {}
  };
};

// Mock IndexedDB for Dexie
import 'fake-indexeddb/auto';
