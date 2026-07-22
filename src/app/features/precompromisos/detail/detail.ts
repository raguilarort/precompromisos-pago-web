import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { PrecompromisoService } from '../services/precompromisos/precompromisos';
import { Precompromiso } from '../models/precompromiso.model';

@Component({
  selector: 'app-detail',
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './detail.html',
  styleUrl: './detail.css',
})
export class Detail implements OnInit {
  private route = inject(ActivatedRoute);
  private precompromisoService = inject(PrecompromisoService);

  // Signal para almacenar los datos del precompromiso
  registro = signal<Precompromiso | undefined>(undefined);

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      // Convertimos el ID de la ruta (string) a número para buscarlo
      const data = this.precompromisoService.obtenerPorId(Number(idParam));
      this.registro.set(data);
    }
  }
}