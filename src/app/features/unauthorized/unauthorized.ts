import { Component, inject } from '@angular/core';
import { Auth } from '../../core/auth/services/auth';

@Component({
  selector: 'app-unauthorized',
  imports: [],
  templateUrl: './unauthorized.html',
  styleUrl: './unauthorized.css',
})
export class Unauthorized {
  authService = inject(Auth);
}
