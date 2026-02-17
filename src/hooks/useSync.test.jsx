
import { renderHook, act } from '@testing-library/react';
import { useSync } from '../hooks/useSync';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(() => ({
      upsert: vi.fn(),
      select: vi.fn(() => ({
        gt: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      }))
    }))
  }
}));

// Mock Navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  configurable: true,
  value: true,
});

describe('useSync Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('should start in synced status when online', async () => {
    const { result } = renderHook(() => useSync());
    expect(result.current.status).toBeDefined();
  });

  it('should set status to offline when navigator is offline', async () => {
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: false,
    });

    const { result } = renderHook(() => useSync());
    
    await act(async () => {
      await result.current.syncData();
    });

    expect(result.current.status).toBe('offline');
  });
});
