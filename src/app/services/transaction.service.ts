import { inject, Injectable } from '@angular/core';
import { Firestore, collection, query, where, limit, orderBy, onSnapshot } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SecureStorageService } from './secure-storage.service';

export interface Transaction {
  date: Date;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
}

interface FirestoreTransaction {
  datetime: string; // Assuming datetime is returned as a string
  title: string;
  amount: number;
  user: string;
  receiver: string;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  private inputData: any;
  private receiverId: string | undefined;

  constructor(private firestore: Firestore, private secureStorage: SecureStorageService) { 
    this.inputData = this.secureStorage.retrieveData('inputData');
    if (this.inputData) {
      this.receiverId = this.inputData.holderRefId;
      console.log('Receiver ID:', this.receiverId);
    }
  }

  getRecentTransactions(): Observable<Transaction[]> {
    const transactionsCollection = collection(this.firestore, 'itu_challenge_wallet_transactions');

    const userTransactionsQuery = query(
      transactionsCollection,
      where('user', '==', this.receiverId),
      orderBy('datetime', 'desc'),
      limit(5)
    );

    const receivedTransactionsQuery = query(
      transactionsCollection,
      where('receiver', '==', this.receiverId),
      where('title', '==', 'Money Transfer'),
      orderBy('datetime', 'desc'),
      limit(5)
    );

    return new Observable<Transaction[]>((observer) => {
      const transactions: Transaction[] = [];

      const unsubscribeUser = onSnapshot(userTransactionsQuery, (userQuerySnapshot) => {
        console.log('User Transactions Snapshot:', userQuerySnapshot.size);
        userQuerySnapshot.forEach((doc) => {
          const data = doc.data() as FirestoreTransaction;
          transactions.push(this.mapFirestoreTransactionToTransaction(data));
        });
        observer.next(transactions);
      }, (error) => {
        console.error('User Transactions Error:', error);
      });

      const unsubscribeReceived = onSnapshot(receivedTransactionsQuery, (receivedQuerySnapshot) => {
        console.log('Received Transactions Snapshot:', receivedQuerySnapshot.size);
        receivedQuerySnapshot.forEach((doc) => {
          const data = doc.data() as FirestoreTransaction;
          transactions.push(this.mapFirestoreTransactionToTransaction(data, 'credit', 'Received'));
        });
        observer.next(transactions);
      }, (error) => {
        console.error('Received Transactions Error:', error);
      });

      return () => {
        unsubscribeUser();
        unsubscribeReceived();
      };
    });
  }

  private mapFirestoreTransactionToTransaction(data: FirestoreTransaction, type: 'credit' | 'debit' = 'debit', description: string = data.title): Transaction {
    return {
      date: new Date(data.datetime),
      description,
      amount: data.amount,
      type: (data.title === 'Money Transfer' && data.receiver === this.receiverId) || data.title === 'Wallet Top Up'
        ? 'credit'
        : 'debit'
    };
  }
}
