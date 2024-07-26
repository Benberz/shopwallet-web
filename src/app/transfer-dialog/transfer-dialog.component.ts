import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { dialogAnimation } from './../shared/dialogAnimation';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TransferService } from '../services/transfer.service';
import { SecureStorageService } from '../services/secure-storage.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressBar } from '@angular/material/progress-bar';

@Component({
  selector: 'app-transfer-dialog',
  templateUrl: './transfer-dialog.component.html',
  styleUrls: ['./transfer-dialog.component.css'],
  animations: [dialogAnimation],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatInputModule, MatSelectModule, MatButtonModule, MatProgressBar],
  providers: [TransferService, SecureStorageService]
})
export class TransferDialogComponent implements OnInit {
  transferForm!: FormGroup;
  walletBalanceDocRef!: string;
  holderRefId!: string;
  isProcessing: boolean = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<TransferDialogComponent>,
    private snackBar: MatSnackBar,
    private transferService: TransferService,
    private secureStorage: SecureStorageService
  ) {}

  ngOnInit(): void {
    const inputData = this.secureStorage.retrieveData('inputData');
    this.walletBalanceDocRef = inputData.balanceRefId;
    this.holderRefId = inputData.holderRefId;

    this.transferForm = this.fb.group({
      walletId: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
      recipientName: [{ value: '', disabled: true }, Validators.required],
      transferAmount: ['', [Validators.required, Validators.min(1)]]
    });

    this.transferForm.get('walletId')?.valueChanges.subscribe(walletId => {
      if (walletId.length === 10) {
        this.validateWalletIdAndProceed(walletId);
      } else {
        this.resetRecipient();
      }
    });
  }

  validateWalletIdAndProceed(walletId: string): void {
    this.transferService.validateWalletId(walletId)
      .then(data => {
        console.log('data: ' + data);
        this.transferForm.get('recipientName')?.setValue(data.name);
        this.transferForm.get('recipientName')?.disable();
      })
      .catch(error => {
        this.resetRecipient();
        this.snackBar.open(error.message, 'OK', { duration: 3000 });
      });
  }

  resetRecipient(): void {
    this.transferForm.get('recipientName')?.setValue('');
    // this.transferForm.get('recipientName')?.enable();
  }

  onSubmit(): void {
    if (this.transferForm.valid) {
      const walletId = this.transferForm.get('walletId')?.value;
      const amount = parseFloat(this.transferForm.get('transferAmount')?.value);
      this.checkSenderBalanceAndTransfer(walletId, amount);
    }
  }

  checkSenderBalanceAndTransfer(receiverWalletId: string, amount: number): void {
    this.isProcessing = true;
    this.transferService.checkBalance(this.walletBalanceDocRef)
      .then(data => {
        const currentBalance = data.balance;
        const senderWalletId = data.walletId;

        if (senderWalletId === receiverWalletId) {
          this.isProcessing = false;
          this.snackBar.open('You cannot transfer money to yourself', 'OK', { duration: 3000 });
          return;
        }

        if (currentBalance >= amount) {
          this.transferService.getReceiverDocumentReference(receiverWalletId)
            .then(receiverRef => {
              this.transferService.updateBalances(this.walletBalanceDocRef, receiverRef, amount, currentBalance, this.holderRefId)
                .then(() => {
                  this.isProcessing = false;
                  this.snackBar.open(`Transfer of ₦${amount.toFixed(2)} successful`, 'OK', { duration: 3000 });
                  this.dialogRef.close();
                })
                .catch(error => {
                  this.isProcessing = false;
                  this.snackBar.open(`Transaction failed: ${error.message}`, 'OK', { duration: 3000 });
                });
            })
            .catch(error => {
              this.isProcessing = false;
              this.snackBar.open(error.message, 'OK', { duration: 3000 });
            });
        } else {
          this.isProcessing = false;
          this.snackBar.open('Insufficient balance', 'OK', { duration: 3000 });
        }
      })
      .catch(error => {
        this.isProcessing = false;
        this.snackBar.open(error.message, 'OK', { duration: 3000 });
      });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
