import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc, updateDoc, addDoc, collection, runTransaction } from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BalanceService {

  constructor(private firestore: Firestore) { }

  getBalance(docId: string): Observable<number> {
    const docRef = doc(this.firestore, 'itu_challenge_wallet_balances', docId);
    return from(getDoc(docRef)).pipe(
      map(docSnap => docSnap.exists() ? (docSnap.data() as any).balance : 0)
    );
  }

  updateBalance(walletBalanceReferenceId: string, newBalance: number): Observable<void> {
    const docRef = doc(this.firestore, `itu_challenge_wallet_balances/${walletBalanceReferenceId}`);
    return new Observable(observer => {
      runTransaction(this.firestore, async transaction => {
        const docSnapshot = await transaction.get(docRef);
        const currentBalance = docSnapshot.data()?.['balance'] || 0.0;
        const updatedBalance = currentBalance + newBalance;
        transaction.update(docRef, { balance: updatedBalance, modified: new Date().toISOString() });
        return updatedBalance;
      }).then(() => {
        observer.next();
        observer.complete();
      }).catch(error => {
        observer.error(`Failed to update balance: ${error.message}`);
      });
    });
  }

  recordTransaction(transaction: any): Observable<void> {
    const transactionsCollection = collection(this.firestore, 'itu_challenge_wallet_transactions');
    return new Observable(observer => {
      addDoc(transactionsCollection, transaction).then(() => {
        observer.next();
        observer.complete();
        console.log('Transaction recorded successfully');
      }).catch(error => {
        observer.error(`Failed to record transaction: ${error.message}`);
        console.error('Failed to record transaction', error);
      });
    });
  }
}
