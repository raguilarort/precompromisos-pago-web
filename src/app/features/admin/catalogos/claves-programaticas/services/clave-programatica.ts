import { Service, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../../environments/environment.development';

import { ClaveProgramaticaDTO } from '../model/clave-programatica.dto';


@Service()
export class ClaveProgramatica {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}`;

  /**
   * Obtiene las claves programáticas.
   * @param ejercicio Ejercicio para filtrar informacion (Obligatorio)
   * @param unidad Clave de la unidad ejecutora (Opcional)
   */
  getClavesProgramaticas(ejercicio: number, unidad?: string): Observable<ClaveProgramaticaDTO[]> {
    let params = new HttpParams().set('ejercicio', ejercicio.toString());

    if (unidad && unidad.trim() !== '') {
      params = params.set('unidad', unidad);
    }

    return this.http.get<ClaveProgramaticaDTO[]>(`${this.baseUrl}/catalogos/claves-programaticas`, { params }).pipe(
      // Si el backend responde 204 No Content, la data será null. 
      // Retornamos un array vacío de forma segura para no romper la vista.
      map(data => data || [])
    );
  }
}
