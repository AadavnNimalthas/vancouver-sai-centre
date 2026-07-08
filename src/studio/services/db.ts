// @ts-nocheck

const DB_NAME = 'ISaiVaultDB';
const DB_VERSION = 2;
const CACHE_NAME = 'isai-media-vault-v1';

export class ISaiDB {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('bhajans')) {
          db.createObjectStore('bhajans', { keyPath: 'bhajanId' });
        }
        if (!db.objectStoreNames.contains('user_meta')) {
          db.createObjectStore('user_meta', { keyPath: 'key' });
        }
      };
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getAllBhajans(): Promise<any[]> {
    return new Promise((resolve) => {
      if (!this.db) return resolve([]);
      const transaction = this.db.transaction('bhajans', 'readonly');
      const store = transaction.objectStore('bhajans');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
    });
  }

  async saveBhajan(bhajan: any): Promise<void> {
    if (!this.db) return;
    const transaction = this.db.transaction('bhajans', 'readwrite');
    transaction.objectStore('bhajans').put(bhajan);
  }

  async removeBhajan(bhajanId: string): Promise<void> {
    if (!this.db) return;
    const transaction = this.db.transaction('bhajans', 'readwrite');
    transaction.objectStore('bhajans').delete(bhajanId);
  }

  /**
   * Downloads media to the Cache Storage.
   * Replaced cache.add(url) with a fetch + cache.put pattern to handle 
   * network errors and CORS issues more gracefully.
   */
  async downloadMedia(url: string): Promise<boolean> {
    if (!url) return false;
    
    // Safety check: Cannot download if actually offline
    if (!navigator.onLine) {
      console.error("Download failed: Device is offline.");
      return false;
    }

    try {
      const cache = await caches.open(CACHE_NAME);
      
      // Perform a manual fetch to have more control over the request
      // and better error catching for 'Failed to fetch' (CORS/Network errors)
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'omit', // Standard for public media assets
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      // Store the successful response in the cache
      await cache.put(url, response);
      return true;
    } catch (e) {
      // Common causes: CORS policy of target site, 404, or network timeout
      console.error("Media Download Error:", url, e);
      return false;
    }
  }

  async deleteMedia(url: string): Promise<void> {
    if (!url) return;
    try {
      const cache = await caches.open(CACHE_NAME);
      await cache.delete(url);
    } catch (e) {
      console.error("Delete from cache failed", e);
    }
  }

  async isMediaCached(url: string): Promise<boolean> {
    if (!url) return false;
    try {
      const cache = await caches.open(CACHE_NAME);
      const response = await cache.match(url);
      return !!response;
    } catch (e) {
      return false;
    }
  }

  async getCachedUrl(url: string): Promise<string> {
    if (!url) return '';
    try {
      const cache = await caches.open(CACHE_NAME);
      const response = await cache.match(url);
      if (response) {
        const blob = await response.blob();
        return URL.createObjectURL(blob);
      }
    } catch (e) {
      console.error("Error retrieving cached URL", e);
    }
    return url;
  }
}

export const db = new ISaiDB();
