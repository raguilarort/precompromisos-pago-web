import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';

interface AvisoDTO {
  id: number;
  titulo: string;
  mensaje: string;
  fecha: Date;
  prioridad: 'ALTA' | 'MEDIA' | 'BAJA';
}

@Component({
  selector: 'app-avisos',
  imports: [CommonModule],
  templateUrl: './avisos.html',
  styleUrl: './avisos.css',
})
export class Avisos implements OnInit {
  listaAvisos = signal<AvisoDTO[]>([]);

  ngOnInit() {
    // Simulación de respuesta del backend
    this.listaAvisos.set([
      { id: 1, titulo: 'Cierre Presupuestal', mensaje: 'El límite para registrar precompromisos de este mes es el día 25.', fecha: new Date(), prioridad: 'ALTA' },
      { id: 2, titulo: 'Mantenimiento del Sistema', mensaje: 'El viernes a las 20:00 hrs el sistema tendrá una intermitencia de 30 minutos.', fecha: new Date(), prioridad: 'MEDIA' }
    ]);
  }
}
