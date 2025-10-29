import { StorageService } from '../types';

/**
 * Local Storage Service implementation following Single Responsibility Principle
 * Handles all local storage operations with proper error handling
 */
export class LocalStorageService implements StorageService {
  private readonly prefix = 'wit-widget-';

  save(key: string, data: unknown): void {
    try {
      const serializedData = JSON.stringify(data);
      localStorage.setItem(this.prefix + key, serializedData);
    } catch (error) {
      console.error('Failed to save data to localStorage:', error);
      throw new Error(`Storage save failed for key: ${key}`);
    }
  }

  load<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.prefix + key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Failed to load data from localStorage:', error);
      return null;
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.error('Failed to remove data from localStorage:', error);
    }
  }

  clear(): void {
    try {
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith(this.prefix)
      );
      keys.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }
}
