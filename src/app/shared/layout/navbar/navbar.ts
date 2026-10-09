import { Component, inject, computed, signal, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router'; // Nuevas importaciones
import { Auth } from '../../../core/auth/services/auth';
import { RolSistema } from '../../../core/auth/models/auth.model'
// Importamos el nuevo componente aislado para la seleccion de ejercicios
import { SelectorEjercicio } from '../../components/selector-ejercicio/selector-ejercicio';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, SelectorEjercicio],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  authService = inject(Auth);

  // 1. Exponemos el Enum completo a la vista HTML
  RolSistema = RolSistema;
  
  // 2. Extraemos dinámicamente solo los IDs numéricos [1, 2, 3, 4, 5]
  // Si mañana agregas un nuevo rol al Enum, aparecerá aquí automáticamente.
  rolesIds = Object.values(RolSistema).filter(v => typeof v === 'number') as number[];

  menuReportesAbierto = signal<boolean>(false);
  menuAdminAbierto = signal<boolean>(false);
  menuColapsado = signal(false);

  // 3. Señal computada para renderizar dinámicamente el perfil
  // Usa el Mapeo Inverso: RolSistema[1] devuelve "Consultor"
  nombreRolActual = computed(() => {
    const usuario = this.authService.usuarioAutenticado();
    return usuario ? RolSistema[usuario.rol] : 'Cargando...';
  });

  // Ahora recibe directamente el valor del select, ya no el evento completo
  cambiarRolDev(valorSeleccionado: string) {
    const nuevoRol = Number(valorSeleccionado) as RolSistema;
    this.authService.simularCambioDeRol(nuevoRol);
  }

  mostrarMenuAdministracion = computed(() => {
    const rol = this.authService.usuarioAutenticado()?.rol;
    return rol === RolSistema.Administrador;
  });

  mostrarMenuReportes = computed(() => {
    const rol = this.authService.usuarioAutenticado()?.rol;
    return rol === RolSistema.Administrador || 
           rol === RolSistema.Validador || 
           rol === RolSistema.Revisor;
  });

  toggleReportes(event: Event) {
    event.stopPropagation(); // Evita que el clic se propague al HostListener
    this.menuReportesAbierto.update(v => !v);
    this.menuAdminAbierto.set(false); // Cierra el otro menú automáticamente
  }

  toggleAdmin(event: Event) {
    event.stopPropagation();
    this.menuAdminAbierto.update(v => !v);
    this.menuReportesAbierto.set(false);
  }

  // Escucha clics en cualquier parte de la pantalla para cerrar los menús
  @HostListener('document:click')
  cerrarMenusDesplegables() {
    this.menuReportesAbierto.set(false);
    this.menuAdminAbierto.set(false);
  }
}
