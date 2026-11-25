import { Component, computed, inject, signal } from '@angular/core';
import { Layout } from '../layout';
import { Permisos } from '../../../core/auth/permisos';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SelectorEjercicio } from '../../components/selector-ejercicio/selector-ejercicio';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, SelectorEjercicio],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  layout = inject(Layout);
  private permisos = inject(Permisos);

  // Control de submenús con Angular (sin depender de Bootstrap JS)
  menuReportesAbierto = signal<boolean>(false);
  menuAdminAbierto = signal<boolean>(false);

  // Mueve aquí tu lógica actual de visibilidad que tenías en navbar.ts
  mostrarMenuReportes = computed(() => {
    // Reemplaza por tu condición real de permisos
    return true; 
  });

  mostrarMenuAdministracion = computed(() => {
    // Reemplaza por tu condición real de permisos
    return true; 
  });

  toggleReportes() {
    if (!this.layout.sidebarExpandido()) {
      this.layout.abrirSidebarSiEstaColapsado();
      this.menuReportesAbierto.set(true);
    } else {
      this.menuReportesAbierto.update(v => !v);
    }
  }

  toggleAdmin() {
    if (!this.layout.sidebarExpandido()) {
      this.layout.abrirSidebarSiEstaColapsado();
      this.menuAdminAbierto.set(true);
    } else {
      this.menuAdminAbierto.update(v => !v);
    }
  }

  navegarYCerrarMovil() {
    this.layout.cerrarSidebarMovil();
  }
}
