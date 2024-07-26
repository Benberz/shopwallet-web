import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Observable, startWith, map } from 'rxjs';

@Component({
  selector: 'app-bank-link-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatDialogModule,
    MatProgressBarModule,
    MatIconModule,
    MatAutocompleteModule
  ],
  templateUrl: './bank-link-dialog.component.html',
  styleUrls: ['./bank-link-dialog.component.css']
})
export class BankLinkDialogComponent implements OnInit {
  bankAccountNumber: string = '';
  bankNameControl = new FormControl('');
  filteredBanks!: Observable<string[]>;
  isLinking: boolean = false;
  banks: string[] = ['Bank A', 'Bank B', 'Bank C'];

  constructor(
    private dialogRef: MatDialogRef<BankLinkDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.filteredBanks = this.bankNameControl.valueChanges.pipe(
      startWith(''),
      map((value: any) => this.filterBanks(value))
    );
  }

  private filterBanks(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.banks.filter(bank => bank.toLowerCase().includes(filterValue));
  }

  onLinkBank(): void {
    if (this.bankAccountNumber && this.bankNameControl.value) {
      this.isLinking = true;
      // Simulate async operation
      setTimeout(() => {
        this.isLinking = false;
        this.dialogRef.close({
          bankAccountNumber: this.bankAccountNumber,
          bankName: this.bankNameControl.value,
          holderRefId: this.data.holderRefId
        });
      }, 2000);
    } else {
      this.snackBar.open('Please enter both bank name and account number', 'OK');
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}