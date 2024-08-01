import { Injectable } from '@angular/core';
import { catchError, from, map, Observable, of, Subject, throwError } from 'rxjs';
import { Firestore, collection, doc, getDoc, getDocs, query, where } from '@angular/fire/firestore';
import { SecureStorageService } from './secure-storage.service';
import { BsaService } from './bsa.service';
import { AuthTransactionComponent } from '../auth-transaction/auth-transaction.component';
import { MatDialog } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  inputData: any;

  constructor(private firestore: Firestore,
    private secureStorage: SecureStorageService,) {
      this.inputData = this.secureStorage.retrieveData('inputData');
    }

  getUserProfile(): Observable<any> {
    // Retrieve document reference from session or local storage
    
    if (this.inputData) {

    
      const documentId = this.inputData.holderRefId;
      
      if (!documentId) {
        return of(null); // No document ID found
      }

      const docRef = doc(this.firestore, 'itu_challenge_wallet_holders', documentId);

      return new Observable(observer => {
        getDoc(docRef)
          .then((docSnapshot) => {
            if (docSnapshot.exists()) {
              observer.next(docSnapshot.data());
            } else {
              observer.error('No such document!');
            }
          })
          .catch((error) => {
            observer.error(error);
          });
      });
    } else {
      return of(null);
    }
  }

  async queryHolderRefId(email: string): Promise<void> {
    console.log('email in queryHolderRefId: ', email);
  
    const db = this.firestore;
    const holderQuery = query(
      collection(db, 'itu_challenge_wallet_holders'),
      where('email', '==', email),
      where('status', '==', 'active')
    );
  
    return getDocs(holderQuery).then(task => {
      if (!task.empty) {
        const holderRef = task.docs[0].ref;
        this.inputData = {
          ...this.inputData,
          userKey: email, 
          holderRefId: holderRef.id
        };
        this.secureStorage.storeData('inputData', this.inputData);
  
        console.log('holderRef.id in queryHolderRefId: ', holderRef.id);
        return this.queryBalanceRefId(holderRef.id);
      } else {
        console.error('Failed to find holderRefId');
        return Promise.reject('HolderRefId not found');
      }
    }).catch(e => {
      console.error('Error querying holderRefId:', e);
      return Promise.reject(e);
    });
  }
  
  private async queryBalanceRefId(holderRefId: string): Promise<void> {
    const db = this.firestore;
    const balanceQuery = query(
      collection(db, 'itu_challenge_wallet_balances'),
      where('user', '==', holderRefId)
    );
  
    return getDocs(balanceQuery).then(task => {
      if (!task.empty) {
        const balanceRef = task.docs[0].ref;
        const walletId = task.docs[0].get('walletId');
        this.inputData = {
          ...this.inputData,
          balanceRefId: balanceRef.id,
          walletId: walletId
        };
  
        console.log('balanceRef.id, in queryBalanceRefId: ', balanceRef.id);
        this.secureStorage.storeData('inputData', this.inputData);
        return this.queryLinkedBankRef(holderRefId);
      } else {
        console.error('Failed to find balanceRefId');
        return Promise.reject('BalanceRefId not found');
      }
    }).catch(e => {
      console.error('Error querying balanceRefId:', e);
      return Promise.reject(e);
    });
  }
  
  private async queryLinkedBankRef(holderRefId: string): Promise<void> {
    const db = this.firestore;
    const bankQuery = query(
      collection(db, 'itu_challenge_linked_banks'),
      where('user', '==', holderRefId)
    );
  
    return getDocs(bankQuery).then(task => {
      if (!task.empty) {
        const linkedBankRef = task.docs[0].ref;
        this.inputData = {
          ...this.inputData,
          linkedBankRef: linkedBankRef.id,
          registeredBank: 'yes'
        };
  
        console.log('linkedBankRef.id in queryLinkedBankRef: ', linkedBankRef.id);
        this.secureStorage.storeData('inputData', this.inputData);
      } else {
        console.warn('Link your Bank Account when you want to add funds to your wallet');
        this.inputData = { ...this.inputData, linkedBankRef: null, registeredBank: 'no'};
        this.secureStorage.storeData('inputData', this.inputData);
      }
    }).catch(e => {
      console.warn('Error querying linkedBankRef:', e);
      return Promise.resolve(); // resolve even if the linked bank is not found, since it's not critical
    });
  }
}
