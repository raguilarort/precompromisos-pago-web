import { Service, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { PrecompromisoRequestDTO, PrecompromisoResponse } from '../models/precompromiso-request.dto';
import { PrecompromisoResumeDTO } from '../models/precompromiso-resume.dto';
import { PrecompromisoDetailDTO } from '../models/precompromiso-detail.dto';

@Service()
export class Precompromiso {
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiUrl}/precompromisos`;

  /**
   * Registra un nuevo precompromiso
   * @param payload Objeto de tipo PrecompromisoRequestDTO esperado por el Backend
   * @returns Observable con el objeto que se arma durante la respuesta del servicio y que puede ser utilizado GUI
   */
  registrar(payload: PrecompromisoRequestDTO): Observable<PrecompromisoResponse> {    
    return this.http.post<PrecompromisoResponse>(this.baseUrl, payload);
  }

  /**
   * Actualiza un precompromiso existente
   * @param idPrecompromiso Identificador del precompromiso a actualizar
   * @param payload Objeto de tipo PrecompromisoRequestDTO esperado por el Backend para actualizar
   * @returns Observable con el objeto que se arma durante la respuesta del servicio y que puede ser utilizado GUI
   */
  actualizar(idPrecompromiso: number, payload: PrecompromisoRequestDTO): Observable<PrecompromisoResponse> {
    return this.http.put<PrecompromisoResponse>(`${this.baseUrl}/${idPrecompromiso}`, payload);
  }

  /**
   * Elimina un precompromiso lógicamente en la base de datos
   * @param idPrecompromiso Identificador del precompromiso a eliminar
   * @returns Observable con el objeto que se arma durante la respuesta del servicio
   */
  eliminar(idPrecompromiso: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${idPrecompromiso}`);
  }

  /**
   * Consulta los precompromisos gestionados en un ejercicio determinado
   * 
   * @param ejercicio Ejercicio en el que fueron registrados y gestionados los precompromisos.
   * @returns Observable con el arreglo de precompromisos que se tiene permitodos consultar.
   */
  consultarPorEjercicio(ejercicio: Number): Observable<PrecompromisoResumeDTO[]> {
    let params = new HttpParams().set('ejercicio', ejercicio.toString());

    return this.http.get<PrecompromisoResumeDTO[]>(`${this.baseUrl}`,{params}).pipe(map(data => data || []));
  }

  /**
   * Consulta un precompromiso mediante su identificador y devuelve su detalle completo
   * 
   * @param idPrecompromiso Identificador del precompromiso.
   * @returns Observable con el arreglo de precompromisos que se tiene permitodos consultar.
   */
  obtenerPorId(idPrecompromiso: Number | string): Observable<PrecompromisoDetailDTO[]> {

    return this.http.get<PrecompromisoDetailDTO[]>(`${this.baseUrl}/${idPrecompromiso}`).pipe(map(data => data || []));
  }
}