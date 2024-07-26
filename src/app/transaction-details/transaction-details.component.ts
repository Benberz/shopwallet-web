// src/app/components/transaction-details/transaction-details.component.ts
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Transaction } from './../services/transaction.service';
import { CommonModule, CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-transaction-details',
  standalone: true,
  templateUrl: './transaction-details.component.html',
  styleUrls: ['./transaction-details.component.css'],
  imports: [CommonModule, CurrencyPipe],
  providers: [CurrencyPipe]
})
export class TransactionDetailsComponent {
  
  constructor(@Inject(MAT_DIALOG_DATA) public data: Transaction, 
  private dialogRef: MatDialogRef<TransactionDetailsComponent>) { }

  closeDialog(): void {
    this.dialogRef.close();
  }

  onSubmit() {
    this.dialogRef.close();
  }
}
