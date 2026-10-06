import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '../../../../../../environments/environment.development';
import { Observable } from 'rxjs';
import { AvisoDTO } from '../models/aviso.dto';

@Service()
export class Aviso {
    private http = inject(HttpClient);

    private baseUrl = `${environment.apiUrl}/avisos`;

    obtenerAvisosActivos(): Observable<AvisoDTO[]> {
    return this.http.get<AvisoDTO[]>(`${this.baseUrl}/activos`);
  }
}
