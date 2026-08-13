import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment.development';

import { FuenteFinanciamientoDTO } from '../model/fuente-financiamiento.dto';

@Service()
export class FuenteFinanciamiento {
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiUrl}`;

    getCatalogoFuentesFinanciamiento(): Observable<FuenteFinanciamientoDTO[]> {
        return this.http.get<FuenteFinanciamientoDTO[]>(`${this.baseUrl}/catalogos/fuentes-financiamiento`);
    }
}
