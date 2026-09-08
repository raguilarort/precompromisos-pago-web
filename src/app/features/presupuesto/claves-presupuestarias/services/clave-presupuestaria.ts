import { Service, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment.development';

import { ClavePresupuestariaDTO } from '../model/clave-presupuestaria.dto';
import { ClavePresupuestariaSaldosDisponibilidadDTO } from '../model/clave-presupuestaria-saldos-disponibilidad.dto';
import { FiltroCombinacionEUPPFFDTO } from '../model/filtro-clave-presupuestaria.dto';

@Service()
export class ClavePresupuestaria {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/claves-presupuestarias`;

  /**
   * Consulta la estructura del catálogo de claves presupuestarias
   */
  consultarClavesEstructurales(filtro: FiltroCombinacionEUPPFFDTO): Observable<ClavePresupuestariaDTO[]> {
    let params = new HttpParams()
      .set('ejercicio', filtro.ejercicio.toString())
      .set('unidad', filtro.unidad);

    return this.http.get<ClavePresupuestariaDTO[]>(this.baseUrl, { params });
  }

  /**
   * Verifica la combinación y devuelve la llave primaria junto con los 12 saldos mensuales
   */
  consultarDisponibilidad(filtro: FiltroCombinacionEUPPFFDTO): Observable<ClavePresupuestariaSaldosDisponibilidadDTO> {
    const params = new HttpParams()
      .set('ejercicio', filtro.ejercicio.toString())
      .set('unidad', filtro.unidad)
      .set('idCveProg', filtro.idCveProg!.toString())
      .set('idPartida', filtro.idPartida!.toString())
      .set('idFuenteFin', filtro.idFuenteFin!.toString());

    return this.http.get<ClavePresupuestariaSaldosDisponibilidadDTO>(`${this.baseUrl}/disponibilidad`, { params });
  }

  /**
   * Actualiza rápidamente los saldos usando directamente la Primary Key (Para botón refrescar)
   */
  consultarDisponibilidadPorId(idCvePresupuestaria: number): Observable<ClavePresupuestariaSaldosDisponibilidadDTO> {
    // URL esperada: GET /catalogos/claves-presupuestarias/{id}/disponibilidad
    return this.http.get<ClavePresupuestariaSaldosDisponibilidadDTO>(`${this.baseUrl}/${idCvePresupuestaria}/disponibilidad`);
  }
}