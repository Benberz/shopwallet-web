import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc, runTransaction, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class HolderBankAccountService {

  constructor(private firestore: Firestore) { }

  getBalance(linkedReferenceId: string): Observable<number> {
    return new Observable(observer => {
      this.fetchBalanceFromApi().subscribe(
        fetchedBalance => {
          const currentDatetime = new Date().toISOString();
          const docRef = doc(this.firestore, `itu_challenge_linked_banks/${linkedReferenceId}`);
          console.log('linkedReferenceID: ' + linkedReferenceId);
          updateDoc(docRef, {
            balance: fetchedBalance,
            modified: currentDatetime
          }).then(() => {
            observer.next(fetchedBalance);
            observer.complete();
          }).catch(error => {
            console.error(`Failed to update balance: ${error.message}`);
            observer.error(`Failed to update balance: ${error.message}`);
          });
        },
        error => {
          observer.error(`Failed to fetch balance from API: ${error}`);
        }
      );
    });
  }

  topUpWallet(walletBalanceReferenceId: string, amount: number): Observable<void> {
    const docRef = doc(this.firestore, `itu_challenge_wallet_balances/${walletBalanceReferenceId}`);
    return new Observable(observer => {
      runTransaction(this.firestore, async transaction => {
        const docSnapshot = await transaction.get(docRef);
        const data = docSnapshot.data() || {};
        const currentBalance = data['balance'] || 0.0;
        const newBalance = currentBalance + amount;
        transaction.update(docRef, { balance: newBalance, modified: new Date() });
      }).then(() => {
        observer.next();
        observer.complete();
      }).catch(error => {
        observer.error(`Failed to top up wallet: ${error.message}`);
      });
    });
  }

  private fetchBalanceFromApi(): Observable<number> {
    return new Observable(observer => {
      setTimeout(() => {
        const fetchedBalance = 5000.0; // Replace with actual API call logic
        observer.next(fetchedBalance);
        observer.complete();
      }, 1000); // Simulated network delay
    });
  }
}
