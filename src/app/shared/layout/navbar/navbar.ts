import { Component, inject } from '@angular/core';
import { Auth } from '../../../core/auth/auth';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private authService = inject(Auth);
}
