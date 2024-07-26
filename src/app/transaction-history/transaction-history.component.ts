// src/app/components/transaction-history/transaction-history.component.ts
import { Component, OnInit, Injectable, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionService, Transaction } from './../services/transaction.service';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { DialogService } from './../services/dialog.service';

@Component({
  selector: 'app-transaction-history',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './transaction-history.component.html',
  styleUrls: ['./transaction-history.component.css'],
  providers: [TransactionService]
})
export class TransactionHistoryComponent implements OnInit {
  transactions: Transaction[] = [];
  private transactionService = inject(TransactionService);
  private dialogService = inject(DialogService);

  ngOnInit(): void {
    this.transactionService.getRecentTransactions().subscribe((data: Transaction[]) => {
      this.transactions = data;
    });
  }

  openTransactionDetails(transaction: Transaction): void {
    this.dialogService.openTransactionDetailsDialog(transaction);
  }
}
