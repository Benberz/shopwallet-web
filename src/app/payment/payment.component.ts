import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogRef } from '@angular/material/dialog';
import { TelcosTabComponent } from '../telcos-tab/telcos-tab.component';
import { CreditCardTabComponent } from '../credit-card-tab/credit-card-tab.component';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [MatTabsModule, TelcosTabComponent, CreditCardTabComponent],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css'
})
export class PaymentComponent {

  constructor(public dialogRef: MatDialogRef<PaymentComponent>) { }

  closeDialog(): void {
    this.dialogRef.close();
  }

}
