import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage, clearGameStorage, STORAGE_KEY } from '../useLocalStorage';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('returns initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 'initialValue'));
    expect(result.current[0]).toBe('initialValue');
  });

  it('returns stored value from localStorage', () => {
    localStorageMock.setItem('testKey', JSON.stringify('storedValue'));
    const { result } = renderHook(() => useLocalStorage('testKey', 'initialValue'));
    expect(result.current[0]).toBe('storedValue');
  });

  it('updates localStorage when value changes', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 'initialValue'));

    act(() => {
      result.current[1]('newValue');
    });

    expect(result.current[0]).toBe('newValue');
    expect(JSON.parse(localStorageMock.getItem('testKey')!)).toBe('newValue');
  });

  it('handles objects correctly', () => {
    const initialObject = { name: 'test', count: 0 };
    const { result } = renderHook(() => useLocalStorage('testKey', initialObject));

    expect(result.current[0]).toEqual(initialObject);

    act(() => {
      result.current[1]({ name: 'updated', count: 1 });
    });

    expect(result.current[0]).toEqual({ name: 'updated', count: 1 });
  });

  it('handles arrays correctly', () => {
    const initialArray = ['a', 'b', 'c'];
    const { result } = renderHook(() => useLocalStorage('testKey', initialArray));

    expect(result.current[0]).toEqual(initialArray);

    act(() => {
      result.current[1](['x', 'y', 'z']);
    });

    expect(result.current[0]).toEqual(['x', 'y', 'z']);
  });

  it('handles function updates', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 5));

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(6);
  });

  it('handles invalid JSON in localStorage gracefully', () => {
    localStorageMock.setItem('testKey', 'not valid json');

    // Mock console.warn to suppress warning
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { result } = renderHook(() => useLocalStorage('testKey', 'defaultValue'));

    expect(result.current[0]).toBe('defaultValue');
    expect(warnSpy).toHaveBeenCalled();

    warnSpy.mockRestore();
  });
});

describe('clearGameStorage', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('removes the game state from localStorage', () => {
    localStorageMock.setItem(STORAGE_KEY, JSON.stringify({ screen: 'game' }));

    expect(localStorageMock.getItem(STORAGE_KEY)).not.toBeNull();

    clearGameStorage();

    expect(localStorageMock.getItem(STORAGE_KEY)).toBeNull();
  });

  it('does not affect other localStorage keys', () => {
    localStorageMock.setItem(STORAGE_KEY, JSON.stringify({ screen: 'game' }));
    localStorageMock.setItem('otherKey', 'otherValue');

    clearGameStorage();

    expect(localStorageMock.getItem(STORAGE_KEY)).toBeNull();
    expect(localStorageMock.getItem('otherKey')).toBe('otherValue');
  });
});

describe('STORAGE_KEY', () => {
  it('exports the correct storage key', () => {
    expect(STORAGE_KEY).toBe('meetingBingo_gameState');
  });
});
