import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { 
  UsuarioResponseDTO, 
  UsuarioRolResponseDTO, 
  UsuarioUnidadResponseDTO, 
  RolCatalogoDTO, 
  AdminResponseDTO 
} from '../model/admin-usuarios.dto';
import { AdminUsuarios } from '../services/admin-usuarios';

@Component({
  selector: 'app-admin-usuarios-panel',
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './panel.html',
  styleUrl: './panel.css',
})
export class Panel implements OnInit {
  private fb = inject(FormBuilder);
  private adminService = inject(AdminUsuarios);

  // Estados Reactivos
  usuarios = signal<UsuarioResponseDTO[]>([]);
  catalogoRoles = signal<RolCatalogoDTO[]>([]);
  usuarioSeleccionado = signal<UsuarioResponseDTO | null>(null);
  
  // Listas hijas del usuario seleccionado
  rolesUsuario = signal<UsuarioRolResponseDTO[]>([]);
  unidadesUsuario = signal<UsuarioUnidadResponseDTO[]>([]);

  // UI State
  vistaActual = signal<'LISTA' | 'DETALLE'>('LISTA');
  mensajeAlerta = signal<{ texto: string, tipo: 'success' | 'danger' } | null>(null);

  // Formularios
  formUsuario: FormGroup = this.fb.group({
    idUsuario: [null],
    correo: ['', [Validators.required, Validators.email]],
    numEmpleado: [null, [Validators.required, Validators.min(1)]],
    activo: [1, Validators.required]
  });

  formRol: FormGroup = this.fb.group({ idRol: [null, Validators.required] });
  formUnidad: FormGroup = this.fb.group({ unidad: ['', Validators.required] });

  ngOnInit() {
    this.cargarUsuarios();
    this.cargarCatalogoRoles();
  }

  // --- CARGAS DE DATOS ---
  cargarUsuarios() {
    this.adminService.getUsuarios().subscribe({
      next: (data) => this.usuarios.set(data),
      error: () => this.mostrarNotificacion('Error cargando usuarios', 'danger')
    });
  }

  cargarCatalogoRoles() {
    this.adminService.getCatalogoRoles().subscribe(data => this.catalogoRoles.set(data));
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