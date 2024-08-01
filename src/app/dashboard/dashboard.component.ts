import { Component, OnInit } from '@angular/core';
import { DialogService } from '../services/dialog.service';
import { TransactionHistoryComponent } from '../transaction-history/transaction-history.component';
import { UserService } from '../services/user.service';
import { WalletBalanceComponent } from '../wallet-balance/wallet-balance.component';
import { Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { BsaService } from '../services/bsa.service';
import { SecureStorageService } from '../services/secure-storage.service';
import { AccessControlService } from '../services/access-control.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TransactionHistoryComponent, WalletBalanceComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  providers: [DatePipe, UserService, BsaService, DialogService, SecureStorageService]
})
export class DashboardComponent implements OnInit {

  userProfile: any;
  currentYear: number = new Date().getFullYear();
  formattedCreatedDate: string | undefined;

  constructor(private dialogService: DialogService,
    private accessControlService: AccessControlService,
    private userService: UserService,
    private bsaService: BsaService,
    private secureStorage: SecureStorageService,
    private router: Router,
    private datePipe: DatePipe
    ) { }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  logout(): void {
    this.bsaService.logout();
    this.secureStorage.clearAllData();
    this.router.navigate(['/login']); // Navigate to the login page or any other page
  }

  loadUserProfile(): void {
    this.userService.getUserProfile().subscribe((data: any) => {
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

  openMobileReloadDialog() {
    this.dialogService.openMobileReloadDialog();
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
    // this.router.navigate(['/profile']);
    this.accessControlService.authenticateNavigation(() => this.router.navigate(['/profile']));
  }

  

}
