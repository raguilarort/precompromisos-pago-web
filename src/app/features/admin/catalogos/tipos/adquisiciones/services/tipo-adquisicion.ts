import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../../environments/environment.development';

import { TipoAdquisicionDTO } from '../model/tipo-adquisicion.dto';

@Service()
export class TipoAdquisicion {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}`;

  getCatalogoTiposAdquisiciones(): Observable<TipoAdquisicionDTO[]> {
    return this.http.get<TipoAdquisicionDTO[]>(`${this.baseUrl}/catalogos/tipos-adquisiciones`);
  }
}