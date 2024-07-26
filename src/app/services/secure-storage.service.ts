import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SecureStorageService {
  private storage: Map<string, any> = new Map();

  constructor() {
    // Initialize with predefined data
    this.storage.set('inputData', {
      holderRefId: 'Y27TPVvsnDhzWo0lJA7w',
      linkedBankDocRef: 'IlmcgtHObMzguuUTpeaO',
      balanceRefId: '5lvigg5YMWsXKftNWmND',
      registeredBank: 'yes',
    });
  }

  storeData(key: string, data: any): void {
    this.storage.set(key, data);
  }

  retrieveData(key: string): any {
    return this.storage.get(key);
  }
}
