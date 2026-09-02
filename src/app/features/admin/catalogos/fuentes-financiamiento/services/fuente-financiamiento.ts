import { Service, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment.development';

import { FuenteFinanciamientoDTO } from '../model/fuente-financiamiento.dto';
import { FiltroFuenteFinanciamientoDTO } from '../model/filtro-fuente-financiamiento.dto';

@Service()
export class FuenteFinanciamiento {
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiUrl}`;

    /**
     * Obtiene el catálogo completo de fuentes de financiamiento sin filtros.
     * 
     * @returns Observable con el arreglo de todas las fuentes.
     */
    getCatalogoFuentesFinanciamiento(): Observable<FuenteFinanciamientoDTO[]> {
        return this.http.get<FuenteFinanciamientoDTO[]>(`${this.baseUrl}/catalogos/fuentes-financiamiento`);
    }

    /**
     * Consulta las fuentes de financiamiento disponibles para la combinación unidad, clave programática y partida
     * Mapea el objeto de filtro a Query Parameters exactos (?ejercicio=X&unidad=Y...)
     * 
     * @param filtro Objeto tipado con los 4 parámetros obligatorios (ejercicio, unidad, idCveProg, idPartida).
     * @returns Observable con el arreglo de fuentes de financiamiento permitidas.
     */
   consultarFuentesFinanciamiento(filtro: FiltroFuenteFinanciamientoDTO): Observable<FuenteFinanciamientoDTO[]> {
        // Construimos los Query Parameters de forma inmutable
        const params = new HttpParams()
            .set('ejercicio', filtro.ejercicio.toString())
            .set('unidad', filtro.unidad)
            .set('idCveProg', filtro.idCveProg.toString())
            .set('idPartida', filtro.idPartida.toString());

        // El segundo parámetro de get() recibe las opciones, donde pasamos los 'params'
        return this.http.get<FuenteFinanciamientoDTO[]>(`${this.baseUrl}/catalogos/fuentes-financiamiento`, { params });
    }
}
