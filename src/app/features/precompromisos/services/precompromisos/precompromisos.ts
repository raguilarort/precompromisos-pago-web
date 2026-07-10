import { Injectable, signal, computed } from '@angular/core';
import { Precompromiso } from '../../models/precompromiso.model';

@Injectable({
  providedIn: 'root'
})
export class CommitmentService {
  // Estado base (nuestra base de datos simulada)
  private compromisos = signal<Precompromiso[]>([
    {
      id: '1', folio: 'COMP-001', cliente: 'Empresa Alpha S.A.', 
      monto: 15000.50, fechaRegistro: new Date(), fechaCompromiso: new Date(2026, 7, 15), 
      descripcion: 'Pago inicial de proyecto', activo: true
    },
    {
      id: '2', folio: 'COMP-002', cliente: 'Consultoría Beta', 
      monto: 8500.00, fechaRegistro: new Date(), fechaCompromiso: new Date(2026, 7, 20), 
      descripcion: 'Liquidación de factura #443', activo: true
    }
  ]);

  // Computed: Solo devuelve los compromisos que NO están borrados lógicamente
  compromisosActivos = computed(() => 
    this.compromisos().filter(c => c.activo)
  );

  // Obtener un registro individual
  obtenerPorId(id: string): Precompromiso | undefined {
    return this.compromisos().find(c => c.id === id && c.activo);
  }

  // Guardar (Crear o Editar)
  guardar(compromiso: Precompromiso) {
    if (compromiso.id) {
      // Editar
      this.compromisos.update(lista => 
        lista.map(c => c.id === compromiso.id ? compromiso : c)
      );
    } else {
      // Crear nuevo
      const nuevo = { 
        ...compromiso, 
        id: Math.random().toString(36).substr(2, 9),
        activo: true 
      };
      this.compromisos.update(lista => [...lista, nuevo]);
    }
  }

  // Eliminar (Borrado Lógico)
  eliminarLogico(id: string) {
    this.compromisos.update(lista => 
      lista.map(c => c.id === id ? { ...c, activo: false } : c)
    );
  }
}