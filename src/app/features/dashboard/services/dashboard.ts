import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

export interface DashboardKpisDTO {
  presupuestoGlobal: number;
  enTramite: number;
  disponibleNeto: number;
}

@Service()
export class Dashboard {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/dashboard`;

  obtenerKpisEjecutivos(ejercicio: number, unidades: number[]): Observable<DashboardKpisDTO> {
    let params = new HttpParams().set('ejercicio', ejercicio.toString());
    
    // Adjuntamos las unidades permitidas del usuario para filtrar a nivel base de datos
    if (unidades && unidades.length > 0) {
      params = params.set('unidades', unidades.join(','));
    }

    return this.http.get<DashboardKpisDTO>(`${this.baseUrl}/kpis`, { params });
  }

  obtenerActividadReciente(ejercicio: number): Observable<any[]> {
    let params = new HttpParams().set('ejercicio', ejercicio.toString());
    
    return this.http.get<any[]>(`${this.baseUrl}/actividad-reciente`, { params });
  }
}
