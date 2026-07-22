import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-selector-ejercicio',
  imports: [],
  standalone: true,
  templateUrl: './selector-ejercicio.html',
  styleUrl: './selector-ejercicio.css',
})
export class SelectorEjercicio implements OnInit {
  // 1. Calculamos el año dinámicamente con el reloj del sistema.
  // Así, en 2027, esto valdrá automáticamente 2027.
  ejercicioEnCurso = new Date().getFullYear(); 
  
  // El ejercicio que el usuario tiene seleccionado actualmente
  ejercicioSeleccionado = this.ejercicioEnCurso;

  // Mocks: Ejercicios a los que tiene permiso
  ejerciciosPermitidos: number[] = [];

  ngOnInit() {
    // Simulamos la carga desde el backend. 
    // Siempre le damos el año en curso, más sus años históricos.
    this.ejerciciosPermitidos = [this.ejercicioEnCurso, 2025, 2024];
  }

  cambiarEjercicio(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.ejercicioSeleccionado = Number(selectElement.value);
    console.log('Ejercicio seleccionado:', this.ejercicioSeleccionado);
  }
}
