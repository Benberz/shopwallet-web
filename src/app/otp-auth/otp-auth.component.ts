import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { BsaService } from '../services/bsa.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-otp-auth',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './otp-auth.component.html',
  styleUrl: './otp-auth.component.css'
})
export class OtpAuthComponent implements OnInit {

  authStatus: string = '';
  timer: string | number = '';

  otpAuthTimer$: Subject<string | number> = new Subject();
  otpAuthMessage$: Subject<string> = new Subject();

  otpCode: string = '';

  // @ViewChild('otpInput', { static: true }) otpInput!: ElementRef<HTMLInputElement>;

  constructor(private bsaService: BsaService, 
    private router: Router, 
    private userService: UserService,
    private dialogRef: MatDialogRef<OtpAuthComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { userKey: string,}) { }

  ngOnInit(): void {
    // this.requestOtp()
  };

  verifyOtp(otpInput: HTMLInputElement): void {

    const otpCode = otpInput.value;

    if (otpCode.length != 6) {
      alert("Please enter a 6-digit otp code.");
      return;
    }

    this.setOtpTimer();
    this.setOtpMessage();
    
    this.bsaService.requestOtpCallback(otpInput,
      async (result) => {
        this.otpAuthMessage$.next('Authentication Successful');
        console.log('Access Token: ', result.accessToken);

        await this.userService.queryHolderRefId(this.data.userKey);
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
        this.dialogRef.close();
      },
      (errorCode, errorMsg) => {
        this.otpAuthMessage$.next(`Error Code: ${errorCode}\nError Message: ${errorMsg}`);
      },
      () => {
        this.otpAuthMessage$.next('OTP Verification Successful');
        console.log('OTP Verification Successful');
      },
      (errorCode, errorMsg) => {
        this.otpAuthMessage$.next(`Error Code: ${errorCode}\nError Message: ${errorMsg}`);
      }
    );

    this.otpAuthTimer$.subscribe(timer => {
      this.timer = timer;
      if ((typeof timer === 'number' && timer <= 0) || timer == null) {
        this.authStatus = 'Timed out, Cancel and retry.';
      }
    });

    this.otpAuthMessage$.subscribe(async message => {
      this.authStatus = message;
      // if (message === 'OTP Verification Successful') {
      //   console.log('(otpAuthMessage$.subscribe) userKey:', this.data.userKey);
      //   try {
      //     if (this.data.userKey) {
      //       await this.userService.queryHolderRefId(this.data.userKey);
      //       this.dialogRef.close();
      //       this.router.navigate(['/dashboard']);
      //     } else {
      //       console.error('userId is undefined during authentication success handling');
      //       //this.errorMessage = 'Failed to complete authentication.';
      //     }
      //   } catch (error) {
      //     console.error('Error during queryHolderRefId:', error);
      //     //this.errorMessage = 'Failed to complete authentication.';
      //   }
      // } // end of if
    })
  }

  cancelOtp(otpInput: HTMLInputElement): void {
    this.bsaService.onOtpCancel(otpInput, (errorCode, errorMsg) => {
      this.authStatus = `Error Code: ${errorCode}\nError Message: ${errorMsg}`;
    });

    this.dialogRef.close();
    this.otpAuthTimer$.unsubscribe();
  }

  setOtpTimer(): void {
    this.bsaService.setOtpTimer((time: number) => {
      this.otpAuthTimer$.next(time);
    });
  }

  setOtpMessage(): void {
    this.bsaService.setOtpMessage((message: string) => {
      this.otpAuthMessage$.next(message);
    });
  }
}
