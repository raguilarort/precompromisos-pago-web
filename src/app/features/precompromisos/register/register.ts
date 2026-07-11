import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PrecompromisoService } from '../services/precompromisos/precompromisos';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private fb = inject(FormBuilder);
  private precompromisoService = inject(PrecompromisoService);
  private router = inject(Router);

  // Definimos la estructura del formulario y sus validaciones obligatorias
  formulario = this.fb.group({
    folio: ['', Validators.required],
    cliente: ['', Validators.required],
    monto: [null, [Validators.required, Validators.min(1)]],
    fechaCompromiso: ['', Validators.required],
    descripcion: ['', Validators.required]
  });

  guardar() {
    if (this.formulario.valid) {
      const valores = this.formulario.value;
      
      // Armamos el objeto con la estructura de tu interfaz Precompromiso
      const nuevoCompromiso = {
        id: '', // El servicio generará el ID temporalmente
        folio: valores.folio!,
        cliente: valores.cliente!,
        monto: Number(valores.monto),
        fechaRegistro: new Date(),
        fechaCompromiso: new Date(valores.fechaCompromiso!),
        descripcion: valores.descripcion!,
        activo: true
      };

      // Guardamos en el estado simulado y redirigimos a la lista
      this.precompromisoService.guardar(nuevoCompromiso);
      this.router.navigate(['/home/precompromisos/list']);
    } else {
      // Si el formulario es inválido, marcamos todos los campos para que se muestren los errores visuales
      this.formulario.markAllAsTouched();
    }
  }
}
