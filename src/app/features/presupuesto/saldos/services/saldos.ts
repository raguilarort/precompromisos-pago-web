import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { DesglosePresupuestalDTO } from '../models/desglose-presupuestal.dto';
import { Observable } from 'rxjs';
import { FiltroCombinacionEUPPFFDTO } from '../../claves-presupuestarias/model/filtro-clave-presupuestaria.dto';

@Service()
export class Saldos {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/presupuesto`;

  /**
   * Consulta la orquestación (GRP + Precomprometido) por Primary Key
   * Ideal para cuando refrescamos un concepto que ya tiene su ID guardado.
   */
  consultarDesglosePresupuestalOrquestadoPorId(idClavePresupuestaria: number): Observable<DesglosePresupuestalDTO> {    
    return this.http.get<DesglosePresupuestalDTO>(
      `${this.baseUrl}/desglose-saldos/${idClavePresupuestaria}`
    );
  }

  /**
   * Consulta la orquestación mediante la estructura presupuestal.
   * Ideal para cuando el usuario está creando el concepto y validamos al vuelo.
   */
  consultarDesglosePresupuestalOrquestadoPorFiltro(filtro: FiltroCombinacionEUPPFFDTO): Observable<DesglosePresupuestalDTO> {
    const params = new HttpParams()
      .set('ejercicio', filtro.ejercicio.toString())
      .set('unidad', filtro.unidad)
      .set('idCveProg', filtro.idCveProg!.toString())
      .set('idPartida', filtro.idPartida!.toString())
      .set('idFuenteFin', filtro.idFuenteFin!.toString());

    return this.http.get<DesglosePresupuestalDTO>(
      `${this.baseUrl}/desglose-saldos`, 
      { params }
    );
  }
}
