import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BsaService } from '../services/bsa.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-auth-status',
  standalone: true,
  templateUrl: './auth-status.component.html',
  styleUrls: ['./auth-status.component.css'],
  imports: [CommonModule]
})
export class AuthStatusComponent implements OnInit {
  authMessage: string = 'Initializing authentication...';
  timer: string | number = '';
  errorMessage: string = '';

  constructor(private router: Router, private bsaService: BsaService, private userService: UserService,
              private dialogRef: MatDialogRef<AuthStatusComponent>,
              @Inject(MAT_DIALOG_DATA) public data: { userKey: string, authMessage$: Observable<string>, 
                authTimer$: Observable<string | number>,
                authResult$: Observable<any>,
                authError$: Observable<{ errorCode: any; errorMessage: string; }>}) {}

  ngOnInit(): void {
    console.log('user ID in Dialog: ' + this.data.userKey)
    this.data.authMessage$.subscribe(async (message) =>  {
      this.authMessage = message
      if (message === 'Authentication completed') {
        try {
          await this.userService.queryHolderRefId(this.data.userKey);
          this.dialogRef.close();
          this.router.navigate(['/dashboard']);
        } catch (error) {
          console.error('Error during queryHolderRefId:', error);
          // Handle error, maybe show a message or keep the dialog open
          this.errorMessage = 'Failed to complete authentication.';
        }
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
        this.router.navigate(['/dashboard']);
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
