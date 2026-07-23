import { Component, OnInit, signal, inject } from '@angular/core';
// Importamos la clase con su nuevo nombre exacto
import { ContextoGlobal } from '../../../core/services/contexto-global';

@Component({
  selector: 'app-selector-ejercicio',
  imports: [],
  standalone: true,
  templateUrl: './selector-ejercicio.html',
  styleUrl: './selector-ejercicio.css',
})
export class SelectorEjercicio implements OnInit {
  // Usamos la función inject() respetando las reglas de Angular 22
  private contextoGlobal = inject(ContextoGlobal);

  ejercicioEnCurso = new Date().getFullYear(); 
  ejercicioSeleccionado = this.contextoGlobal.ejercicioFiscal(); //Consumimos el signal
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

    // ¡LA MAGIA OCURRE AQUÍ! Emitimos el cambio a toda la aplicación
    this.contextoGlobal.cambiarEjercicio(anio);
  }
}
