import { Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { Permisos } from '../../../core/auth/permisos';
import { ContextoGlobal } from '../../../core/services/contexto-global';
import { Precompromiso } from '../services/precompromiso';
import { SeguimientoOperativo } from '../components/seguimiento-operativo/seguimiento-operativo';

@Component({
  selector: 'app-list',
  imports: [RouterLink, CurrencyPipe, SeguimientoOperativo],
  templateUrl: './list.html',
  styleUrl: './list.css',
})
export class List {
  // 1. INYECCIONES (Privadas: Solo el archivo .ts las consume)
  private contextoGlobal = inject(ContextoGlobal);
  private precompromisoService = inject(Precompromiso);

  // 2. Inyectamos el servicio de Permisos. 
  // Al no poner 'private', queda expuesto al list.html
  permisos = inject(Permisos);

  mensajeError = signal<string | null>(null);
  mensajeAlerta = signal<string | null>(null);
  mensajeExito = signal<string | null>(null);
  
  // 2. ESTADO DEL COMPONENTE (Públicas por defecto: Expuestas al list.html)
  terminoBusqueda = signal<string>('');
  
  // En lugar de enlazarnos directo al servicio, creamos una señal local 
  // que albergará la respuesta del backend para el ejercicio seleccionado
  listaPrecompromisos = signal<any[]>([]);

  // 1. Estado de la pestaña ('pendientes' por defecto)
  tabActiva = signal<'pendientes' | 'todos'>('pendientes');

  // 2. Señal computada para el contador del Badge (Lógica de 99+)
  conteoPendientes = computed(() => {
    const total = this.listaPrecompromisos().filter(c => this.permisos.esPendienteParaMi(c.estatus)).length;
    return total > 99 ? '99+' : total.toString();
  });

  registrosFiltrados = computed(() => {
    const termino = this.terminoBusqueda().toLowerCase().trim();
    let precompromisos = this.listaPrecompromisos();

    if (this.permisos.tieneBandejaPendientes() && this.tabActiva() === 'pendientes') {
      precompromisos = precompromisos.filter(c => this.permisos.esPendienteParaMi(c.estatus));
    }

    if (termino) {
      precompromisos = precompromisos.filter(c => 
        (c.folio && c.folio.toLowerCase().includes(termino)) ||
        (c.estatus && c.estatus.toLowerCase().includes(termino)) ||
        (c.numeroRequisicion && c.numeroRequisicion.toLowerCase().includes(termino)) ||
        (c.tipoContratacion && c.tipoContratacion.toLowerCase().includes(termino)) ||
        (c.tipoRequerimiento && c.tipoRequerimiento.toLowerCase().includes(termino))
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
    this.consultarPrecompromisos(ejercicioActual);
  });

  // 4. MÉTODOS PÚBLICOS (Llamados desde list.html)
  eliminar(id: number) {
    if (confirm('¿Está seguro de que desea eliminar este precompromiso de forma permanente? Esta acción no se puede deshacer.')) {
      this.precompromisoService.eliminar(id).subscribe({
        next: (data) => {
          this.mostrarAlerta(data.mensaje || 'Precompromiso eliminado exitosamente', 'success');
          
          // ACTUALIZACIÓN EN TIEMPO REAL: Transformamos el registro a 'ELIMINADO'
          this.listaPrecompromisos.update(lista => 
            lista.map(c => 
              c.idPrecompromiso === id 
                ? { ...c, estatus: 'ELIMINADO' } // Muta solo este registro
                : c // Deja los demás intactos
            )
          );
        },
        error: (err) => {
          console.error('Error al eliminar precompromiso:', err);
          const msjError = err.error?.mensaje || 'No se pudo eliminar el precompromiso por un error en el servidor.';
          this.mostrarAlerta(msjError, 'danger');
        }
      });
    }
  }

  private consultarPrecompromisos(ejercicio: number) {
    console.info(`Ejecutando SELECT de precompromisos para el ejercicio fiscal: ${ejercicio}`);

    this.precompromisoService.consultarPorEjercicio(ejercicio).subscribe({
      next: (data) => {
        this.listaPrecompromisos.set(data);
      },
      error: (err) => {
        console.error('Error al cargar la lista de precompromisos:', err);
        // Aquí podrías agregar un Toast global informando el fallo
        this.mostrarAlerta('No se pudieron cargar las claves programáticas disponibles.', 'danger');
      }
    });
  }

  mostrarAlerta(mensaje: string, tipo: 'success'|'danger'|'warning') {
    const signalMap = {
      success: this.mensajeExito,
      danger: this.mensajeError,
      warning: this.mensajeAlerta
    };

    const targetSignal = signalMap[tipo];
    
    targetSignal.set(mensaje);
    setTimeout(() => targetSignal.set(null), 4000);
  }
}