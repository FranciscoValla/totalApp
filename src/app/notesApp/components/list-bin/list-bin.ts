import { Component, computed, inject, input, output, signal } from '@angular/core';
import { NoteServices } from '../../services/notes';
import { Note } from '../../interfaces/note.interface';
import { NgClass } from '@angular/common';
import { finalize, timeout } from 'rxjs';
import { AlertInterface } from '../../pages/bin/bin';

@Component({
  selector: 'list-bin',
  imports: [NgClass],
  templateUrl: './list-bin.html',
  styleUrl: './list-bin.css',
})
export class LisBin {
  noteServices = inject(NoteServices);
  bin = input.required<Note>();
  binOutput = output<Note>();
  loadSignal = output<boolean>();
  alertEmit = output<AlertInterface> ();
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

  isArray = computed( ()=> {
    if( Array.isArray( this.bin().content) ) {
      return true;
    } else  {
      return false;
    }
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
          this.alertEmit.emit({
            type: 'bg-danger',
            txt: 'Erorr al Borrar de Papelera.',
          });
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
          this.alertEmit.emit({
            type: 'bg-danger',
            txt: 'Erorr al restaurar Nota de Papelera.',
          });
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
          this.alertEmit.emit({
            type: 'bg-success',
            txt: 'Nota restaurada.',
          });
        } else {
          this.alertEmit.emit({
            type: 'bg-danger',
            txt: 'Nota Borrada Permanentemente',
          });
        }
        this.isrestored.set(false);
        this.loadSignal.emit(false);

      },
      error: () => {
        this.alertEmit.emit({
          type: 'bg-danger',
          txt: 'Erorr al Obtener las Notas.',
        });
        this.loadSignal.emit(false);
      }
    })
  }
}
