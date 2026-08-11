import { Component, inject, OnInit, signal, computed, effect } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { RolCatalogoDTO } from '../../catalogos/roles/model/rol.dto';
import { UnidadEjecutoraCatalogoDTO } from '../../catalogos/unidadesejecutoras/model/unidad-ejecutora.dto';
import { 
  UsuarioResponseDTO, 
  UsuarioRolResponseDTO, 
  UsuarioUnidadResponseDTO, 
  AdminResponseDTO 
} from '../model/admin-usuarios.dto';
import { AdminUsuarios } from '../services/admin-usuarios';
import { Rol } from '../../catalogos/roles/services/rol';
import { UnidadEjecutora } from '../../catalogos/unidadesejecutoras/services/unidad-ejecutora';


@Component({
  selector: 'app-admin-usuarios-panel',
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './panel.html',
  styleUrl: './panel.css',
})
export class Panel implements OnInit {
  private fb = inject(FormBuilder);
  private adminService = inject(AdminUsuarios);
  private rolService = inject(Rol);
  private unidadEjecutoraService = inject(UnidadEjecutora);

  // Estados Reactivos
  usuarios = signal<UsuarioResponseDTO[]>([]);
  catalogoRoles = signal<RolCatalogoDTO[]>([]);
  catalogoUnidadesEjecutoras = signal<UnidadEjecutoraCatalogoDTO[]>([]);
  usuarioSeleccionado = signal<UsuarioResponseDTO | null>(null);
  
  // Listas hijas del usuario seleccionado
  rolesUsuario = signal<UsuarioRolResponseDTO[]>([]);
  unidadesUsuario = signal<UsuarioUnidadResponseDTO[]>([]);
  

  // UI State
  vistaActual = signal<'LISTA' | 'DETALLE'>('LISTA');
  mensajeAlerta = signal<{ texto: string, tipo: 'success' | 'danger' } | null>(null);


  tieneRolActivo = computed(() => this.rolesUsuario().some(rol => rol.activo === 1));

  // 2. MAGIA REACTIVA: El Catálogo Inteligente
  unidadesDisponibles = computed(() => {
    // a) Obtenemos solo las claves de las unidades que están ACTIVAS (1) para este usuario
    const clavesAsignadasActivas = this.unidadesUsuario()
      .filter(u => u.activo === 1)
      .map(u => u.unidadEjecutora);
    
    // b) Retornamos del catálogo maestro solo las que NO están en la lista de activas
    return this.catalogoUnidadesEjecutoras().filter(unidadCat => 
      !clavesAsignadasActivas.includes(unidadCat.unidadEjecutora)
    );
  });

  // Formularios
  formUsuario: FormGroup = this.fb.group({
    idUsuario: [null],
    correo: ['', [Validators.required, Validators.email]],
    numEmpleado: [null, [Validators.required, Validators.min(1)]],
    activo: [1, Validators.required]
  });

  formRol: FormGroup = this.fb.group({ idRol: [null, Validators.required] });
  formUnidad: FormGroup = this.fb.group({ unidad: ['', Validators.required] });

  constructor() {
    // Efecto para bloquear/desbloquear el select de ROLES
    effect(() => {
      const controlRol = this.formRol.get('idRol');
      if (this.tieneRolActivo()) {
        controlRol?.disable({ emitEvent: false }); // Bloquea el select en el TS
        controlRol?.reset(null, { emitEvent: false }); // Lo limpia por seguridad
      } else {
        controlRol?.enable({ emitEvent: false }); // Lo habilita
      }
    });

    // Efecto para bloquear/desbloquear el select de UNIDADES
    effect(() => {
      const controlUnidad = this.formUnidad.get('unidad');
      if (this.unidadesDisponibles().length === 0) {
        controlUnidad?.disable({ emitEvent: false });
        controlUnidad?.reset('', { emitEvent: false });
      } else {
        controlUnidad?.enable({ emitEvent: false });
      }
    });
  }

  ngOnInit() {
    this.cargarUsuarios();
    this.cargarCatalogoRoles();
    this.cargarCatalogoUnidades();
  }

  // --- CARGAS DE DATOS ---
  cargarUsuarios() {
    this.adminService.getUsuarios().subscribe({
      next: (data) => this.usuarios.set(data),
      error: () => this.mostrarNotificacion('Error cargando usuarios', 'danger')
    });
  }

  cargarCatalogoRoles() {
    this.rolService.getCatalogoRoles().subscribe(data => this.catalogoRoles.set(data));
  }

  cargarCatalogoUnidades() {
    this.unidadEjecutoraService.getCatalogoUnidadesEjecutoras().subscribe(data => {
      this.catalogoUnidadesEjecutoras.set(data);
    });
  }

  cargarDetalleHijos(idUsuario: number) {
    this.adminService.getRolesUsuario(idUsuario).subscribe(data => this.rolesUsuario.set(data));
    this.adminService.getUnidadesUsuario(idUsuario).subscribe(data => this.unidadesUsuario.set(data));
  }

  // --- NAVEGACIÓN Y SELECCIÓN ---
  nuevoUsuario() {
    this.formUsuario.reset({ activo: 1 });
    this.usuarioSeleccionado.set(null);
    this.rolesUsuario.set([]);
    this.unidadesUsuario.set([]);
    this.vistaActual.set('DETALLE');
  }

  editarUsuario(usuario: UsuarioResponseDTO) {
    this.usuarioSeleccionado.set(usuario);
    this.formUsuario.patchValue(usuario);
    this.cargarDetalleHijos(usuario.idUsuario);
    this.vistaActual.set('DETALLE');
  }

  volverLista() {
    this.cargarUsuarios();
    this.vistaActual.set('LISTA');
  }

  // --- OPERACIONES CRUD ---
  guardarUsuario() {
    if (this.formUsuario.invalid) return;
    this.adminService.upsertUsuario(this.formUsuario.value).subscribe({
      next: (res) => {
        this.mostrarNotificacion(res.mensaje, 'success');
        if (!this.formUsuario.value.idUsuario && res.idGenerado) {
          // Si era nuevo, simulamos la selección para habilitar los permisos
          this.formUsuario.patchValue({ idUsuario: res.idGenerado });
          this.usuarioSeleccionado.set(this.formUsuario.value);
        }
      },
      error: (err) => this.mostrarNotificacion(err.error?.mensaje || 'Error al guardar', 'danger')
    });
  }

  asignarRol() {
    if (this.formRol.invalid || !this.usuarioSeleccionado()) return;
    const payload = { idUsuario: this.usuarioSeleccionado()!.idUsuario, idRol: this.formRol.value.idRol };
    
    this.adminService.asignarRol(payload).subscribe({
      next: () => {
        this.mostrarNotificacion('Rol asignado', 'success');
        this.cargarDetalleHijos(this.usuarioSeleccionado()!.idUsuario);
        this.formRol.reset();
      },
      error: (err) => this.mostrarNotificacion(err.error?.mensaje, 'danger')
    });
  }

  revocarRol(idAsignacion: number) {
    this.adminService.revocarRol(idAsignacion).subscribe({
      next: () => {
        this.mostrarNotificacion('Rol revocado', 'success');
        this.cargarDetalleHijos(this.usuarioSeleccionado()!.idUsuario);
      },
      error: (err) => this.mostrarNotificacion(err.error?.mensaje, 'danger')
    });
  }

  asignarUnidad() {
    if (this.formUnidad.invalid || !this.usuarioSeleccionado()) return;
    const payload = { idUsuario: this.usuarioSeleccionado()!.idUsuario, unidad: this.formUnidad.value.unidad };
    
    this.adminService.asignarUnidad(payload).subscribe({
      next: () => {
        this.mostrarNotificacion('Unidad asignada', 'success');
        this.cargarDetalleHijos(this.usuarioSeleccionado()!.idUsuario);
        this.formUnidad.reset();
      },
      error: (err) => this.mostrarNotificacion(err.error?.mensaje, 'danger')
    });
  }

  revocarUnidad(idAsignacion: number) {
    this.adminService.revocarUnidad(idAsignacion).subscribe({
      next: () => {
        this.mostrarNotificacion('Unidad revocada', 'success');
        this.cargarDetalleHijos(this.usuarioSeleccionado()!.idUsuario);
      },
      error: (err) => this.mostrarNotificacion(err.error?.mensaje, 'danger')
    });
  }

  mostrarNotificacion(texto: string, tipo: 'success' | 'danger') {
    this.mensajeAlerta.set({ texto, tipo });
    setTimeout(() => this.mensajeAlerta.set(null), 4000);
  }
}