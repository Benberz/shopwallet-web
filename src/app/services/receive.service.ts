import { Injectable } from '@angular/core';
import { Firestore, QuerySnapshot, collection, doc, getDoc, getDocs, limit, onSnapshot, orderBy, query, runTransaction, where } from '@angular/fire/firestore';
import { Observable, Subject, from } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ReceiveService {
  constructor(private firestore: Firestore) {}

  validateWalletId(walletId: string): Observable<any> {
    const walletHoldersRef = collection(this.firestore, 'itu_challenge_wallet_holders');
    const q = query(walletHoldersRef, where('walletId', '==', walletId));
    return from(getDocs(q));
  }

  getUserName(userId: string): Observable<any> {
    const userDocRef = doc(this.firestore, 'itu_challenge_wallet_holders', userId);
    return from(getDoc(userDocRef));
  }

  getBalance(balanceRefId: string): Observable<any> {
    const balanceDocRef = doc(this.firestore, 'itu_challenge_wallet_balances', balanceRefId);
    return from(getDoc(balanceDocRef));
  }

  listenToBalanceAndTransactions(holderRefId: string): Observable<any> {
    const transactionQuery = query(
      collection(this.firestore, 'itu_challenge_wallet_transactions'),
      where('receiver', '==', holderRefId),
      where('status', '==', 'unread'),
      orderBy('datetime', 'desc'),
      limit(1)
    );

    return new Observable(observer => {
      onSnapshot(transactionQuery, (snapshot: QuerySnapshot) => {
        snapshot.forEach(doc => {
          const data = { id: doc.id, ...doc.data() };
          observer.next(data);
        });
      }, error => {
        observer.error(error);
      });
    });
  }

  updateTransactionStatus(docId: string, status: string): Observable<void> {
    const currentDatetime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const transactionRef = doc(this.firestore, 'itu_challenge_wallet_transactions', docId);
    
    return from(runTransaction(this.firestore, async (transaction) => {
      const transactionDoc = await transaction.get(transactionRef);
      if (transactionDoc.exists()) {
        transaction.update(transactionRef, { status: status, modified: currentDatetime });
      }
    }));
  }

  fetchWalletId(holderRefId: string): Observable<string> {
    const docRef = doc(this.firestore, 'itu_challenge_wallet_holders', holderRefId);
    return from(getDoc(docRef)).pipe(
      map(docSnapshot => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          return data['walletId'];
        } else {
          throw new Error('Wallet ID not found');
        }
      })
    );
  }
}