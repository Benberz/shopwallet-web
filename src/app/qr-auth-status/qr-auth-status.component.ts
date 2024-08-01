import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { BsaService } from '../services/bsa.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { AuthStatusComponent } from '../auth-status/auth-status.component';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-qr-auth-status',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './qr-auth-status.component.html',
  styleUrls: ['./qr-auth-status.component.css'],
  providers: [BsaService, UserService]
})
export class QrAuthStatusComponent implements OnInit {

  authMessage: string = 'Initializing authentication...';
  timer: string | number = '';
  errorMessage: string = '';
  userId: string = '';

  qrAuthTimer$: Subject<string | number> = new Subject();
  qrAuthMessage$: Subject<string> = new Subject();
  qrAuthResult$: Subject<string> = new Subject();

  @ViewChild('qrCanvas', { static: true }) qrCanvas!: ElementRef<HTMLCanvasElement>;

  constructor(
    private bsaService: BsaService,
    private userService: UserService,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: { userKey: string },
    private dialogRef: MatDialogRef<AuthStatusComponent>
  ) {
    if (this.data && this.data.userKey) {
      this.userId = this.data.userKey;
      console.log('Constructor userId:', this.userId);
    } else {
      console.error('No userKey provided in MAT_DIALOG_DATA');
    }
  }

  ngOnInit(): void {
    console.log('ngOnInit called');
    console.log('user ID in Dialog:', this.userId);

    this.setQRTimer();
    this.setQrStatus();

    if (this.qrCanvas) {
      this.bsaService.requestQrCallback(
        this.qrCanvas.nativeElement,
        (result) => {
          this.authMessage = 'Authentication Successful';
          this.qrAuthMessage$.next('Authentication Successful');
          console.log(`QR Auth successful ${result}`);
        },
        (errorCode, errorMsg) => {
          this.qrAuthMessage$.next(`Error Code: ${errorCode}\n Error Message: ${errorMsg}`);
        }
      );

      this.qrAuthTimer$.subscribe(timer => {
        this.timer = timer;
        if ((typeof timer === 'number' && timer <= 0) || timer == null) {
          this.authMessage = 'Timed out, Cancel and retry.';
          this.clearCanvas();
        }
      });

      this.qrAuthMessage$.subscribe(async message => {
        console.log('Qr message:', message);
        this.authMessage = message;
        if (message === 'Authentication Successful') {
          console.log('(QrAuthStatusComponent) userKey:', this.userId);
          try {
            if (this.userId) {
              await this.userService.queryHolderRefId(this.userId);
              this.dialogRef.close();
              this.router.navigate(['/dashboard']);
            } else {
              console.error('userId is undefined during authentication success handling');
              this.errorMessage = 'Failed to complete authentication.';
            }
          } catch (error) {
            console.error('Error during queryHolderRefId:', error);
            this.errorMessage = 'Failed to complete authentication.';
          }
        }
      });

    } else {
      console.error('qrCanvas is not defined');
    }
  }

  async setQRTimer(): Promise<void> {
    this.bsaService.setQrTimer((time: number | string) => {
      this.qrAuthTimer$.next(time);
    });
  }

  async setQrStatus(): Promise<void> {
    this.bsaService.setQrMessage((message: string) => {
      this.qrAuthMessage$.next(message);
    });
  }

  cancelAuth(): void {
    this.bsaService.onQrCancel(this.qrCanvas.nativeElement,
      (errorCode, errorMsg) => {
        this.authMessage = `Error Code: ${errorCode}\n Error Message: ${errorMsg}`;
      }
    );
    this.dialogRef.close();
  }

  clearCanvas(): void {
    const context = this.qrCanvas.nativeElement.getContext('2d');
    if (context) {
      context.clearRect(0, 0, this.qrCanvas.nativeElement.width, this.qrCanvas.nativeElement.height);
    }
  }
}
