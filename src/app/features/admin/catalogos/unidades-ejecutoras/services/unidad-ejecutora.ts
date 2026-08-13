import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment.development';

import { UnidadEjecutoraCatalogoDTO } from '../model/unidad-ejecutora.dto';

@Service()
export class UnidadEjecutora {
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiUrl}`;

    getCatalogoUnidadesEjecutoras(): Observable<UnidadEjecutoraCatalogoDTO[]> {
        return this.http.get<UnidadEjecutoraCatalogoDTO[]>(`${this.baseUrl}/catalogos/unidades-ejecutoras`);
    }
}
