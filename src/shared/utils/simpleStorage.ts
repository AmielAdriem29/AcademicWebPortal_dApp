// shared/utils/simpleStorage.ts

export interface SimpleStorage {
  set(key: string, value: string): void;
  get(key: string): string | null;
  remove(key: string): void;
  clear(): void;
}

/**
 * Creates a simple string storage wrapper around the browser's localStorage.
 * No namespacing – caller is responsible for unique keys.
 */
export function createSimpleStorage(): SimpleStorage {
  return {
    set(key: string, value: string): void {
      localStorage.setItem(key, value);
    },
    get(key: string): string | null {
      return localStorage.getItem(key);
    },
    remove(key: string): void {
      localStorage.removeItem(key);
    },
    clear(): void {
      localStorage.clear();
    },
  };
}