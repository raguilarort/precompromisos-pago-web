import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment.development';


import { 
  RolCatalogoDTO
} from '../model/rol.dto';

@Service()
export class Rol {
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiUrl}`;

    getCatalogoRoles(): Observable<RolCatalogoDTO[]> {
        return this.http.get<RolCatalogoDTO[]>(`${this.baseUrl}/catalogos/roles`);
    }
}
