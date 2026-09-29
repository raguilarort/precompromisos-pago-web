import { Component, ElementRef, EventEmitter, Output, ViewChild, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TitleCasePipe, LowerCasePipe } from '@angular/common';

declare var bootstrap: any;

export type TipoAccionModal = 'RECHAZAR' | 'CANCELAR' | 'ELIMINAR';

export interface ModalMotivoResult {
  accion: TipoAccionModal;
  motivo: string;
  idRegistro?: number;
}

@Component({
  selector: 'app-modal-motivo-accion',
  standalone: true,
  imports: [ReactiveFormsModule, TitleCasePipe, LowerCasePipe],
  templateUrl: './modal-motivo-accion.html',
  styleUrl: './modal-motivo-accion.css',
})
export class ModalMotivoAccion {
  @ViewChild('modalMotivoElement') modalElement!: ElementRef;
  
  // Emitimos un objeto estructurado al componente padre
  @Output() alConfirmar = new EventEmitter<ModalMotivoResult>();

  accion = signal<TipoAccionModal>('RECHAZAR');
  idContexto = signal<number | undefined>(undefined);

  motivoControl = new FormControl('', [
    Validators.required, 
    Validators.minLength(15)
  ]);

  // Método público para que el padre lo invoque
  abrir(accion: TipoAccionModal, idRegistro?: number) {
    this.accion.set(accion);
    this.idContexto.set(idRegistro);
    this.motivoControl.reset();
    
    const modal = bootstrap.Modal.getOrCreateInstance(this.modalElement.nativeElement);
    modal.show();
  }

  cerrar() {
    const modal = bootstrap.Modal.getInstance(this.modalElement.nativeElement);
    if (modal) {
      modal.hide();
    }
  }

  confirmar() {
    if (this.motivoControl.invalid) {
      this.motivoControl.markAsTouched();
      return;
    }

    const resultado: ModalMotivoResult = {
      accion: this.accion(),
      motivo: this.motivoControl.value!,
      idRegistro: this.idContexto()
    };

    this.cerrar();
    
    // Notificamos al padre para que él decida qué hacer (lanzar confirm, http, etc.)
    this.alConfirmar.emit(resultado);
  }
}
