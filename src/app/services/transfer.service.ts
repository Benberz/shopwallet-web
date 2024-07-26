import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc, addDoc, collection, query, where, getDocs, runTransaction } from '@angular/fire/firestore';
import { DocumentReference, DocumentData } from '@angular/fire/firestore';

interface WalletHolder {
  walletId: string;
  name: string;
  status: string;
}

interface WalletBalance {
  walletId: string;
  balance: number;
  modified: Date;
}

@Injectable({
  providedIn: 'root'
})
export class TransferService {
  constructor(private firestore: Firestore) {}

  async validateWalletId(walletId: string): Promise<WalletHolder> {
    const q = query(collection(this.firestore, 'itu_challenge_wallet_holders'), where('walletId', '==', walletId), where('status', '==', 'active'));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data() as WalletHolder;
    } else {
      throw new Error('Wallet ID not found');
    }
  }

  async checkBalance(docRef: string): Promise<WalletBalance> {
    const docSnap = await getDoc(doc(this.firestore, 'itu_challenge_wallet_balances', docRef));
    if (docSnap.exists()) {
      return docSnap.data() as WalletBalance;
    } else {
      throw new Error('Failed to retrieve balance');
    }
  }

  async getReceiverDocumentReference(receiverWalletId: string): Promise<DocumentReference<DocumentData>> {
    const q = query(collection(this.firestore, 'itu_challenge_wallet_balances'), where('walletId', '==', receiverWalletId));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].ref;
    } else {
      throw new Error('Receiver wallet ID not found');
    }
  }

  async updateBalances(senderRef: string, receiverRef: DocumentReference<DocumentData>, amount: number, senderCurrentBalance: number, holderRefId: string): Promise<void> {
    const receiverSnap = await getDoc(receiverRef);
    const receiverData = receiverSnap.data() as WalletBalance;

    const newSenderBalance = senderCurrentBalance - amount;
    const newReceiverBalance = receiverData.balance + amount;

    const modifiedDate = this.formatDate(new Date());

    await runTransaction(this.firestore, async (transaction) => {
      transaction.update(doc(this.firestore, 'itu_challenge_wallet_balances', senderRef), { balance: newSenderBalance, modified: new Date() });
      transaction.update(receiverRef, { balance: newReceiverBalance, modified: modifiedDate });
    });

    await this.recordTransaction(amount, receiverRef.id, holderRefId);
  }

  private async recordTransaction(amount: number, receiverUserRefId: string, holderRefId: string): Promise<void> {
    const transaction = {
      title: 'Money Transfer',
      amount,
      datetime: this.formatDate(new Date()),
      user: holderRefId,
      receiver: receiverUserRefId,
      status: 'unread'
    };
    await addDoc(collection(this.firestore, 'itu_challenge_wallet_transactions'), transaction);
  }

  private formatDate(date: Date): string {
    return date.toLocaleString('sv-SE', { timeZone: 'UTC' }).replace('T', ' ');
  }
}