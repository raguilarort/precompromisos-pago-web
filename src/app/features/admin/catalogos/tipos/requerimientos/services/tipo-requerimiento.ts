import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../../environments/environment.development';

import { TipoRequerimientoDTO } from '../model/tipo-requerimiento.dto';

@Service()
export class TipoRequerimiento {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}`;

  getCatalogoTiposRequerimientos(): Observable<TipoRequerimientoDTO[]> {
    return this.http.get<TipoRequerimientoDTO[]>(`${this.baseUrl}/catalogos/tipos-requerimientos`);
  }
}