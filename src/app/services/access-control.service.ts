import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { AuthTransactionComponent } from '../auth-transaction/auth-transaction.component';
import { MatDialog } from '@angular/material/dialog';
import { BsaService } from './bsa.service';
import { SecureStorageService } from './secure-storage.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class AccessControlService {

  userKey!:string;
  authMessage$: Subject<string> = new Subject();
  authTimer$: Subject<string | number> = new Subject();
  authResult$: Subject<any> = new Subject();

  constructor(
    private secureStorage: SecureStorageService,
    private bsaService: BsaService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,) { }

  authenticateNavigation(callback: () => void) {
    // Implement your login logic here
    const inputData = this.secureStorage.retrieveData('inputData');
    this.userKey = inputData.userKey;
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
        callback();
      } else {
        console.log('Authentication failed, try again or report.');
        // alert('Authentication failed, try again or report.');
        this.snackBar.open('Authentication failed, try again or report.', 'OK');
      }
    });
  }
}
