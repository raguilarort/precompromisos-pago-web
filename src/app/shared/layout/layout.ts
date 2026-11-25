import { Service, signal } from '@angular/core';

@Service()
export class Layout {
  // Estado del menú
  sidebarExpandido = signal<boolean>(true);     // Desktop: true = 260px, false = 72px
  sidebarMovilAbierto = signal<boolean>(false); // Móvil: true = abierto, false = oculto

  toggleSidebarDesktop() {
    this.sidebarExpandido.update(v => !v);
  }

  toggleSidebarMovil() {
    this.sidebarMovilAbierto.update(v => !v);
  }

  cerrarSidebarMovil() {
    this.sidebarMovilAbierto.set(false);
  }

  abrirSidebarSiEstaColapsado() {
    if (!this.sidebarExpandido()) {
      this.sidebarExpandido.set(true);
    }
  }
}
