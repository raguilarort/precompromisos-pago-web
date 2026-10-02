import { Component, computed, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Auth } from '../../../core/auth/services/auth';
import { DashboardEjecutivo } from '../components/dashboard-ejecutivo/dashboard-ejecutivo';
import { DashboardOperativo } from '../components/dashboard-operativo/dashboard-operativo';
import { Permisos } from '../../../core/auth/permisos';
import { RolSistema } from '../../../core/auth/models/auth.model';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterModule, DashboardEjecutivo, DashboardOperativo],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio {
  authService = inject(Auth);
  permisos = inject(Permisos);

  RolSistema = RolSistema;

  // Computed signals para determinar el rol (ajusta la lógica a como devuelvas los roles en tu Auth Service)
  esEjecutivo = computed(() => {
    return this.permisos.esEjecutivo(); 
  });

  esOperativo = computed(() => {
    return this.permisos.esOperativo();
  });

  nombreRolActual = computed(() => {
    const usuario = this.authService.usuarioAutenticado();
    return usuario ? RolSistema[usuario.rol] : 'Cargando...';
  });
}
