import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { BsaService } from '../services/bsa.service';

@Component({
  selector: 'app-auth-transaction',
  standalone: true,
  imports: [],
  templateUrl: './auth-transaction.component.html',
  styleUrl: './auth-transaction.component.css'
})
export class AuthTransactionComponent {

  authMessage: string = 'Initializing authentication...';
  timer: string | number = '';
  errorMessage: string = '';

  constructor(private bsaService: BsaService,
    private dialogRef: MatDialogRef<AuthTransactionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { userKey: string, authMessage$: Observable<string>, 
      authTimer$: Observable<string | number>,
      authResult$: Observable<any>,
      authError$: Observable<{ errorCode: any; errorMessage: string; }>}) {}

      ngOnInit(): void {
        console.log('user ID in Dialog: ' + this.data.userKey)
        this.data.authMessage$.subscribe(async (message) =>  {
          this.authMessage = message
          if (message === 'Authentication completed') {
            this.dialogRef.close(true);
          }      
        });
        
        this.data.authTimer$.subscribe(timer => {
          this.timer = timer;
          if ((typeof timer === 'number' && timer <= 0) || (timer == null)) {
            //this.dialogRef.close();
            this.authMessage = 'Timed out, Cancel and retry.'
          }
        });
    
        this.data.authResult$.subscribe(result => {
          if (result) {
            this.authMessage = 'Authentication Successful';
            this.timer = '';  // Disable the timer display
            this.dialogRef.close();  // Close the dialog after 2 seconds
          }
        });
    
        this.data.authError$.subscribe(error => {
          if (error) {
            this.errorMessage = error.errorMessage;
            this.authMessage = `Authentication Failed\n Error Code: ${error.errorCode}\n Error Message: ${error.errorMessage}`;
            // this.timer = '';  // Disable the timer display
          }
        });
      }

  cancelAuth(): void {
    this.bsaService.cancelAuth(this.data.userKey).then(() => {
      console.log('Cancel authentication successfully');
    }).catch(error => {
      console.error('Cancel authentication failed:', error);
    });
    this.dialogRef.close();
  }

}
