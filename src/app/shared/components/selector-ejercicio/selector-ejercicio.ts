import { Component, OnInit, signal } from '@angular/core';

@Component({
  selector: 'app-selector-ejercicio',
  imports: [],
  standalone: true,
  templateUrl: './selector-ejercicio.html',
  styleUrl: './selector-ejercicio.css',
})
export class SelectorEjercicio implements OnInit {
 ejercicioEnCurso = new Date().getFullYear(); 
  ejercicioSeleccionado = this.ejercicioEnCurso;
  ejerciciosPermitidos: number[] = [];

  // Controla el estado visual del componente
  estaDesbloqueado = signal<boolean>(false);

  ngOnInit() {
    this.ejerciciosPermitidos = [this.ejercicioEnCurso, 2025, 2024];
  }

  intentarDesbloqueo() {
    // Fricción positiva: Confirmación del sistema
    const confirmacion = confirm('¿Estás seguro que deseas desbloquear la opción para consultar o modificar un ejercicio fiscal diferente?');
    
    if (confirmacion) {
      this.estaDesbloqueado.set(true);
    }
  }

  bloquear() {
    this.estaDesbloqueado.set(false);
  }

  seleccionarEjercicio(anio: number) {
    this.ejercicioSeleccionado = anio;
    this.estaDesbloqueado.set(false); // Se vuelve a bloquear automáticamente al elegir
    console.log('Ejercicio seleccionado y bloqueado:', this.ejercicioSeleccionado);
  }
}
