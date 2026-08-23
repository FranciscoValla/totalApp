import { Component, computed, inject, input, output, signal } from '@angular/core';
import { NoteServices } from '../../services/notes';
import { Note } from '../../interfaces/note.interface';
import { NgClass } from '@angular/common';
import { finalize, timeout } from 'rxjs';
import { AlertInterface } from '../../pages/bin/bin';
import { AlertServices } from '../../services/alert-services';

@Component({
  selector: 'list-bin',
  imports: [NgClass],
  templateUrl: './list-bin.html',
  styleUrl: './list-bin.css',
})
export class LisBin {
  noteServices = inject(NoteServices);
  alerService = inject(AlertServices);
  bin = input.required<Note>();
  binOutput = output<Note>();
  loadSignal = output<boolean>();
  isrestored = signal(false);

  textColor = computed(() => {
    switch (this.bin().color) {
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
    const content = this.bin().content;
    return Array.isArray(content); // ✨ Esto devolverá estrictamente true o false
  });

  contentAsArray = computed<{ type: boolean; txt: string }[]>(() => {
    const content = this.bin().content;
    return Array.isArray(content) ? (content as { type: boolean; txt: string }[]) : [];
  });

  onEmit() {
    this.binOutput.emit(this.bin());
  }


  deleteBin(bin: Note) {
    this.loadSignal.emit(true);
    this.noteServices.deleteBinFirestore(bin.id).pipe(
        timeout(6000),
        finalize(() => {}),
      ).subscribe({
        next: () => {
          if (this.isrestored()) {
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
        if( this.isrestored()){
          this.alerService.showAlert({type: 'bg-success-subtle', txt: 'Nota restaurada.'});
        } else {
          this.alerService.showAlert({type: 'bg-danger-subtle', txt: 'Nota Borrada Permanentemente.'});
        }
        this.isrestored.set(false);
        this.loadSignal.emit(false);

      },
      error: () => {
        this.alerService.showAlert({type: 'bg-danger-subtle', txt: 'Erorr al Obtener las Notas.'});
        this.loadSignal.emit(false);
      }
    })
  }
}
