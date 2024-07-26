import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ReceiveService } from './../services/receive.service';
import QRCode from 'qrcode';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { SecureStorageService } from '../services/secure-storage.service';

@Component({
  selector: 'app-receive-dialog',
  templateUrl: './receive-dialog.component.html',
  styleUrls: ['./receive-dialog.component.css'],
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  providers: [SecureStorageService, ReceiveService]
})
export class ReceiveDialogComponent implements OnInit {
  walletId: string = '';
  rawWalletId: string = '';
  qrCodeDataUrl: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  private holderRefId: string;

  constructor(
    private dialogRef: MatDialogRef<ReceiveDialogComponent>,
    private receiveService: ReceiveService,
    private secureStorage: SecureStorageService
  ) {
    this.holderRefId = this.secureStorage.retrieveData('inputData').holderRefId;
  }

  ngOnInit(): void {
    this.fetchWalletId();
    this.receiveService.listenToBalanceAndTransactions(this.holderRefId);
  }

  fetchWalletId(): void {
    this.isLoading = true;
    
    this.receiveService.fetchWalletId(this.holderRefId).subscribe(
      walletId => {
        this.walletId = this.rawWalletId = walletId;
        this.formatWalletId();
        this.generateQRCode();
        this.isLoading = false;
      },
      error => {
        this.errorMessage = 'An error occurred. Please try again.';
        this.isLoading = false;
      }
    );
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
