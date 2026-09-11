import { Service, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { PrecompromisoRequestDTO, PrecompromisoResponse } from '../models/precompromiso-request.dto';
import { PrecompromisoResumeDTO } from '../models/precompromiso-resume.dto';

@Service()
export class Precompromiso {
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiUrl}/precompromisos`;

  /**
   * Registra un nuevo precompromiso
   * @param precompromisoUI Modelo de la GUI que se transformará en un RequestDTO esperado por el Backend
   * @returns Observable con el objeto que se arma durante la respuesta del servicio y que puede ser utilizado GUI
   */
  registrar(precompromisoUI: PrecompromisoRequestDTO): Observable<PrecompromisoResponse> {
    
    const payloadSeguro: PrecompromisoRequestDTO = {
      ejercicio: precompromisoUI.ejercicio,
      unidad: precompromisoUI.unidad,
      numeroRequisicion: precompromisoUI.numeroRequisicion,
      tipoContratacion: precompromisoUI.tipoContratacion,
      tipoRequerimiento: precompromisoUI.tipoRequerimiento,
      
      conceptos: precompromisoUI.conceptos.map(concepto => ({
        descripcion: concepto.descripcion,
        idCvePresupuestaria: concepto.idCvePresupuestaria,
        importeEnero: concepto.importeEnero,
        importeFebrero: concepto.importeFebrero,
        importeMarzo: concepto.importeMarzo,
        importeAbril: concepto.importeAbril,
        importeMayo: concepto.importeMayo,
        importeJunio: concepto.importeJunio,
        importeJulio: concepto.importeJulio,
        importeAgosto: concepto.importeAgosto,
        importeSeptiembre: concepto.importeSeptiembre,
        importeOctubre: concepto.importeOctubre,
        importeNoviembre: concepto.importeNoviembre,
        importeDiciembre: concepto.importeDiciembre
      }))
    };

    return this.http.post<PrecompromisoResponse>(this.baseUrl, payloadSeguro);
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
}