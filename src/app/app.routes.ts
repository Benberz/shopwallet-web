import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { SuccessComponent } from './success/success.component';
import { AuthGuard } from './services/auth.guard';

export const routes: Routes = [
    {
        title: 'Home',
        path: '',
        component: HomeComponent
    },
    {
        title: 'Login',
        path: 'login',
        component: LoginComponent
    },
    {
        title: 'Dashboard',
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [AuthGuard]
    },
    {
        title: 'Profile',
        path: 'profile',
        component: UserProfileComponent, 
        canActivate: [AuthGuard]
    },
    {
        title: 'Success',
        path: 'success',
        component: SuccessComponent,
        canActivate: [AuthGuard]
    },
    {
        title: 'Not Found',
        path: '**',
        component: NotFoundComponent
    }
    
];
