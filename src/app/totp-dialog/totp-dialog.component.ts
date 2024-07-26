import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BsaService } from '../services/bsa.service';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';

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

  constructor(
    private fb: FormBuilder,
    private bsaService: BsaService,
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
      this.bsaService.requestTotpCallback(
        this.data.userKey,
        totpCode,
        (result) => {
          console.log('TOTP Authentication Successful', result);
          this.dialogRef.close(result);
        },
        (errorCode, errorMsg) => {
          console.error('TOTP Authentication Failed', errorCode, errorMsg);
          alert(errorMsg); // Display error message
        }
      );
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

}
