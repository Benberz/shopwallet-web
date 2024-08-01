import { Component, OnInit } from '@angular/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { HolderBankAccountService } from './../services/holder-bank-account.service';
import { BalanceService } from './../services/balance.service';
import { SecureStorageService } from './../services/secure-storage.service';
import { BankLinkDialogComponent } from './../bank-link-dialog/bank-link-dialog.component';
import { StatusDialogComponent } from './../status-dialog/status-dialog.component';
import { BsaService } from '../services/bsa.service';
import { UserService } from '../services/user.service';
import { Subject } from 'rxjs';
import { AuthTransactionComponent } from '../auth-transaction/auth-transaction.component';

@Component({
  selector: 'app-wallet-top-up',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatDialogModule,
    MatProgressBarModule,
  ],
  templateUrl: './wallet-top-up.component.html',
  styleUrls: ['./wallet-top-up.component.css'],
  providers: [BalanceService, SecureStorageService, UserService,]

})
export class WalletTopUpComponent implements OnInit {
  amountInput!: string;
  isBankLinked: boolean = false;
  isProcessing: boolean = false;
  inputData: any;
  linkedBankDocRef!: string;
  walletBalanceDocRef!: string;
  holderRefId!: string;
  userKey!:string;

  authMessage$: Subject<string> = new Subject();
  authTimer$: Subject<string | number> = new Subject();
  authResult$: Subject<any> = new Subject();

  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<WalletTopUpComponent>,
    private router: Router,
    private holderBankAccount: HolderBankAccountService,
    private bsaService: BsaService,
    private firestore: BalanceService,
    private secureStorage: SecureStorageService){}

  ngOnInit(): void {
    this.inputData = this.secureStorage.retrieveData('inputData');
    this.linkedBankDocRef = this.inputData.linkedBankRef;
    this.walletBalanceDocRef = this.inputData.balanceRefId;
    this.holderRefId = this.inputData.holderRefId;
    this.userKey = this.inputData.userKey;

    console.log('linkedBankDocRef: ' + this.linkedBankDocRef);
    console.log('walletBalanceDocRef: ' + this.walletBalanceDocRef);
    console.log('holderRefId: ' + this.holderRefId);
    console.log('userKey: ' + this.userKey);

    if (!this.inputData.registeredBank) {
      this.snackBar.open('Link your Bank Account to your wallet first.', 'OK');
      this.showBankLinkDialog();
    } else {
      this.isBankLinked = true;
    }
  }

  onSubmit(): void {
    if (this.validate(this.amountInput)) {
      const amount = parseFloat(this.amountInput);
      this.isProcessing = true;
      this.authenticateTransaction(amount);
    }
  }

  authenticateTransaction(amount: number) {
    // Implement your login logic here
    //const userKey: string = '';
    console.log('User ID:', this.userKey);
  
    // Call BSA service method for authentication
    this.bsaService.requestAuth(this.userKey)
      .then((result) => {
        // On success, navigate to dashboard
        console.log('Authentication successful');
        console.log('accessToken:', result.accessToken);
        console.log('refreshToken:', result.refreshToken);
  
        this.authResult$.next(result);
      })
      .catch((error) => {
        // On error, handle and possibly show error message
        if (error) {
          console.error('Authentication failed:', error);
          console.error('Authentication message:', error.errorMessage);
          //alert('Authentication failed: ' + error.errorMessage);
        }
        // You can customize error handling here
      })
      .finally(() => {
        this.bsaService.setAuthMessage((message: string) => {
          this.authMessage$.next(message);
        });
  
        this.bsaService.setAuthTimer((time: string | number) => {
          this.authTimer$.next(time);
        });
      });
  
    // Open the dialog for authentication status
    const dialogRef = this.dialog.open(AuthTransactionComponent, {
      width: '100%',
      maxWidth: '400px',
      autoFocus: true,
      disableClose: true,
      panelClass: 'custom-dialog-container',
      data: { userKey: this.userKey, authMessage$: this.authMessage$, authTimer$: this.authTimer$, authResult$: this.authResult$ }
    });
  
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        console.log('Authentication process completed successfully.');
        this.holderBankAccount.getBalance(this.linkedBankDocRef).subscribe({
          next: ((balance) => {
            if (balance >= amount) {
              this.topUpWallet(amount);
            } else {
              this.isProcessing = false;
              this.showDialog('Transaction Failed', 'Insufficient balance.');
            }
          }),
          error: error => {
            this.isProcessing = false;
            this.showDialog('Transaction Failed', error);
          }
      });
      } else {
        console.log('Authentication failed, try again or report.');
        this.isProcessing = false;
        this.dialogRef.close();
      }
    });
  }
  

  validate(amountStr: string): boolean {
    if (!amountStr) {
      this.snackBar.open('Amount is required', 'OK');
      return false;
    }
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      this.snackBar.open('Invalid amount', 'OK');
      return false;
    }
    return true;
  }

  topUpWallet(amount: number): void {
    this.holderBankAccount.topUpWallet(this.walletBalanceDocRef, amount).subscribe({
      next: () => {
        //this.updateWalletBalanceInFirestore(amount);
      },
      error: error => {
        this.isProcessing = false;
        this.showDialog('Transaction Failed', error);
      }
    });
  }

  updateWalletBalanceInFirestore(amount: number): void {
    this.firestore.getBalance(this.walletBalanceDocRef).subscribe({
      next: currentBalance => {
        const newBalance = currentBalance + amount;
        this.firestore.updateBalance(this.walletBalanceDocRef, newBalance).subscribe({
          next: () => {
            this.isProcessing = false;
            this.snackBar.open('Balance updated successfully', 'OK');
            //this.showDialog('Transaction Successful', 'Top-up successful.');
            this.router.navigate(['/success']);
            this.recordTransaction(amount);
            this.dialogRef.close();
          },
          error: error => {
            this.isProcessing = false;
            console.error('Failed to update balance', error.errorMessage);
            this.snackBar.open('Failed to update balance', 'OK');
          }
        });
      },
      error: error => {
        this.isProcessing = false;
        this.snackBar.open('Failed to fetch current balance. Error: ' + error.errorMessage, 'OK');
      }
    });
  }

  recordTransaction(amount: number): void {
    const transaction = {
      title: 'Wallet Top Up',
      amount: amount,
      datetime: this.formatDate(new Date()),
      user: this.holderRefId
    };
    this.firestore.recordTransaction(transaction).subscribe({
      next:() => console.log('Transaction recorded successfully'),
      error: error => console.error('Failed to record transaction', error)
  });
  }

  showDialog(title: string, message: string): void {
    this.dialog.open(StatusDialogComponent, {
      panelClass: 'custom-dialog-container',
      data: { title: title, message: message }
    }).afterClosed().subscribe(() => {
      if (title === 'Transaction Successful') {
        this.closeDialog();
        //t his.router.navigate(['/dashboard']);
      }
    });
  }

  showBankLinkDialog(): void {
    this.dialog.open(BankLinkDialogComponent, {
      data: { holderRefId: this.holderRefId }
    }).afterClosed().subscribe(result => {
      if (result) {
        this.isBankLinked = true;
        this.snackBar.open('Bank account linked successfully', 'OK');
      }
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  private formatDate(date: Date): string {
    return date.toLocaleString('sv-SE', { timeZone: 'UTC' }).replace('T', ' ');
  }
}
