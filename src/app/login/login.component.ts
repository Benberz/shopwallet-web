import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BsaService } from '../services/bsa.service';
import { DialogService } from '../services/dialog.service';
import { Subject } from 'rxjs';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [CommonModule, FormsModule],
  providers: [BsaService, DialogService, UserService]
})
export class LoginComponent {
  userId: string = '';

  authMessage$: Subject<string> = new Subject();
  authTimer$: Subject<string | number> = new Subject();
  authResult$: Subject<any> = new Subject();

  returnedStatus: string = '';


  constructor(private router: Router, 
    private bsaService: BsaService, 
    private dialogService: DialogService) { 
      console.log('(constructor) User ID:', this.userId);
    }
    

  login() {
    // Implement your login logic here
    console.log('User ID:', this.userId);

    if (!this.isValidUsername(this.userId)) {
      alert('Username must consist only of alphabetical characters');
      return;
    }

    // Call BSA service method for authentication
    this.bsaService.requestAuth(this.userId)
      .then((result) => {
        // On success, navigate to dashboard
        console.log('Authentication successful');
        console.log('accessToken:', result.accessToken);
        console.log('refreshToken:', result.refreshToken);
        
        this.authResult$.next(result);
        this.router.navigate(['/dashboard']);

      })
      .catch((error) => {
        // On error, handle and possibly show error message
        if (error != null){
          console.error('Authentication failed:', error);
          console.error('Authentication message:', error.errorMessage);
          //alert('Authentication failed: ' + error.errorMessage);
        }
         // You can customize error handling here
      })
      .finally(() => {
        this.setAuthMessage();
        this.setAuthTimer();
      });

      this.dialogService.openAuthStatusDialog(this.userId, this.authMessage$, this.authTimer$, this.authResult$);
  }

  navigateToOtpAuth() {
    this.router.navigate(['/auth/otp-auth']);
  }

  // Basic email format validation function
  private isValidEmail(email: string): boolean {
    // Basic check for email format, you can adjust as per your requirements
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidUsername(username: string): boolean {
    const usernameRegex = /^[A-Za-z0-9 !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/;;
    return usernameRegex.test(username);
  }

  setAuthMessage(): void {
    try {
      this.bsaService.setAuthMessage((message: string) => {
        this.authMessage$.next(message);
      });
    } catch (error) {
      console.error('Error setting authentication message:', error);
    }
  }

  setAuthTimer(): void {
    this.bsaService.setAuthTimer((time: string | number) => {
      this.authTimer$.next(time);
    });
  }

  navigateToQrAuth() {
    if (!this.userId) {
      alert('Please enter a user ID. First');
      return;
    }
    console.log('(navigateToQrAuth) User ID:', this.userId);
    this.dialogService.openQRAuthStatusDialog(this.userId);
  }

  openOtpAuthDialog() {
    if (!this.userId) {
      alert('Please enter a user ID.');
      return;
    }
    this.dialogService.openOtpDialog(this.userId);
  }

  openTotpDialog() {
    if (!this.userId) {
      alert('Please enter a user ID.');
      return;
    }

    this.dialogService.openTotpDialog(this.userId);

  }

}
