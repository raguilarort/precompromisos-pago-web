import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../../shared/layout/navbar/navbar';
import { SessionManager } from '../../core/auth/services/session-manager';

@Component({
  selector: 'app-home',
  imports: [RouterOutlet, Navbar],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  sessionManager = inject(SessionManager);
}
