import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BsaService } from '../services/bsa.service';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { AuthStatusComponent } from '../auth-status/auth-status.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-qr-auth-status',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './qr-auth-status.component.html',
  styleUrl: './qr-auth-status.component.css',
  providers: [BsaService]
})
export class QrAuthStatusComponent implements OnInit {

  authMessage: string = 'Initializing authentication...';
  timer: string | number = '';
  errorMessage: string = '';

  qrAuthTimer$: Subject<string | number> = new Subject();
  qrAuthMessage$: Subject<string> = new Subject();

  @ViewChild('qrCanvas', { static: true }) qrCanvas!: ElementRef<HTMLCanvasElement>;

  constructor(private bsaService: BsaService,
              private router: Router,
              private dialogRef: MatDialogRef<AuthStatusComponent>) {}

  ngOnInit(): void {
    console.log('ngOnInit called');

    if (this.qrCanvas) {
      this.bsaService.requestQrCallback(
        this.qrCanvas.nativeElement,
        (result) => {
          this.authMessage = 'Authentication Successful';
          setTimeout(() => { this.router.navigate(['/dashboard']); }, 2000);
          this.dialogRef.close();
        },
        (errorCode, errorMsg) => {
          if (errorCode || errorMsg) this.authMessage = 'Error Code: ' + errorCode + '\n Error Message: ' + errorMsg;
        }
      );

      this.setQRTimer();
      this.setQrStatus();

      this.qrAuthTimer$.subscribe(timer => {
        this.timer = timer;
        if ((typeof timer === 'number' && timer <= 0) || timer == null) {
          this.authMessage = 'Timed out, Cancel and retry.';
          this.clearCanvas();
        }
      });

    } else {
      console.error('qrCanvas is not defined');
    }
  }

  async setQRTimer(): Promise<void> {
    this.bsaService.setQrTimer(
      (time: number | string) => {
        this.qrAuthTimer$.next(time);
      }
    );
  }

  async setQrStatus(): Promise<void> {
    this.bsaService.setQrMessage(
      (message: string) => {
        this.authMessage = message;
      }, 
    );
  }


  cancelAuth(): void {
    this.bsaService.onQrCancel(this.qrCanvas.nativeElement,
      (errorCode, errorMsg) =>{
        this.authMessage = 'Error Code: ' + errorCode+ '\n Error Message: ' + errorMsg;
      }
    );
    this.dialogRef.close();
    this.qrAuthTimer$.unsubscribe();
    
  }

  clearCanvas(): void {
    const context = this.qrCanvas.nativeElement.getContext('2d');
    if (context) {
      context.clearRect(0, 0, this.qrCanvas.nativeElement.width, this.qrCanvas.nativeElement.height);
    }
  }

}
