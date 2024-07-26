import { Component, OnInit } from '@angular/core';
import { DialogService } from '../services/dialog.service';
import { TransactionHistoryComponent } from '../transaction-history/transaction-history.component';
import { UserService } from '../services/user.service';
import { WalletBalanceComponent } from '../wallet-balance/wallet-balance.component';
import { Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TransactionHistoryComponent, WalletBalanceComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  providers: [DatePipe]
})
export class DashboardComponent implements OnInit {

  userProfile: any;
  currentYear: number = new Date().getFullYear();
  formattedCreatedDate: string | undefined;

  constructor(private dialogService: DialogService,
    private userService: UserService,
    private router: Router,
    private datePipe: DatePipe
    ) { }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.userService.getUserProfile().subscribe(data => {
      this.userProfile = data;
      // Format the created date
      this.formattedCreatedDate = this.datePipe.transform(this.userProfile?.created, 'MMMM yyyy') || '';
    });
  }

  formatWalletId(walletId: string): string {
    return walletId.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  }

  openWalletTopUp() {
    this.dialogService.openWalletTopUpDialog();
  }

  openPaymentDialog() {
    this.dialogService.openPaymentDialog();
  }

  openTransferDialog() {
    this.dialogService.openTransferDialog();
  }

  openRecieveDialog() {
    this.dialogService.openRecieveDialog();
  }

  openUserProfile(): void {
    const userProfile = this.userService.getUserProfile();
    this.dialogService.openUserProfileDialog(userProfile);
  }

  navigateToProfile() {
    this.router.navigate(['/profile']);
  }

  logout() {
    this.router.navigate(['/login']);
  }

}
