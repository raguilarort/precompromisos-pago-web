import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { PrecompromisoService } from '../services/precompromisos/precompromisos';

@Component({
  selector: 'app-list',
  imports: [RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './list.html',
  styleUrl: './list.css',
})
export class List {
  precompromisoService = inject(PrecompromisoService);
  
  // Exponemos la Signal directamente a la vista
  listaCompromisos = this.precompromisoService.compromisosActivos;

  // Signal que almacena el texto del buscador
  terminoBusqueda = signal<string>('');

  // Señal computada que filtra la lista en tiempo real
  compromisosFiltrados = computed(() => {
    const termino = this.terminoBusqueda().toLowerCase().trim();
    const compromisos = this.listaCompromisos();

    // Si el buscador está vacío, regresamos la tabla completa
    if (!termino) return compromisos;

    // Filtramos buscando coincidencias en folio o cliente
    return compromisos.filter(c => 
      c.folio.toLowerCase().includes(termino) ||
      c.cliente.toLowerCase().includes(termino)
    );
  });

  eliminar(id: string) {
    if (confirm('¿Estás seguro de que deseas eliminar este registro?')) {
      this.precompromisoService.eliminarLogico(id);
    }
  }
}
