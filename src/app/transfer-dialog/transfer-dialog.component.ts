import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
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
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { AuthTransactionComponent } from '../auth-transaction/auth-transaction.component';
import { BsaService } from '../services/bsa.service';

@Component({
  selector: 'app-transfer-dialog',
  templateUrl: './transfer-dialog.component.html',
  styleUrls: ['./transfer-dialog.component.css'],
  animations: [dialogAnimation],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatInputModule, MatSelectModule, MatButtonModule, MatProgressBar],
  providers: [TransferService, SecureStorageService, BsaService]
})
export class TransferDialogComponent implements OnInit {
  transferForm!: FormGroup;
  walletBalanceDocRef!: string;
  holderRefId!: string;
  isProcessing: boolean = false;

  userKey!:string;

  authMessage$: Subject<string> = new Subject();
  authTimer$: Subject<string | number> = new Subject();
  authResult$: Subject<any> = new Subject();

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<TransferDialogComponent>,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,
    private transferService: TransferService,
    private bsaService: BsaService,
    private secureStorage: SecureStorageService
  ) {}

  ngOnInit(): void {
    const inputData = this.secureStorage.retrieveData('inputData');
    this.walletBalanceDocRef = inputData.balanceRefId;
    this.holderRefId = inputData.holderRefId;
    this.userKey = inputData.userKey;

    console.log('userKey: ' + this.userKey);

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
      //this.checkSenderBalanceAndTransfer(walletId, amount);
      this.authenticateTransaction(walletId, amount);
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
                  //this.showDialog('Transaction Successful', 'Top-up successful.');
                  this.router.navigate(['/success']);
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

  authenticateTransaction(receiverWalletId: string, amount: number) {
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
        this.checkSenderBalanceAndTransfer(receiverWalletId, amount);
      } else {
        console.log('Authentication failed, try again or report.');
        this.isProcessing = false;
        this.dialogRef.close();
      }
    });
  }
}
