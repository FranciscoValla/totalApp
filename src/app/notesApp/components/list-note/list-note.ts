import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { Note } from '../../interfaces/note.interface';
import { NoteServices } from '../../services/notes';
import { NgClass } from '@angular/common';
import { SelectColor } from '../select-color/select-color';
import { finalize, timeout } from 'rxjs';
import { AlertInterface } from '../../pages/bin/bin';
import { CompressImage } from '../../services/compress-image';
import { AlertServices } from '../../services/alert-services';

@Component({
  selector: 'list-note',
  imports: [NgClass, SelectColor],
  templateUrl: './list-note.html',
  styleUrl: './list-note.css',
})
export class ListNote {
  noteServices = inject(NoteServices);
  compressServices = inject(CompressImage);
  alerService = inject(AlertServices);
  note = input.required<Note>();
  noteOutput = output<Note>();
  loadSignal = output<boolean>();

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

  isArray = computed(() => {
    const content = this.note().content;
    return Array.isArray(content); // ✨ Esto devolverá estrictamente true o false
  });

  contentAsArray = computed<{ type: boolean; txt: string }[]>(() => {
    const content = this.note().content;
    return Array.isArray(content) ? (content as { type: boolean; txt: string }[]) : [];
  });

  deleteNote(id: string) {
    this.loadSignal.emit(true);
    this.noteServices.deleteNoteFireStore(id).pipe(
      timeout(6000),
      finalize(() => {}),
    ).subscribe({
      next: () => this.addBin(),
      error: (err) => {
        this.alerService.showAlert({type:'bg-danger-subtle', txt:'Error al borrar Nota y mandar a Papelera.'});
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
      this.alerService.showAlert({type:'bg-danger-subtle', txt:'Error al borrar Nota y mandar a Papelera.'})
    });
  }

  refreshNotes(type:string, txt:string) {
    this.noteServices.getNotesFireStore().subscribe({
      next: () => {
        this.alerService.showAlert({type:type, txt:txt});
        this.loadSignal.emit(false);
      },
      error: (err) => {
        this.alerService.showAlert({type:'bg-danger-subtle', txt:'Error al Obtener las Notas.'});
        this.loadSignal.emit(false);
      },
    });
  }

  changeState( indexTarget:number) {
    const contenidoActual = Array.isArray(this.note().content)
      ? (this.note().content as { type: boolean; txt: string }[])
      : [];
    const nuevoContenido = contenidoActual.map((item, index) => {
      if (index === indexTarget) {
        return { ...item, type: !item.type };
      }
      return item;
    });
    this.noteServices.updateNoteFireStore(this.note().id, { content: nuevoContenido }).subscribe({
      next: () => {
        this.refreshNotes('bg-success', 'Estado de la tarea actualizado.');
      },
      error: () => {
        this.alerService.showAlert({type:'bg-danger-subtle', txt:'Error al cambiar estado de la tarea.'});
      }
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
        this.alerService.showAlert({type:'bg-danger-subtle', txt:'Error al Fijar/Normal.'})
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
      error: ()=> this.alerService.showAlert({type:'bg-danger-subtle', txt:'Error al Cambiar Color.'})
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
          error: ()=> this.alerService.showAlert({type:'bg-danger-subtle', txt:'Error al Agregar/Cambiar Imagen.'})
        })
      } catch {
        this.alerService.showAlert({type:'bg-danger-subtle', txt:'Error Guardar Imagen.'});

      }
    }
  }

  onEmit() {
    this.noteOutput.emit(this.note());
  }
}
