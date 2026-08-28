import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { Note } from '../../interfaces/note.interface';
import { NoteServices } from '../../services/notes';
import { NgClass } from '@angular/common';
import { finalize, timeout } from 'rxjs';
import { CompressImage } from '../../services/compress-image';
import { AlertServices } from '../../services/alert-services';
import { Footer } from "../../atoms/footer/footer";

@Component({
  selector: 'list-note',
  imports: [NgClass, Footer],
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

  onEmit() {
    this.noteOutput.emit(this.note());
  }
}
