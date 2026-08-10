import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment.development';

import { 
  UsuarioResponseDTO, 
  UsuarioRolResponseDTO, 
  UsuarioUnidadResponseDTO,  
  AdminResponseDTO 
} from '../model/admin-usuarios.dto';

@Service() // <-- Angular 22 nativo, aprovisionado en la raíz por defecto
export class AdminUsuarios {
  // Al usar @Service, Angular nos obliga por compilador a usar inject(), lo cual es excelente
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/admin/usuarios`;

  // --- LECTURAS (GET) ---
  getUsuarios(): Observable<UsuarioResponseDTO[]> {
    return this.http.get<UsuarioResponseDTO[]>(`${this.baseUrl}/lista`);
  }
  getRolesUsuario(idUsuario: number): Observable<UsuarioRolResponseDTO[]> {
    return this.http.get<UsuarioRolResponseDTO[]>(`${this.baseUrl}/${idUsuario}/roles`);
  }
  getUnidadesUsuario(idUsuario: number): Observable<UsuarioUnidadResponseDTO[]> {
    return this.http.get<UsuarioUnidadResponseDTO[]>(`${this.baseUrl}/${idUsuario}/unidades`);
  }
  
  // --- MUTACIONES (POST/PUT) ---
  upsertUsuario(data: any): Observable<AdminResponseDTO> {
    return this.http.post<AdminResponseDTO>(`${this.baseUrl}/upsert`, data);
  }
  asignarRol(data: any): Observable<AdminResponseDTO> {
    return this.http.post<AdminResponseDTO>(`${this.baseUrl}/rol/asignar`, data);
  }
  revocarRol(idAsignacion: number): Observable<AdminResponseDTO> {
    return this.http.put<AdminResponseDTO>(`${this.baseUrl}/rol/revocar`, { idAsignacion });
  }
  asignarUnidad(data: any): Observable<AdminResponseDTO> {
    return this.http.post<AdminResponseDTO>(`${this.baseUrl}/unidad/asignar`, data);
  }
  revocarUnidad(idAsignacion: number): Observable<AdminResponseDTO> {
    return this.http.put<AdminResponseDTO>(`${this.baseUrl}/unidad/revocar`, { idAsignacion });
  }
}