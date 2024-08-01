import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { BalanceService } from '../services/balance.service';
import { SecureStorageService } from '../services/secure-storage.service';
import { AccessControlService } from '../services/access-control.service';

@Component({
  standalone: true,
  selector: 'app-wallet-balance',
  templateUrl: './wallet-balance.component.html',
  styleUrls: ['./wallet-balance.component.css'],
  imports: [CommonModule],
  providers: [CurrencyPipe, SecureStorageService]
})
export class WalletBalanceComponent implements OnInit {
  isVisible: boolean = false;
  balance: number = 0;
  formattedBalance: string = '';
  inputData: any;
  balanceRefId: any;

  constructor(
    private balanceService: BalanceService,
    private currencyPipe: CurrencyPipe,
    private secureStorage: SecureStorageService,
    private accessControlService: AccessControlService
  ) {}

  ngOnInit(): void {
    this.inputData = this.secureStorage.retrieveData('inputData');
    if (this.inputData) {
      this.balanceRefId = this.inputData.balanceRefId;
      this.balanceService.getBalance(this.balanceRefId).subscribe(balance => {
        this.balance = balance;
        this.formattedBalance = this.currencyPipe.transform(this.balance, 'NGN', 'symbol-narrow', '1.2-2') || '';
      });
    }
  }

  toggleVisibility(): void {
    if (!this.isVisible) {
      this.accessControlService.authenticateNavigation(() => {
        this.isVisible = true;
      });
    } else {
      this.isVisible = false;
    }
  }
}
