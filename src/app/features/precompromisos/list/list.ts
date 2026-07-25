import { Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { Permisos } from '../../../core/auth/permisos';
import { ContextoGlobal } from '../../../core/services/contexto-global';
import { PrecompromisoService } from '../services/precompromisos/precompromisos';

@Component({
  selector: 'app-list',
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './list.html',
  styleUrl: './list.css',
})
export class List {
  // 1. INYECCIONES (Privadas: Solo el archivo .ts las consume)
  private contextoGlobal = inject(ContextoGlobal);
  private precompromisoService = inject(PrecompromisoService);

  // 2. Inyectamos el servicio de Permisos. 
  // Al no poner 'private', queda expuesto al list.html
  permisos = inject(Permisos);
  
  // 2. ESTADO DEL COMPONENTE (Públicas por defecto: Expuestas al list.html)
  terminoBusqueda = signal<string>('');
  
  // En lugar de enlazarnos directo al servicio, creamos una señal local 
  // que albergará la respuesta del backend para el ejercicio seleccionado
  listaCompromisos = signal<any[]>([]);

  // 1. Estado de la pestaña ('pendientes' por defecto)
  tabActiva = signal<'pendientes' | 'todos'>('pendientes');

  // 2. Señal computada para el contador del Badge (Lógica de 99+)
  conteoPendientes = computed(() => {
    const total = this.listaCompromisos().filter(c => this.permisos.esPendienteParaMi(c.estatus)).length;
    return total > 99 ? '99+' : total.toString();
  });

  compromisosFiltrados = computed(() => {
    const termino = this.terminoBusqueda().toLowerCase().trim();
    let precompromisos = this.listaCompromisos();

    if (this.permisos.tieneBandejaPendientes() && this.tabActiva() === 'pendientes') {
      precompromisos = precompromisos.filter(c => this.permisos.esPendienteParaMi(c.estatus));
    }

    if (termino) {
      precompromisos = precompromisos.filter(c => 
        c.folio.toLowerCase().includes(termino) ||
        c.estatus.toLowerCase().includes(termino) ||
        c.requisicion.numeroRequisicion.toLowerCase().includes(termino) ||
        c.requisicion.tipoContratacion.toLowerCase().includes(termino) ||
        c.requisicion.tipo.toLowerCase().includes(termino)
      );
    }

    return precompromisos;
  });

  // Método para cambiar entre pestañas
  cambiarTab(tab: 'pendientes' | 'todos') {
    this.tabActiva.set(tab);
  }

  // 3. EFECTOS REACTIVOS
  // Al asignarlo como propiedad, el effect() obtiene el contexto de inyección 
  // sin necesidad de abrir un constructor().
  private reaccionarAlEjercicio = effect(() => {
    // Angular rastrea esta lectura. Si cambia en el Navbar, este bloque se re-ejecuta.
    const ejercicioActual = this.contextoGlobal.ejercicioFiscal();
    this.simularConsultaBaseDatos(ejercicioActual);
  });

  // 4. MÉTODOS PÚBLICOS (Llamados desde list.html)
  eliminar(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar este registro?')) {
      this.precompromisoService.eliminarLogico(id);
      
      // Opcional: Actualizar la tabla local después de eliminar
      const nuevaLista = this.listaCompromisos().filter(c => c.id !== id);
      this.listaCompromisos.set(nuevaLista);
    }
  }

  // 5. MÉTODOS PRIVADOS (Lógica encapsulada de apoyo)
  private simularConsultaBaseDatos(ejercicio: number) {
    console.info(`Ejecutando SELECT de precompromisos para el ejercicio fiscal: ${ejercicio}`);

   // Simulamos un retraso de red de 400ms para apreciar el comportamiento asíncrono (Loader)
    setTimeout(() => {
      
      // En lugar de inventar los datos aquí, se los pedimos al servicio oficial
      const registrosDelAnio = this.precompromisoService.obtenerPorEjercicio(ejercicio);
      
      // Actualizamos la Signal de la tabla con los resultados puros de ese año
      this.listaCompromisos.set(registrosDelAnio);
      
    },500);
  }
}