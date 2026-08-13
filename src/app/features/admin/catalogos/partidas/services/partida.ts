import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment.development';

import { PartidaDTO } from '../model/partida.dto';


@Service()
export class Partida {
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiUrl}`;

    getCatalogoPartidas(): Observable<PartidaDTO[]> {
        return this.http.get<PartidaDTO[]>(`${this.baseUrl}/catalogos/partidas`);
    }
}