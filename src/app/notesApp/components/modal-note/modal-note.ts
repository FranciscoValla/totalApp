import {
  Component,
  computed,
  DOCUMENT,
  effect,
  ElementRef,
  inject,
  input,
  linkedSignal,
  output,
  signal,
  viewChildren,
} from '@angular/core';
import { Note } from '../../interfaces/note.interface';
import { FormsModule } from '@angular/forms';
import { NoteServices } from '../../services/notes';
import { NgClass } from '@angular/common';
import { AlertServices } from '../../services/alert-services';
import { Footer } from "../../atoms/footer/footer";
import { CdkTextareaAutosize } from '@angular/cdk/text-field';

@Component({
  selector: 'modal-note',
  imports: [FormsModule, NgClass, Footer, CdkTextareaAutosize],
  templateUrl: './modal-note.html',
  styleUrl: './modal-note.css',
})
export class ModalNote {
  noteInput = input.required<Note>();
  noteCurrent = linkedSignal(() => ({ ...this.noteInput() }));
  alerService = inject(AlertServices);
  emitClose = output();
  noteServices = inject(NoteServices);

  loadSignal = output<boolean>();
  contentArray = linkedSignal<{ type: boolean; txt: string }[]>( ()=> {
    return Array.isArray(this.noteCurrent().content) ? (this.noteCurrent().content as {type: boolean; txt:string}[]): [];
  });
  elementosInput = viewChildren<ElementRef<HTMLInputElement>>('notaInput');
  textColor = computed(() => {
    switch (this.noteCurrent().color) {
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
    if( Array.isArray( this.noteCurrent().content) ) {
      return true;
    } else  {
      return false;
    }
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

  onEnter(event: Event) {
    event.preventDefault();
    this.contentArray.update((lista) => [...lista, { type: true, txt: '' }]);
    this.noteCurrent.update( list => ({
      ...list, content: this.contentArray()
    }));
    setTimeout(() => {
      const inputs = this.elementosInput();
      if (inputs.length > 0) {
        inputs[inputs.length - 1].nativeElement.focus();
      }
    }, 10);
  }

  deleteList(indexDelete:number){
    this.contentArray.update( (list)=> list.filter( (_item, index) => index !== indexDelete));
    this.noteCurrent.update( list => ({
      ...list, content: this.contentArray()
    }));
  }

  changeState( indexTarget:number) {
    const contenidoActual = Array.isArray(this.noteCurrent().content)
      ? (this.noteCurrent().content as { type: boolean; txt: string }[])
      : [];
    const nuevoContenido = contenidoActual.map((item, index) => {
      if (index === indexTarget) {
        return { ...item, type: !item.type };
      }
      return item;
    });
    this.noteCurrent.update( (current)=> ({
      ...current, content: nuevoContenido
    }));
  }

  onClose( event?: Event) {
    if (event) {
      const target = event.target as HTMLElement;
      if (target.closest('.card')) {
        return;
      }
    }

    this.loadSignal.emit(true);
    const originalNote = this.noteInput();
    const actualNote = this.noteCurrent();
    actualNote.content = Array.isArray(actualNote.content) ? this.contentArray() : actualNote.content;
    const update:Partial<Note> = {};
    const isUpload = signal(false);
    if ( originalNote.title !== actualNote.title){
      update.title = actualNote.title;
      isUpload.set(true);
    }
    if ( originalNote.content !== actualNote.content){
      update.content = actualNote.content;
      isUpload.set(true);
    }
    if ( originalNote.color !== actualNote.color){
      update.color = actualNote.color;
      isUpload.set(true);
    }
    if ( originalNote.fix !== actualNote.fix){
      update.fix = actualNote.fix;
      isUpload.set(true);
    }
    if ( originalNote.img !== actualNote.img){
      update.img = actualNote.img;
      isUpload.set(true);
    }
    if( isUpload() ) {
      this.noteServices.updateNoteFireStore(this.noteInput().id, update).subscribe({
        next: ()=> {
          this.refreshNotes('bg-success-subtle', 'Nota Actualizada Correctamente.');
          this.emitClose.emit();
          setTimeout(() => {
            this.loadSignal.emit(false);
          }, 200);
        },
        error:()=>  {
          this.emitingAlert('bg-danger-subtle', 'Error al Actualizar Nota.');
          this.emitClose.emit();
          this.loadSignal.emit(false);
        }
      });
    } else {
      this.emitClose.emit();
      this.loadSignal.emit(false);
    }
    isUpload.set(false);
  }

   refreshNotes(type:string, txt:string) {
    this.noteServices.getNotesFireStore().subscribe({
      next: () => {
        this.emitingAlert(type, txt);
        this.emitClose.emit();
        this.loadSignal.emit(false);
      },
      error: () => {
        this.emitingAlert('bg-danger-subtle', 'Error al Actualizar la Nota.');
        this.onClose();
      },
    });
  }

  emitingAlert(type:string, txt:string) {
    this.alerService.showAlert({type: type, txt: txt});
  }
}
