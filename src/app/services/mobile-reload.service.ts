import { Injectable } from '@angular/core';
import { Firestore, collection, doc, getDoc, query, where, getDocs, runTransaction, addDoc } from '@angular/fire/firestore';
import { SecureStorageService } from './secure-storage.service';


@Injectable({
  providedIn: 'root'
})
export class MobileReloadService {
  constructor(private firestore: Firestore, private secureStorage: SecureStorageService) {}

  async fetchReceiverName(phoneNumber: string): Promise<string | null> {
    const walletHoldersRef = collection(this.firestore, 'itu_challenge_wallet_holders');
    const q = query(walletHoldersRef, where('phoneNum', '==', phoneNumber));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const document = querySnapshot.docs[0];
      return document.data()['name'] || null;
    } else {
      return null;
    }
  }

  async checkUserBalance(walletBalanceDocRef: string, amount: number): Promise<boolean> {
    const senderRef = doc(this.firestore, 'itu_challenge_wallet_balances', walletBalanceDocRef);
    const senderSnapshot = await getDoc(senderRef);
  
    if (senderSnapshot.exists()) {
      const data = senderSnapshot.data();
      const currentBalance = data ? data['balance'] : 0;
      return currentBalance >= amount;
    } else {
      throw new Error('Failed to retrieve balance');
    }
  }

  async performMobileReload(walletBalanceDocRef: string, phoneNumber: string, amount: number): Promise<void> {
    const holderRefId = this.secureStorage.retrieveData('inputData').holderRefId;

    await runTransaction(this.firestore, async (transaction) => {
      const senderRef = doc(this.firestore, 'itu_challenge_wallet_balances', walletBalanceDocRef);
      const senderSnapshot = await transaction.get(senderRef);
      const senderData = senderSnapshot.data();
      const senderCurrentBalance = senderData ? senderData['balance'] || 0.00 : 0.00;

      if (senderCurrentBalance < amount) {
        throw new Error('Insufficient balance');
      }

      const modifiedDate = this.formatDate(new Date());
      const senderNewBalance = senderCurrentBalance - amount;
      transaction.update(senderRef, { balance: senderNewBalance, modified:  modifiedDate });

      // Record transaction
      const transactionData = {
        title: 'Mobile Reload',
        amount,
        datetime: this.formatDate(new Date()),
        user: holderRefId
      };
      const transactionsRef = collection(this.firestore, 'itu_challenge_wallet_transactions');
      await addDoc(transactionsRef, transactionData);
    });
  }

  private formatDate(date: Date): string {
    return date.toLocaleString('sv-SE', { timeZone: 'UTC' }).replace('T', ' ');
  }
}
