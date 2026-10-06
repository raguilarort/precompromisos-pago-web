import { Service, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

import { ClavePresupuestariaDTO } from '../model/clave-presupuestaria.dto';
import { FiltroCombinacionEUPPFFDTO } from '../model/filtro-clave-presupuestaria.dto';

@Service()
export class ClavePresupuestaria {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/claves-presupuestarias`;

  /**
   * Consulta la información de una clave presupuestaria por su ID
   */
  consultarClavePorId(idClavePresupuestaria: number): Observable<ClavePresupuestariaDTO> {
    const params = new HttpParams().set('idClavePresupuestaria', idClavePresupuestaria.toString());
    return this.http.get<ClavePresupuestariaDTO>(this.baseUrl, { params });
  }

  /**
   * Consulta la estructura del catálogo de claves presupuestarias
   */
  buscarClavePresupuestaria(filtro: FiltroCombinacionEUPPFFDTO): Observable<ClavePresupuestariaDTO[]> {
    let params = new HttpParams()
      .set('ejercicio', filtro.ejercicio.toString())
      .set('unidad', filtro.unidad);

    return this.http.get<ClavePresupuestariaDTO[]>(this.baseUrl, { params });
  }
}