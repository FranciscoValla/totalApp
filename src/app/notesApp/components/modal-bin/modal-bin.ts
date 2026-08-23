import { Component, computed, DOCUMENT, effect, inject, input, output, signal } from '@angular/core';
import { Note } from '../../interfaces/note.interface';
import { NoteServices } from '../../services/notes';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { finalize, timeout } from 'rxjs';
import { AlertInterface } from '../../pages/bin/bin';
import { AlertServices } from '../../services/alert-services';

@Component({
  selector: 'modal-bin',
  imports: [FormsModule, NgClass],
  templateUrl: './modal-bin.html',
  styleUrl: './modal-bin.css',
})
export class ModalBin {
  binInput = input.required<Note>();
  emitClose = output();
  noteServices = inject(NoteServices);
  alerService = inject(AlertServices);
  loadSignal = output<boolean>();

  isRestored = signal(false);

  textColor = computed(() => {
    switch (this.binInput().color) {
      case 'bg-primary':
      case 'bg-secondary':
      case 'bg-success':
      case 'bg-danger':
      case 'bg-dark':
        return 'text-white';

      case 'bg-white':
      case 'bg-warning':
      case 'bg-info':
        return 'text-success-emphasis';
      default:
        return 'text-success-emphasis';
    }
  });

  isArray = computed(() => {
    const content = this.binInput().content;
    return Array.isArray(content); // ✨ Esto devolverá estrictamente true o false
  });

  contentAsArray = computed<{ type: boolean; txt: string }[]>(() => {
    const content = this.binInput().content;
    return Array.isArray(content) ? (content as { type: boolean; txt: string }[]) : [];
  });

  private document = inject(DOCUMENT);
  isModalOpen = input<boolean>(false);
  constructor() {
    effect(() => {
      if (this.isModalOpen()) {
        this.document.body.classList.add('modal-abierto');
      } else {
        this.document.body.classList.remove('modal-abierto');
      }
    });
  }

  onClose() {
    this.emitClose.emit();
  }

  deleteBin(bin: Note) {
    this.loadSignal.emit(true);
    this.noteServices.deleteBinFirestore(bin.id).pipe(
        timeout(6000),
        finalize(() => {}),
      ).subscribe({
        next: () => {
          if (this.isRestored()) {
            this.restored(bin);
          } else {
            this.refreshBinList();
          }
        },
        error: () => {
          this.alerService.showAlert({type: 'bg-danger-subtle', txt: 'Erorr al Borrar de Papelera.'});
          this.loadSignal.emit(false);
        },
      });
  }

  restored(bin: Note) {
    this.noteServices.createNoteFireStore(bin).pipe(
        timeout(6000),
        finalize(() => {}),
      ).subscribe({
        next: () => {
          this.refreshBinList();
        },
        error: () => {
          this.alerService.showAlert({type: 'bg-danger-subtle', txt: 'Erorr al restaurar Nota de Papelera.'});
          this.loadSignal.emit(false);
        },
      });
  }

  refreshBinList() {
    this.noteServices.getBinsFireStore().pipe(
      timeout( 6000),
      finalize(()=> {
      })
    ).subscribe({
      next: ()=> {
        if( this.isRestored() ) {
          this.alerService.showAlert({type: 'bg-success-subtle', txt: 'Nota Restaurada Correctamente.'});
          this.loadSignal.emit(false);
          this.emitClose.emit();
        } else  {
          this.alerService.showAlert({type: 'bg-success-subtle', txt: 'Nota Borrada Permanentemente.'});
          this.loadSignal.emit(false);
          this.emitClose.emit();
        }
      },
      error: ()=> {
        this.alerService.showAlert({type: 'bg-danger-subtle', txt: 'Erorr al Borrar/Restaurar Nota.'});
        this.emitClose.emit();
      }
    })
  }
}
