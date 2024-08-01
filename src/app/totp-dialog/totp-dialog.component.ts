import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BsaService } from '../services/bsa.service';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-totp-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule],
  templateUrl: './totp-dialog.component.html',
  styleUrl: './totp-dialog.component.css',
  encapsulation: ViewEncapsulation.Emulated
})
export class TotpDialogComponent {

  totpForm: FormGroup;

  authMessage: string = '';
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private bsaService: BsaService,
    private router: Router,
    private userService: UserService,
    public dialogRef: MatDialogRef<TotpDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { userKey: string,}
  ) {
    this.totpForm = this.fb.group({
      totpCode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });
  }

  onSubmit() {
    if (this.totpForm.valid) {
      const totpCode = this.totpForm.get('totpCode')?.value;
      console.log('TOTP CODE: ', totpCode);

      this.authMessage = 'Verifying TOTP...';
      this.bsaService.requestTotpCallback(
        this.data.userKey,
        totpCode,
        (result) => {
          console.log('TOTP Authentication Successful', result);
          this.authMessage = 'TOTP Authentication Successful';
          
          this.userService.queryHolderRefId(this.data.userKey);
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 2000);
          this.dialogRef.close(result);
        },
        (errorCode, errorMsg) => {
          console.error('TOTP Authentication Failed', errorCode, errorMsg);
          this.errorMessage = `[${errorCode}] : ${errorMsg}`;
          this.authMessage = '';
          // alert(errorMsg); // Display error message
        }
      );
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

}
