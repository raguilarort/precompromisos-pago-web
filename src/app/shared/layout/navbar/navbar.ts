import { Component, inject, computed, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router'; // Nuevas importaciones
import { Auth } from '../../../core/auth/services/auth';
import { RolSistema } from '../../../core/auth/models/auth.model'
// Importamos el nuevo componente aislado para la seleccion de ejercicios
import { SelectorEjercicio } from '../../components/selector-ejercicio/selector-ejercicio';
import { Layout } from '../layout';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, SelectorEjercicio],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  authService = inject(Auth);
  layoutService = inject(Layout);

  // 1. Exponemos el Enum completo a la vista HTML
  readonly RolSistema = RolSistema;
  
  // 2. Extraemos dinámicamente solo los IDs numéricos [1, 2, 3, 4, 5]
  // Si mañana agregas un nuevo rol al Enum, aparecerá aquí automáticamente.
  rolesIds = Object.values(RolSistema).filter(v => typeof v === 'number') as number[];

  // 3. Señal computada para renderizar dinámicamente el perfil
  // Usa el Mapeo Inverso: RolSistema[1] devuelve "Consultor"
  nombreRolActual = computed(() => {
    const rol = this.authService.usuarioAutenticado()?.rol;
    return rol !== undefined ? RolSistema[rol] : 'Cargando...';
  });

  // Ahora recibe directamente el valor del select, ya no el evento completo
  cambiarRolDev(valorSeleccionado: string) {
    const nuevoRol = Number(valorSeleccionado) as RolSistema;
    this.authService.simularCambioDeRol(nuevoRol);
  }
}
