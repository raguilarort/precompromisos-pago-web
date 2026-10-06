import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { Observable } from 'rxjs';
import { SituacionPresupuestalAnualPorClaveDTO } from '../models/situacion-presupuestal-anual-clave.dto';

@Service()
export class ReportesPresupuestales {
    private http = inject(HttpClient);
  // Ajusta la ruta base según lo que configuraste en tu controller
  private baseUrl = `${environment.apiUrl}/reportes/presupuesto`;

  obtenerReporteSituacionPresupuestalAnual(ejercicio: number): Observable<SituacionPresupuestalAnualPorClaveDTO[]> {
    const params = new HttpParams().set('ejercicio', ejercicio.toString());
    return this.http.get<SituacionPresupuestalAnualPorClaveDTO[]>(`${this.baseUrl}/situacion-presupuestal`, { params });
  }
}
