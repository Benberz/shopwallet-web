// src/app/services/bsa.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environments';
import { UserService } from './user.service';

declare var Guardian: any;

@Injectable({
  providedIn: 'root'
})
export class BsaService {

  private bsa: any;
  private bsaReady: Promise<void>;


  constructor(@Inject(PLATFORM_ID) private platformId: Object, private userService: UserService) {
    if (isPlatformBrowser(this.platformId)) {
      this.bsaReady = this.loadScript('https://developers.fnsvalue.co.kr/bsa-js/bsa_challenge.js').then(() => {
        this.bsa = new Guardian(environment.clientKey);
      }).catch((error) => {
        console.error('Error loading BSA-JS:', error);
      });
    } else {
      this.bsaReady = Promise.reject('Not running in a browser');
    }
  }

  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.type = 'text/javascript';
      script.onload = () => resolve();
      script.onerror = (error) => reject(error);
      document.head.appendChild(script);
    });
  }

  private ensureBsaReady(): Promise<void> {
    return this.bsaReady;
  }

  isAuthenticated(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const accessToken = localStorage.getItem('accessToken');
      return !!accessToken;
    }
    return false;
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  // BSA auth with UserID
  requestAuth(userKey: string): Promise<{ accessToken: string; refreshToken: string; }> {
    return new Promise((resolve, reject) => {
      this.bsa.requestAuthCallback(userKey, (result: any) => {
        console.log('onSuccess');
        console.log('accessToken : ', result.accessToken);
        console.log('refreshToken : ', result.refreshToken);
        localStorage.setItem('accessToken', result.accessToken);
        localStorage.setItem('refreshToken', result.refreshToken);
        // this.userService.queryHolderRefId(userKey);
        resolve(result);
      }, (errorCode: any, errorMsg: string) => {
        console.log('onError');
        console.log('errorCode : ', errorCode);
        console.log('errorMsg : ', errorMsg);

        let errorMessage = 'Authentication failed. ';
        switch (errorCode) {
          case 2000:
            errorMessage += 'Invalid client key. Please check the client key.';
            break;
          case 2008:
            errorMessage += 'Unregistered user. Please check BSA sign in status.';
            break;
          case 3201:
            errorMessage += 'Not properly linked client. Please link your client website in BSA settings.';
            break;
          case 3301:
            errorMessage += 'Unspecified client login type. Contact support to resolve this issue.';
            break;
          case 5001:
            errorMessage += 'Authentication timeout. Please try requesting authentication again.';
            break;
          case 5005:
            errorMessage += 'Unauthorized user. Contact support to resolve this issue.';
            break;
          case 5006:
            errorMessage += 'Temporarily suspended user. Contact support to resolve this issue.';
            break;
          case 5007:
            errorMessage += 'Permanently suspended user. Contact support to resolve this issue.';
            break;
          case 5008:
            errorMessage += 'Withdrawn user. User accounts can be reactivated within a certain period.';
            break;
          case 2010:
            errorMessage += 'User authentication in-progress. Cancel previous authentication and request a new one.';
            break;
          case 5011:
            errorMessage += 'User authentication canceled. Please request re-authentication.';
            break;
          case 5015:
            errorMessage += 'Failed to create channel. Check the parameters.';
            break;
          case 5017:
            errorMessage += 'Failed to send push notification. Issues with FCM(Firebase Cloud Messaging). Contact support if the problem persists.';
            break;
          case 5022:
            errorMessage += 'Verification failure. Node verification failed. Contact support if the problem persists.';
            break;
          default:
            errorMessage += 'Unknown error occurred. Please try again later.';
        }
        reject({ errorCode, errorMessage });
      });
    });
  }

  // cancel an on-going user ID authentication
  cancelAuth(userKey: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.bsa.onCancel(userKey, (errorCode: any, errorMsg: any) => {
        console.log('onError');
        console.log('errorCode : ', errorCode);
        console.log('errorMsg : ', errorMsg);

        let errorMessage = 'Cancel authentication failed. ';
        switch (errorCode) {
          case 3100:
            errorMessage += 'Unregistered user. Please check the user key.';
            break;
          case 5019:
            errorMessage += 'No authentication in progress. Authentication has already been canceled, or not in progress now.';
            break;
          default:
            errorMessage += 'Unknown error occurred. Please try again later.';
        }
        reject({ errorCode, errorMessage });
      });
    });
  }

  // set auth timer, check valid BSA auth time.
  setAuthTimer(onCallback: (time: any) => void): void {
    this.bsa.setAuthTimer((time: string | number) => {
      console.log('onTime');
      console.log('time : ' + time);
      onCallback(time);
    });
  }

  // set auth message
  setAuthMessage(onCallback: (message: string) => void) {
    try {
      this.bsa.setAuthMessage((message: string) => {
        onCallback(message);
      });
    } catch (error) {
      console.error('Error setting authentication message:', error);
      // Handle error appropriately (e.g., log to a centralized service)
    }
  }

  requestQrCallback(qrCanvas: HTMLCanvasElement, successCallback: (result: any) => void, errorCallback: (errorCode: number, errorMsg: string) => void): void {
    this.ensureBsaReady().then(() => {
      this.bsa.requestQrCallback(qrCanvas, (result: { accessToken: any; refreshToken: any; }) => {
        console.log('onSuccess');
        console.log('accessToken : ', result.accessToken);
        console.log('refreshToken : ', result.refreshToken);

        localStorage.setItem('accessToken', result.accessToken);
        localStorage.setItem('refreshToken', result.refreshToken);
        successCallback(result);
      }, (errorCode: number, errorMsg: any) => {
        console.log('onError');
        console.log('errorCode : ', errorCode);
        console.log('errorMsg : ', errorMsg);
        errorCallback(errorCode, this.getErrorMessage(errorCode, errorMsg));
      });
    }).catch((error) => {
      console.error('BSA not ready:', error);
      errorCallback(0, 'BSA not ready');
    });
  }

  onQrCancel(qrCanvas: HTMLCanvasElement, errorCallback: (errorCode: number, errorMsg: string) => void): void {
    this.ensureBsaReady().then(() => {
      this.bsa.onQrCancel(qrCanvas, (errorCode: number, errorMsg: any) => {
        console.log('onError');
        console.log('errorCode : ', errorCode);
        console.log('errorMsg : ', errorMsg);
        errorCallback(errorCode, this.getCancelErrorMessage(errorCode, errorMsg));
      });
    }).catch((error) => {
      console.error('BSA not ready:', error);
      errorCallback(0, 'BSA not ready');
    });
  }

  setQrTimer(onCallback: (time: any) => void): void {
    this.ensureBsaReady().then(() => {
      this.bsa.setQrTimer((time: string | number) => {
        console.log('onTime');
        console.log('time : ' + time);
        onCallback(time);
      });
    }).catch((error) => {
      console.error('BSA not ready:', error);
    });
  }

  setQrMessage(onCallback: (message: string) => void): void {
    this.ensureBsaReady().then(() => {
      this.bsa.setQrMessage((message: string) => {
        console.log('onMessage');
        console.log('AuthStatus : ' + message);
        onCallback(message);
      });
    }).catch((error) => {
      console.error('BSA not ready:', error);
    });
  }

  private getErrorMessage(errorCode: number, errorMsg: any): string {
    // Map errorCode to message...
    return 'Mapped error message';
  }

  private getCancelErrorMessage(errorCode: number, errorMsg: any): string {
    // Map errorCode to cancel message...
    return 'Mapped cancel error message';
  }

  requestOtp(userKey: string, callback: Function, errorCallback: Function) {
    this.bsa.requestOtp(userKey, callback, errorCallback);
  }

  // BSA OTP Auth
  requestOtpCallback(otpInput: HTMLInputElement, successCallback: (result: any) => void, errorCallback: (errorCode: number, errorMsg: string) => void, codeSuccessCallback: () => void, codeErrorCallback: (errorCode: number, errorMsg: string) => void): void {
    this.bsa.requestOtpCallback(otpInput, (result: { accessToken: any; refreshToken: any; }) => {
      console.log('onSuccess');
      console.log('accessToken : ', result.accessToken);
      console.log('refreshToken : ', result.refreshToken);
      localStorage.setItem('accessToken', result.accessToken);
      localStorage.setItem('refreshToken', result.refreshToken);
      successCallback(result);
    }, (errorCode: number, errorMsg: any) => {
      console.log('onError');
      console.log('errorCode : ', errorCode);
      console.log('errorMsg : ', errorMsg);

      let errorMessage = 'OTP Authentication failed. ';
      switch (errorCode) {
        case 2000:
          errorMessage += 'Invalid client key. Please check the client key.';
          break;
        case 2008:
          errorMessage += 'Unregistered user. Please check BSA sign in status.';
          break;
        case 3201:
          errorMessage += 'Not properly linked client. Please link your client website in BSA settings.';
          break;
       
        case 5001:
          errorMessage += 'Authentication timeout. Please try requesting authentication again.';
          break;
        case 5005:
          errorMessage += 'Unauthorized user. Contact support to resolve this issue.';
          break;
        case 5006:
          errorMessage += 'Temporarily suspended user. Contact support to resolve this issue.';
          break;
        case 5007:
            errorMessage += 'Permanently suspended user. Contact support to resolve this issue.';
            break;
          case 5008:
            errorMessage += 'Withdrawn user. User accounts can be reactivated within a certain period.';
            break;
          case 2010:
            errorMessage += 'User authentication in-progress. Cancel previous authentication and request a new one.';
            break;
          case 5011:
            errorMessage += 'User authentication canceled. Please request re-authentication.';
            break;
          case 5015:
            errorMessage += 'Failed to create channel. Check the parameters.';
            break;
          case 5017:
            errorMessage += 'Failed to send push notification. Issues with FCM(Firebase Cloud Messaging). Contact support if the problem persists.';
            break;
          case 5022:
            errorMessage += 'Verification failure. Node verification failed. Contact support if the problem persists.';
            break;
          case 3005:
            errorMessage += 'OTP code verification failure. Make request for re-verification.';
            break;
          default:
            errorMessage += 'Unknown error occurred. Please try again later.';
        }
        errorCallback(errorCode, errorMessage);
      }, () => {
        console.log('onCodeSuccess');
        codeSuccessCallback();
      }, (errorCode: number, errorMsg: any) => {
        console.log('onCodeError');
        console.log('errorCode : ', errorCode);
        console.log('errorMsg : ', errorMsg);
  
        let errorMessage = 'OTP code verification failed. ';
        switch (errorCode) {
          case 2000:
            errorMessage += 'Invalid client key. Please check the client key.';
            break;
          case 3005:
            errorMessage += 'OTP code verification failure. Make request for re-verification.';
            break;
          case 3201:
            errorMessage += 'Not properly linked client. Please link your client website in BSA settings.';
            break;
          default:
            errorMessage += 'Unknown error occurred. Please try again later.';
        }
        codeErrorCallback(errorCode, errorMessage);
      });
    }

    // Cancel OTP auth
    onOtpCancel(otpInput: HTMLInputElement, errorCallback: (errorCode: number, errorMsg: string) => void): void {
      this.bsa.onOtpCancel(otpInput, (errorCode: number, errorMsg: any) => {
        console.log('onError');
        console.log('errorCode : ', errorCode);
        console.log('errorMsg : ', errorMsg);
  
        let errorMessage = 'Cancel OTP authentication failed. ';
        switch (errorCode) {
          case 3100:
            errorMessage += 'Unregistered user. Please check the user key requested.';
            break;
          case 5019:
            errorMessage += 'No authentication in progress. Authentication has already been canceled, or not in progress now.';
            break;
          default:
            errorMessage += 'Unknown error occurred. Please try again later.';
        }
        errorCallback(errorCode, errorMessage);
      });
    }

    // set OTP timer
    setOtpTimer(onCallback: (time: number) => void): void {
      this.bsa.setOtpTimer((time: any) => {
        console.log('onTime');
        console.log('time : ' + time);
        onCallback(time);
      });
    }

    // set OTP Auth Status
    setOtpMessage(onCallback: (message: string) => void): void {
      this.bsa.setOtpMessage((message: string) => {
        console.log('onMessage');
        console.log('AuthStatus : ' + message);
        onCallback(message);
      });
    }

    // Request TOTP auth
    requestTotpCallback(userKey: string, totpCode: string, successCallback: (result: { accessToken: string; refreshToken: string; }) => void, errorCallback: (errorCode: number | null, errorMsg: string | null) => void): void {
      this.ensureBsaReady().then(() => {
        this.bsa.requestTotpCallback(userKey, totpCode, (result: { accessToken: any; refreshToken: any; }) => {
          console.log('onSuccess');
          console.log('accessToken : ', result.accessToken);
          console.log('refreshToken : ', result.refreshToken);
          localStorage.setItem('accessToken', result.accessToken);
          localStorage.setItem('refreshToken', result.refreshToken);
          successCallback(result);
        }, (errorCode: number | null, errorMsg: any) => {
          console.log('onError');
          console.log('errorCode : ', errorCode);
          console.log('errorMsg : ', errorMsg);
  
          let errorMessage = 'Authentication failed. ';
          switch (errorCode) {
            case 2000:
              errorMessage += 'Invalid client key. Please check the client key.';
              break;
            case 2008:
              errorMessage += 'Unregistered user. Please check BSA sign in status.';
              break;
            case 3005:
              errorMessage += 'TOTP code verification failure. Make request for re-verification.';
              break;
            case 3201:
              errorMessage += 'Not properly linked client. Please link your client website in BSA settings.';
              break;
            case 3301:
              errorMessage += 'Unspecified client login type. Contact support to resolve this issue.';
              break;
            case 5001:
              errorMessage += 'Authentication timeout. Please try requesting authentication again.';
              break;
            case 5005:
              errorMessage += 'Unauthorized user. Contact support to resolve this issue.';
              break;
            case 5006:
              errorMessage += 'Temporarily suspended user. Contact support to resolve this issue.';
              break;
            case 5007:
              errorMessage += 'Permanently suspended user. Contact support to resolve this issue.';
              break;
            case 5008:
              errorMessage += 'Withdrawn user. User accounts can be reactivated within a certain period.';
              break;
            case 2010:
              errorMessage += 'User authentication in-progress. Cancel previous authentication and request a new one.';
              break;
            case 5011:
              errorMessage += 'User authentication canceled. Please request re-authentication.';
              break;
            case 5015:
              errorMessage += 'Failed to create channel. Check the parameters.';
              break;
            case 5017:
              errorMessage += 'Failed to send push notification. Issues with FCM(Firebase Cloud Messaging). Contact support if the problem persists.';
              break;
            case 5022:
              errorMessage += 'Verification failure. Node verification failed. Contact support if the problem persists.';
              break;
            case 5026:
              errorMessage += 'Exceeded daily limit for TOTP authentication attempt. Make request for authentication with another method.';
              break;
            default:
              errorMessage += 'Unknown error occurred. Please try again later.';
          }
          errorCallback(errorCode ?? null, errorMessage);
        });
      }).catch((error) => {
        console.error('BSA not ready:', error);
        errorCallback(null, 'BSA library not loaded properly.');
      });
    }
} // end bsa service class