import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { Note } from '../../interfaces/note.interface';
import { NoteServices } from '../../services/notes';
import { NgClass } from '@angular/common';
import { SelectColor } from '../select-color/select-color';
import { finalize, timeout } from 'rxjs';
import { AlertInterface } from '../../pages/bin/bin';
import { CompressImage } from '../../services/compress-image';

@Component({
  selector: 'list-note',
  imports: [NgClass, SelectColor],
  templateUrl: './list-note.html',
  styleUrl: './list-note.css',
})
export class ListNote {
  noteServices = inject(NoteServices);
  compressServices = inject(CompressImage);
  note = input.required<Note>();
  noteOutput = output<Note>();
  loadSignal = output<boolean>();
  alertEmit = output<AlertInterface>();

  isShowSelectColor = signal(false);
  imagenUrl = signal<string | null>(null);

  textColor = computed(() => {
    switch (this.note().color) {
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
    if( Array.isArray( this.note().content) ) {
      return true;
    } else  {
      return false;
    }
  });

  deleteNote(id: string) {
    this.loadSignal.emit(true);
    this.noteServices.deleteNoteFireStore(id).pipe(
      timeout(6000),
      finalize(() => {}),
    ).subscribe({
      next: () => this.addBin(),
      error: (err) => {
        this.emitingAlert('bg-bg-danger', 'Error al borrar Nota y mandar a Papelera.')
        this.loadSignal.emit(false);
      },
    });
  }

  addBin() {
    this.noteServices.addListBinFireStore(this.note()).pipe(
      timeout(6000),
      finalize(() => {}),
    ).subscribe({
      next: () => this.refreshNotes('bg-warning', 'Nota Borrada. Se Manda a Papelera.'),
      error: () =>
        this.emitingAlert('bg-bg-danger', 'Error al borrar Nota y mandar a Papelera.')
    });
  }

  refreshNotes(type:string, txt:string) {
    this.noteServices.getNotesFireStore().subscribe({
      next: () => {
        this.emitingAlert(type, txt);
        this.loadSignal.emit(false);
      },
      error: (err) => {
        this.emitingAlert('bg-bg-danger', 'Error al Obtener las Notas.');
        this.loadSignal.emit(false);
      },
    });
  }

  updateNoteFix() {
    const updateNote: Note = {
      ...this.note(),
      fix: !this.note().fix,
    };
    this.noteServices.updateNoteFireStore(updateNote.id, { fix: updateNote.fix }).subscribe({
      next: () => {
        this.refreshNotes('bg-success', 'Se cambio Fijo/Normal.');
      },
      error: () =>
        this.emitingAlert('bg-bg-danger', 'Error al Fijar/Normal')
    });
  }

  changeColor(newColor: string) {
    const currentNote = this.note();
    const updatedNote: Note = {
      ...currentNote,
      color: newColor,
    };
    this.noteServices.updateNoteFireStore(updatedNote.id, { color: updatedNote.color}).subscribe({
      next: ()=> this.refreshNotes('bg-success', 'Cambio de Color Exitoso.'),
      error: ()=> this.emitingAlert('bg-bg-danger', 'Error al Cambiar Color')
    })
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const archivo = input.files[0];
      try {
        const imageCompressBase64 = await this.compressServices.compressFile(archivo, 1200, 0.6);
        this.imagenUrl.set(imageCompressBase64);
        const currentNote = this.note();
        const updateImage:Note = {
          ...currentNote, img: imageCompressBase64
        }
        this.noteServices.updateNoteFireStore(updateImage.id, {img: updateImage.img}).subscribe({
          next: ()=> this.refreshNotes('bg-success', 'Cambio de Imagen Exitoso.'),
          error: ()=> this.emitingAlert('bg-bg-danger', 'Error al Agregar/Cambiar Imagen')
        })
      } catch {
        this.emitingAlert('bg-bg-danger', 'Error Guardar Imagen');
      }
    }
  }

  emitingAlert(type:string, txt:string) {
    this.alertEmit.emit({
      type: type,
      txt: txt,
    });
  }

  onEmit() {
    this.noteOutput.emit(this.note());
  }
}
