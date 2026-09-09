import { Service, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { ConceptoPresupuestal, PrecompromisoDTO, Requisicion } from '../models/precompromiso.model';
import { PrecompromisoRequestDTO, PrecompromisoResponse } from '../models/precompromiso-request.dto';

@Service()
export class Precompromiso {
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiUrl}/precompromisos`;

    /**
   * Registra un nuevo precompromiso. 
   * Traduce el modelo de la UI al RequestDTO esperado por el Backend.
   */
  registrar(precompromisoUI: PrecompromisoRequestDTO): Observable<PrecompromisoResponse> {
    
    const payloadSeguro: PrecompromisoRequestDTO = {
      ejercicio: precompromisoUI.ejercicio,
      unidad: precompromisoUI.unidad,
      numeroRequisicion: precompromisoUI.numeroRequisicion,
      tipoContratacion: precompromisoUI.tipoContratacion,
      tipoRequerimiento: precompromisoUI.tipoRequerimiento,
      
      // Mapeamos el arreglo de conceptos
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
}