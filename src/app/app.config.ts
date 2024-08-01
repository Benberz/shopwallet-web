import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { environment } from '../environments/environments';
import { getAnalytics, provideAnalytics, ScreenTrackingService } from '@angular/fire/analytics';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes), 
    provideClientHydration(), 
    provideAnimationsAsync(),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()), 
    provideAnimationsAsync(), provideFirebaseApp(() => initializeApp({"projectId":"shopwallet-backoffice","appId":"1:603111437362:web:8a173d4734765ce837782b","storageBucket":"shopwallet-backoffice.appspot.com","apiKey":"AIzaSyDXIaeqc4M4VBgOQP-N9hgCfd6IyjqshW8","authDomain":"shopwallet-backoffice.firebaseapp.com","messagingSenderId":"603111437362","measurementId":"G-8WLLBWV410"})), provideAnalytics(() => getAnalytics()), ScreenTrackingService, provideFirebaseApp(() => initializeApp({"projectId":"shopwallet-backoffice","appId":"1:603111437362:web:8a173d4734765ce837782b","storageBucket":"shopwallet-backoffice.appspot.com","apiKey":"AIzaSyDXIaeqc4M4VBgOQP-N9hgCfd6IyjqshW8","authDomain":"shopwallet-backoffice.firebaseapp.com","messagingSenderId":"603111437362","measurementId":"G-8WLLBWV410"})), provideFirestore(() => getFirestore()),
  ]
};
