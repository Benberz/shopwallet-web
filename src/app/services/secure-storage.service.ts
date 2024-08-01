import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class SecureStorageService {
  private readonly storageKey = 'secureStorageData';
  private storage: Map<string, any> = new Map();
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: any) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    if (this.isBrowser) {
      this.initializeStorage();
      this.printStorage(); // Print storage contents when the service is instantiated
    } else {
      console.warn('localStorage is not available (not running in a browser context)');
    }
  }

  private initializeStorage(): void {
    // Load existing data from localStorage
    const storedData = localStorage.getItem(this.storageKey);
    if (storedData) {
      this.storage = new Map(Object.entries(JSON.parse(storedData)));
    }
  }

  storeData(key: string, data: any): void {
    if (this.isBrowser) {
      this.storage.set(key, data);
      this.saveToLocalStorage(); // Persist data to localStorage
    } else {
      console.warn('localStorage is not available. Data not saved.');
    }
  }

  retrieveData(key: string): any {
    return this.storage.get(key);
  }

  clearAllData(): void {
    if (this.isBrowser) {
      this.storage.clear();
      this.saveToLocalStorage(); // Clear data from localStorage
    } else {
      console.warn('localStorage is not available. Data not cleared.');
    }
  }

  private saveToLocalStorage(): void {
    if (this.isBrowser) {
      localStorage.setItem(this.storageKey, JSON.stringify(Object.fromEntries(this.storage)));
    } else {
      console.warn('localStorage is not available. Data not saved.');
    }
  }

  private printStorage(): void {
    console.log('Current contents of SecureStorageService:');
    this.storage.forEach((value, key) => {
      console.log(`${key}:`, value);
    });
  }
}
