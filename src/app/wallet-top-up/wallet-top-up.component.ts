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
  providers: [BalanceService, SecureStorageService]

})
export class WalletTopUpComponent implements OnInit {
  amountInput!: string;
  isBankLinked: boolean = false;
  isProcessing: boolean = false;
  inputData: any;
  linkedBankDocRef!: string;
  walletBalanceDocRef!: string;
  holderRefId!: string;

  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<WalletTopUpComponent>,
    private router: Router,
    private holderBankAccount: HolderBankAccountService,
    private firestore: BalanceService,
    private secureStorage: SecureStorageService
  ) {}

  ngOnInit(): void {
    this.inputData = this.secureStorage.retrieveData('inputData');
    this.linkedBankDocRef = this.inputData.linkedBankDocRef;
    this.walletBalanceDocRef = this.inputData.balanceRefId;
    this.holderRefId = this.inputData.holderRefId;

    console.log('linkedBankDocRef: ' + this.linkedBankDocRef);
    console.log('walletBalanceDocRef: ' + this.walletBalanceDocRef);
    console.log('holderRefId: ' + this.holderRefId);

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
      this.holderBankAccount.getBalance(this.linkedBankDocRef).subscribe(
        balance => {
          if (balance >= amount) {
            this.topUpWallet(amount);
          } else {
            this.isProcessing = false;
            this.showDialog('Transaction Failed', 'Insufficient balance.');
          }
        },
        error => {
          this.isProcessing = false;
          this.showDialog('Transaction Failed', error);
        }
      );
    }
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
    this.holderBankAccount.topUpWallet(this.walletBalanceDocRef, amount).subscribe(
      () => {
        this.updateWalletBalanceInFirestore(amount);
      },
      error => {
        this.isProcessing = false;
        this.showDialog('Transaction Failed', error);
      }
    );
  }

  updateWalletBalanceInFirestore(amount: number): void {
    this.firestore.getBalance(this.walletBalanceDocRef).subscribe(
      currentBalance => {
        const newBalance = currentBalance + amount;
        this.firestore.updateBalance(this.walletBalanceDocRef, newBalance).subscribe(
          () => {
            this.isProcessing = false;
            this.snackBar.open('Balance updated successfully', 'OK');
            this.showDialog('Transaction Successful', 'Top-up successful.');
            this.recordTransaction(amount);
          },
          error => {
            this.isProcessing = false;
            this.snackBar.open('Failed to update balance', 'OK');
          }
        );
      },
      error => {
        this.isProcessing = false;
        this.snackBar.open('Failed to fetch current balance', 'OK');
      }
    );
  }

  recordTransaction(amount: number): void {
    const transaction = {
      title: 'Wallet Top Up',
      amount: amount,
      datetime: new Date().toISOString(),
      user: this.holderRefId
    };
    this.firestore.recordTransaction(transaction).subscribe(
      () => console.log('Transaction recorded successfully'),
      error => console.error('Failed to record transaction', error)
    );
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
}
