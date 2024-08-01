import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { ReceiveService } from './../services/receive.service';
import QRCode from 'qrcode';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { SecureStorageService } from '../services/secure-storage.service';
import { dialogAnimation } from '../shared/dialogAnimation';
import { formatCurrency } from '@angular/common';

@Component({
  selector: 'app-receive-dialog',
  templateUrl: './receive-dialog.component.html',
  styleUrls: ['./receive-dialog.component.css'],
  animations: [dialogAnimation],
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatProgressBarModule],
  providers: [SecureStorageService, ReceiveService, MatSnackBar]
})
export class ReceiveDialogComponent implements OnInit {
  walletId: string = '';
  rawWalletId: string = '';
  qrCodeDataUrl: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  isProcessing: boolean = false;
  private transactionId: string = '';

  private holderRefId: string;

  constructor(
    private dialogRef: MatDialogRef<ReceiveDialogComponent>,
    private receiveService: ReceiveService,
    private secureStorage: SecureStorageService,
    private snackBar: MatSnackBar
  ) {
    this.holderRefId = this.secureStorage.retrieveData('inputData').holderRefId;
  }

  ngOnInit(): void {
    this.fetchWalletId();
    this.listenToTransactions();
  }

  fetchWalletId(): void {
    this.isLoading = true;
    
    this.receiveService.fetchWalletId(this.holderRefId).subscribe({
      next: ((walletId: string) => {
        this.walletId = this.rawWalletId = walletId;
        this.formatWalletId();
        this.generateQRCode();
        this.isLoading = false;
      }),
      error: error => {
        console.error('Error occurred in receiving money. Error: ', error.errorMessage);
        this.errorMessage = 'An error occurred. Please try again.';
        this.isLoading = false;
      }
  });
  }

  listenToTransactions(): void {
    this.isProcessing = true;

    this.receiveService.listenToBalanceAndTransactions(this.holderRefId).subscribe({
      next: ((transaction:any) => {
        this.isProcessing = false;
        const datetime = transaction.datetime;
        const formattedAmount = formatCurrency(transaction.amount, 'en-NG', '₦');
        const transactionDetails = `Date: ${datetime.toLocaleString()}, Sender: ${transaction.user}, Amount: ${formattedAmount}`;
        this.transactionId = transaction.id; // Store the transaction ID

        const snackBarRef: MatSnackBarRef<any> = this.snackBar.open(`Transaction received: ${transactionDetails}`, 'OK');

        snackBarRef.afterDismissed().subscribe(() => {
          this.updateTransactionStatus();
        });
      }),
      error: error => {
        this.isProcessing = false;
        console.error('Error listening to transactions:', error);
        this.snackBar.open('Error listening to transactions', 'OK');
      }
    });
  }

  updateTransactionStatus(): void {
    console.log('transaction id: ', this.transactionId);
    
    this.receiveService.updateTransactionStatus(this.transactionId, 'read').subscribe({
      next: (() => {
        console.log('Transaction status updated successfully');
      }),
      error: error => {
        console.error('Failed to update transaction status', error);
      }
    });
  }

  formatWalletId(): void {
    this.walletId = this.walletId.replace(/(.{3})(.{3})(.{4})/, '$1 $2 $3');
  }

  generateQRCode(): void {
    console.log(`wallet ID: ${this.walletId}`);
    console.log(`raw wallet ID: ${this.rawWalletId}`);
    QRCode.toDataURL(this.rawWalletId)
      .then((url: string) => {
        this.qrCodeDataUrl = url;
      })
      .catch((err: Error) => {
        this.errorMessage = 'Failed to generate QR code.';
      });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
