import { Component, signal, inject,OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Auth } from './core/auth/auth';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('precompromisos-pago-web');
  private authService = inject(Auth);
  
  ngOnInit() {
    // Si esta línea no se ejecuta al cargar la app, MSAL jamás leerá la URL
    this.authService.procesarRespuestaLogin();
  }
}
