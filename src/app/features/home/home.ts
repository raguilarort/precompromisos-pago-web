import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../../shared/layout/navbar/navbar';
import { Sidebar } from '../../shared/layout/sidebar/sidebar';
import { SessionManager } from '../../core/auth/services/session-manager';
import { Auth } from '../../core/auth/services/auth';
import { Layout } from '../../shared/layout/layout';

@Component({
  selector: 'app-home',
  imports: [RouterOutlet, Navbar, Sidebar],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  authService = inject(Auth);
  sessionManager = inject(SessionManager);
  layoutService = inject(Layout);
}
