import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SecureStorageService } from './../services/secure-storage.service';
import { MobileReloadService } from '../services/mobile-reload.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressBar } from '@angular/material/progress-bar';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { dialogAnimation } from '../shared/dialogAnimation';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { AuthTransactionComponent } from '../auth-transaction/auth-transaction.component';
import { BsaService } from '../services/bsa.service';

@Component({
  selector: 'app-mobile-reload-dialog',
  standalone: true,
  templateUrl: './mobile-reload-dialog.component.html',
  styleUrls: ['./mobile-reload-dialog.component.css'],
  animations: [dialogAnimation],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatProgressBar
  ],
  providers: [MobileReloadService]
})
export class MobileReloadDialogComponent implements OnInit {
  mobileReloadForm!: FormGroup;
  isLoading: boolean = false;
  errorMessage: string = '';
  minAmount: number = 0.01;

  userKey!:string;

  authMessage$: Subject<string> = new Subject();
  authTimer$: Subject<string | number> = new Subject();
  authResult$: Subject<any> = new Subject();
  walletBalanceDocRef: any;

  constructor(
    private dialogRef: MatDialogRef<MobileReloadDialogComponent>,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router,
    private dialog: MatDialog,
    private mobileReloadService: MobileReloadService,
    private bsaService: BsaService,
    private secureStorage: SecureStorageService
  ) {}

  ngOnInit(): void {
    const inputData = this.secureStorage.retrieveData('inputData');
    this.walletBalanceDocRef = inputData.balanceRefId;
    this.userKey = inputData.userKey;

    this.mobileReloadForm = this.fb.group({
      phoneNumber: ['', [Validators.required, Validators.pattern(/^(\d{11})$/)]],
      receiverName: [{ value: '', disabled: true }],
      creditAmount: ['', [Validators.required, Validators.min(this.minAmount)]]
    });

    this.mobileReloadForm.get('phoneNumber')?.valueChanges.subscribe(phoneNumber => {
      if (phoneNumber.length === 11) {
        this.validatePhoneNumberAndFetchName(phoneNumber);
      } else {
        this.resetReceiverName();
      }
    });
  }

  validatePhoneNumberAndFetchName(phoneNumber: string): void {
    this.isLoading = true;
    this.mobileReloadService.fetchReceiverName(phoneNumber)
      .then(name => {
        if (name) {
          this.mobileReloadForm.get('receiverName')?.setValue(name);
          this.mobileReloadForm.get('receiverName')?.disable();
        } else {
          this.resetReceiverName();
          this.snackBar.open('Phone number not found', 'OK', { duration: 3000 });
        }
      })
      .catch(error => {
        this.resetReceiverName();
        this.snackBar.open('An error occurred. Please try again.', 'OK', { duration: 3000 });
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  resetReceiverName(): void {
    this.mobileReloadForm.get('receiverName')?.setValue('');
  }

  onSubmit(): void {
    if (this.mobileReloadForm.invalid) {
      return;
    }

    this.isLoading = true;
    const phoneNumber = this.mobileReloadForm.get('phoneNumber')?.value;
    const amount = parseFloat(this.mobileReloadForm.get('creditAmount')?.value);

    this.authenticateTransaction(this.walletBalanceDocRef, phoneNumber, amount);
    
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  authenticateTransaction(walletBalanceDocRef: string, phoneNumber: string, amount: number) {
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
        // this.checkSenderBalanceAndTransfer(receiverWalletId, amount);
        this.mobileReloadService.checkUserBalance(walletBalanceDocRef, amount)
        .then(isBalanceSufficient => {
          if (isBalanceSufficient) {
            this.mobileReloadService.performMobileReload(walletBalanceDocRef, phoneNumber, amount)
              .then(() => {
                this.snackBar.open(`Reload of ₦${amount.toFixed(2)} to ${phoneNumber} was successful.`, 'OK', { duration: 3000 });
                this.router.navigate(['/success']);
                this.dialogRef.close();
              })
              .catch(error => {
                this.snackBar.open(`Transaction failed: ${error.message}`, 'OK', { duration: 5000 });
              });
          } else {
            this.snackBar.open('Insufficient balance', 'OK', { duration: 5000 });
          }
        })
        .catch(error => {
          this.snackBar.open(`An error occurred: ${error.message}`, 'OK', { duration: 5000 });
        })
        .finally(() => {
          //this.isLoading = false;
        });
      } else {
        console.log('Authentication failed, try again or report.');
        this.isLoading = false;
        this.dialogRef.close();
      }
    });
  }
}