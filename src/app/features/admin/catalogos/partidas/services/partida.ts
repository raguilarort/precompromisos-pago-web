import { Service, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../../environments/environment.development';

import { PartidaDTO } from '../model/partida.dto';


@Service()
export class Partida {
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiUrl}`;

    getCatalogoPartidasEspecificas(): Observable<PartidaDTO[]> {
        return this.http.get<PartidaDTO[]>(`${this.baseUrl}/catalogos/partidas`);
    }

    /**
     * Obtiene las partidas específicas disponibles para una clave programática.
     * @param ejercicio Ejercicio para filtrar informacion (Obligatorio)
     * @param unidad Clave de la unidad ejecutora (Obligatorio)
     * @param idCveProg Identificador de la clave programática (Obligatorio)
     */
    getCatalogoPartidasEspecificasPorCveProg(ejercicio: number, unidad: string, idCveProg: number): Observable<PartidaDTO[]> {
        let params = new HttpParams().set('ejercicio', ejercicio.toString());

        if (unidad && unidad.trim() !== '') {
        params = params.set('unidad', unidad);
        }

        if (idCveProg > 0) {
            params = params.set('idCveProg', idCveProg);
        }

        return this.http.get<PartidaDTO[]>(`${this.baseUrl}/catalogos/partidas`, { params }).pipe(
            // Si el backend responde 204 No Content, la data será null. 
            // Retornamos un array vacío de forma segura para no romper la vista.
            map(data => data || [])
        );
    }
}