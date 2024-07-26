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
    this.receiverId = this.inputData.holderRefId;
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
      const unsubscribeUser = onSnapshot(userTransactionsQuery, (userQuerySnapshot) => {
        const transactions: Transaction[] = [];
        userQuerySnapshot.forEach((doc) => {
          const data = doc.data() as FirestoreTransaction;
          transactions.push(this.mapFirestoreTransactionToTransaction(data));
        });
        observer.next(transactions);
      });

      const unsubscribeReceived = onSnapshot(receivedTransactionsQuery, (receivedQuerySnapshot) => {
        const transactions: Transaction[] = [];
        receivedQuerySnapshot.forEach((doc) => {
          const data = doc.data() as FirestoreTransaction;
          transactions.push(this.mapFirestoreTransactionToTransaction(data, 'credit', 'Received'));
        });
        observer.next(transactions);
      });

      return () => {
        unsubscribeUser();
        unsubscribeReceived();
      };
    }).pipe(
      map((transactions: Transaction[]) => {
        return transactions.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 10);
      })
    );
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
