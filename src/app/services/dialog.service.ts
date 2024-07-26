import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { WalletTopUpComponent } from '../wallet-top-up/wallet-top-up.component';
import { PaymentComponent } from '../payment/payment.component';
import { TransferDialogComponent } from '../transfer-dialog/transfer-dialog.component';
import { TransactionDetailsComponent } from '../transaction-details/transaction-details.component';
import { Transaction } from './transaction.service';
import { UserProfileComponent } from '../user-profile/user-profile.component';
import { AuthStatusComponent } from '../auth-status/auth-status.component';
import { Observable } from 'rxjs';
import { QrAuthStatusComponent } from '../qr-auth-status/qr-auth-status.component';
import { OtpAuthComponent } from '../otp-auth/otp-auth.component';
import { TotpDialogComponent } from '../totp-dialog/totp-dialog.component';
import { ReceiveDialogComponent } from '../receive-dialog/receive-dialog.component';

@Injectable({
  providedIn: 'root'
})

export class DialogService {

  constructor(private dialog: MatDialog) { }

  openRecieveDialog() {
    this.dialog.open(ReceiveDialogComponent, {
      width: '100%',
      maxWidth: '400px', // Ensuring the dialog does not exceed 500px
      autoFocus: false,
      panelClass: 'custom-dialog-container'
    });
  }

  openWalletTopUpDialog() {
    this.dialog.open(WalletTopUpComponent, {
      width: '100%',
      maxWidth: '600px', // Ensuring the dialog does not exceed 500px
      autoFocus: false,
      panelClass: 'custom-dialog-container'
    });
  }

  openPaymentDialog() {
    this.dialog.open(PaymentComponent, {
      width: '100%',
      maxWidth: '600px',
      autoFocus: false,
      panelClass: 'custom-dialog-container'
    });
  }

  openTransferDialog() {
    this.dialog.open(TransferDialogComponent, {
      width: '100%',
      maxWidth: '600px',
      autoFocus: false,
      panelClass: 'custom-dialog-container'
    })
  }

  openTransactionDetailsDialog(transaction: Transaction) {
    const dialogRef = this.dialog.open(TransactionDetailsComponent, {
      width: '100%',
      maxWidth: '600px',
      autoFocus: false,
      panelClass: 'custom-dialog-container',
      data: transaction
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        console.log('Dialog closed with transaction data:', result);
      } else {
        console.log('Dialog closed without any action');
      }
    });
  }

  openUserProfileDialog(userProfile: any) {
    this.dialog.open(UserProfileComponent, {
      width: '400px',
      data: userProfile
    });
  }

  openAuthStatusDialog(userKey: string,authMessage$: Observable<string>, authTimer$: Observable<string | number>, authResult$: Observable<any>) {
    const dialogRef = this.dialog.open(AuthStatusComponent, {
      width: '100%',
      maxWidth: '400px',
      autoFocus: true,
      disableClose: true,
      panelClass: 'custom-dialog-container',
      data: {userKey, authMessage$, authTimer$, authResult$}
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        console.log('Authentication process completed successfully.');
      } else {
        console.log('Authentication process was cancelled.');
      }
    });
  }

  openQRAuthStatusDialog() {
    const dialogRef = this.dialog.open(QrAuthStatusComponent, {
      width: '100%',
      maxWidth: '450px',
      autoFocus: true,
      disableClose: true,
      panelClass: 'custom-dialog-container',
      data: {}
    });
  }

  openOtpDialog() {
    this.dialog.open(OtpAuthComponent, {
      width: '100%',
      maxWidth: '450px',
      autoFocus: true,
      disableClose: true,
      panelClass: 'custom-dialog-container',
    });
  }

  openTotpDialog(userKey: string) {
    const dialogRef = this.dialog.open(TotpDialogComponent, {
      width: '300px',
      autoFocus: true,
      disableClose: true,
      
      data: { userKey: userKey }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        console.log('TOTP verified successfully:', result);
      } else {
        console.log('TOTP verification failed or dialog was closed.');
      }
    });
  }
}
