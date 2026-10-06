import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { AvisoDTO } from './models/aviso.dto';
import { Aviso } from './services/aviso';

@Component({
  selector: 'app-avisos',
  imports: [CommonModule],
  templateUrl: './avisos.html',
  styleUrl: './avisos.css',
})
export class Avisos implements OnInit {
  private avisosService = inject(Aviso);

  listaAvisos = signal<AvisoDTO[]>([]);
  cargando = signal<boolean>(true); // Útil por si quieres mostrar un skeleton o spinner

  ngOnInit() {
    this.cargarAvisos();
  }

  private cargarAvisos() {
    this.cargando.set(true);
    this.avisosService.obtenerAvisosActivos().subscribe({
      next: (datos) => {
        this.listaAvisos.set(datos);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al obtener los avisos institucionales:', err);
        // Opcional: Podrías setear un aviso por defecto indicando que no se pudieron cargar
        this.cargando.set(false);
      }
    });
  }
}
