import { Service, signal } from '@angular/core';

@Service()
export class ContextoGlobal {
    // Inicializamos la Signal con el año actual del sistema
    readonly ejercicioFiscal = signal<number>(new Date().getFullYear());

    // Método para actualizar el estado global desde cualquier parte
    cambiarEjercicio(nuevoEjercicio: number) {
        this.ejercicioFiscal.set(nuevoEjercicio);
    }
}
