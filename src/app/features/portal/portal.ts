import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-portal',
  imports: [],
  templateUrl: './portal.html',
  styleUrl: './portal.css',
})
export class Portal {
  // Inyectamos el Router de Angular usando la sintaxis moderna
  private router = inject(Router);

  iniciarSesion() {
    // Aquí más adelante irá la lógica real de MSAL.
    // Por ahora, simulamos un login exitoso redirigiendo al home.
    console.log('Simulando redirección a Microsoft Entra ID...');
    this.router.navigate(['/home']);
  }
}
