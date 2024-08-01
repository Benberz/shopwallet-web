import { Component, inject, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import {  MatDividerModule } from '@angular/material/divider'
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { SecureStorageService } from '../services/secure-storage.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
  providers: [UserService, SecureStorageService],
  standalone: true,
  imports: [
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatDividerModule
  ]
})
export class UserProfileComponent implements OnInit {
  userProfile: any;
  displayedColumns: string[] = ['field', 'value'];
  dataSource = new MatTableDataSource<any>();

  private firestore = inject(Firestore);
  private secureStorage = inject(SecureStorageService);
  private router = inject(Router);
  inputData: any;

  async ngOnInit(): Promise<void> {
    this.inputData = this.secureStorage.retrieveData('inputData');
    if (this.inputData) {
      await this.loadUserProfile();
    }
    else {
      this.router.navigate(['/dashboard']);
      return;
    }
    
  }

  async loadUserProfile(): Promise<void> {
    const userKey = this.inputData.holderRefId;
    if (userKey) {
      const docRef = doc(this.firestore, `itu_challenge_wallet_holders/${userKey}`);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        this.userProfile = docSnap.data();
        this.dataSource.data = [
          { field: 'User ID', value: this.userProfile.userKey },
          { field: 'Name', value: this.userProfile.name },
          { field: 'Email', value: this.userProfile.email },
          { field: 'Phone', value: this.userProfile.phoneNum },
          { field: 'Status', value: this.userProfile.status },
          { field: 'Wallet ID', value: this.userProfile.walletId }
        ];
      } else {
        console.log('No such document!');
      }
    }
  }

  backToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}