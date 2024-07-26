import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  title = 'Shopwallet Web';

  constructor(private router: Router){}

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
