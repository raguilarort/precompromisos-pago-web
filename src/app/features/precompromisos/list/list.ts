import { Component, inject } from '@angular/core';
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

  eliminar(id: string) {
    if (confirm('¿Estás seguro de que deseas eliminar este registro?')) {
      this.precompromisoService.eliminarLogico(id);
    }
  }
}
