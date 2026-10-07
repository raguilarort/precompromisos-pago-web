import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Auth } from '../../core/auth/services/auth';

@Component({
  selector: 'app-portal',
  imports: [],
  templateUrl: './portal.html',
  styleUrl: './portal.css',
})
export class Portal {
  private route = inject(ActivatedRoute);

  // Inyectamos el Router de Angular usando la sintaxis moderna
  //private router = inject(Router);
  //private authService = inject(Auth); //Se retira esta línea para que sea public y lo pueda tomar el html
  authService = inject(Auth);

  sesionExpirada = signal<boolean>(false);

  ngOnInit() {
    // Escuchamos los parámetros de la ruta al cargar el componente
    this.route.queryParams.subscribe(params => {
      if (params['session'] === 'expired') {
        this.sesionExpirada.set(true);
        
        // Opcional: Ocultar el mensaje después de 10 segundos
        setTimeout(() => this.sesionExpirada.set(false), 10000);
      }
    });
  }

  /*iniciarSesion() {
    // Aquí más adelante irá la lógica real de MSAL.
    // Por ahora, simulamos un login exitoso redirigiendo al home.
    console.log('Simulando redirección a Microsoft Entra ID...');
    this.router.navigate(['/home']);
  }*/
  iniciarSesion() {
   // Esto disparará la redirección real hacia Microsoft Entra ID
   this.authService.iniciarSesion();
  }
}
