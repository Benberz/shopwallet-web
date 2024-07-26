import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BsaService } from '../services/bsa.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-otp-auth',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './otp-auth.component.html',
  styleUrl: './otp-auth.component.css'
})
export class OtpAuthComponent implements OnInit {

  authStatus: string = '';
  timer: string | number = '';

  otpAuthTimer$: Subject<string | number> = new Subject();

  constructor(private bsaService: BsaService, private router: Router, private dialogRef: MatDialogRef<OtpAuthComponent>) { }

  ngOnInit(): void {
    // this.requestOtp()
  };

  verifyOtp(otpInput: HTMLInputElement): void {
    this.bsaService.requestOtpCallback(otpInput,
      (result) => {
        this.authStatus = 'Authentication Successful';
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
      },
      (errorCode, errorMsg) => {
        this.authStatus = `Error Code: ${errorCode}\nError Message: ${errorMsg}`;
      },
      () => {
        this.authStatus = 'OTP Verification Successful';
      },
      (errorCode, errorMsg) => {
        this.authStatus = `Error Code: ${errorCode}\nError Message: ${errorMsg}`;
      }
    );

    this.setOtpTimer();
    this.setOtpMessage();

    this.otpAuthTimer$.subscribe(timer => {
      this.timer = timer;
      if ((typeof timer === 'number' && timer <= 0) || timer == null) {
        this.authStatus = 'Timed out, Cancel and retry.';
      }
    });
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
      this.authStatus = message;
    });
  }
}
