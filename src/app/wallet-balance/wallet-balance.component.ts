import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component } from '@angular/core';
import { BalanceService } from '../services/balance.service';
import { SecureStorageService } from '../services/secure-storage.service';

@Component({
  standalone: true,
  selector: 'app-wallet-balance',
  templateUrl: './wallet-balance.component.html',
  styleUrls: ['./wallet-balance.component.css'],
  imports: [CommonModule],
  providers: [CurrencyPipe, SecureStorageService]

})
export class WalletBalanceComponent {
  isVisible: boolean = false;
  balance: number = 0; // Sample balance, you may fetch it from a service
  formattedBalance: string = '';
  inputData: any;
  balanceRefId: any;

  constructor(private balanceService: BalanceService, 
    private currencyPipe: CurrencyPipe,
  private secureStorage: SecureStorageService) { }

  ngOnInit(): void {
    this.inputData = this.secureStorage.retrieveData('inputData'); 
    const docId = this.balanceRefId = this.inputData.balanceRefId;
    this.balanceService.getBalance(docId).subscribe(balance => {
      this.balance = balance;
      this.formattedBalance = this.currencyPipe.transform(this.balance, 'NGN', 'symbol-narrow', '1.2-2') || '';
    });
  }

  toggleVisibility() {
    this.isVisible = !this.isVisible;
  }
}
