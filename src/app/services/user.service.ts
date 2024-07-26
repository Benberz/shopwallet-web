import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { SecureStorageService } from './secure-storage.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  inputData: any;

  constructor(private firestore: Firestore,
    private secureStorage: SecureStorageService) {}

  getUserProfile(): Observable<any> {
    // Retrieve document reference from session or local storage
    this.inputData = this.secureStorage.retrieveData('inputData');
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
  }
}
