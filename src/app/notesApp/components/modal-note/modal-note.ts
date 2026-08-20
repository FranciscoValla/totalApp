import {
  Component,
  computed,
  DOCUMENT,
  inject,
  input,
  linkedSignal,
  OnDestroy,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { Note } from '../../interfaces/note.interface';
import { FormsModule } from '@angular/forms';
import { NoteServices } from '../../services/notes';
import { NgClass } from '@angular/common';
import { SelectColor } from '../select-color/select-color';
import { CompressImage } from '../../services/compress-image';
import { AlertInterface } from '../../pages/bin/bin';
import { finalize, timeout } from 'rxjs';

@Component({
  selector: 'modal-note',
  imports: [FormsModule, NgClass, SelectColor],
  templateUrl: './modal-note.html',
  styleUrl: './modal-note.css',
})
export class ModalNote implements OnInit, OnDestroy {
  noteInput = input.required<Note>();
  noteCurrent = linkedSignal(() => ({ ...this.noteInput() }));
  emitClose = output();
  noteServices = inject(NoteServices);
  iCompService = inject(CompressImage);
  isShowSelectColor = signal(false);
  alertEmit = output<AlertInterface>();
  loadSignal = output<boolean>();

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

  contentAsArray = computed<{ type: boolean; txt: string }[]>(() => {
    const content = this.noteCurrent().content;
    return Array.isArray(content) ? (content as { type: boolean; txt: string }[]) : [];
  });

  private document = inject(DOCUMENT);
  ngOnInit(): void {
    this.document.body.classList.add('modal-abierto');
  }

  ngOnDestroy(): void {
    this.document.body.classList.remove('modal-abierto');
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
    // this.noteServices.updateNoteFireStore(this.noteCurrent().id, { content: nuevoContenido }).subscribe({
    //   next: () => {
    //     this.refreshNotes('bg-success', 'Estado de la tarea actualizado.');
    //   },
    //   error: () => {
    //     this.emitingAlert('bg-danger', 'Error al cambiar estado de la tarea.');
    //   }
    // });
  }

  updateNoteFix() {
    this.noteCurrent.update((current) => ({
      ...current,
      fix: !current.fix,
    }));
  }

  updateColor(newColor: string) {
    this.noteCurrent.update((current) => ({
      ...current,
      color: newColor,
    }));
  }

  async onFileSelected(event: Event):Promise<void> {
    event.stopPropagation();
    event.preventDefault();
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files[0]) {
      const file = inputElement.files[0];
      try {
        const imageCompressBase64 = await this.iCompService.compressFile(file, 1200, 0.4);
        this.noteCurrent.update((current) => ({
        ...current,
        img: imageCompressBase64,
      }));
      } catch {
      }
      inputElement.value = '';
    }
  }

  deleteNote(id: string) {
    this.noteServices.deleteNoteFireStore(id).pipe(
      timeout(6000),
      finalize(() => {}),
    ).subscribe({
      next: () => this.addBin(),
      error: (err) => {
        this.emitingAlert('bg-bg-danger', 'Error al borrar Nota y mandar a Papelera.');
        this.onClose();
      },
    });
  }

    addBin() {
      this.noteServices.addListBinFireStore(this.noteInput()).pipe(
        timeout(6000),
        finalize(() => {}),
      ).subscribe({
        next: () => this.refreshNotes('bg-warning', 'Nota Borrada. Se Manda a Papelera.'),
        error: () => {
          this.emitingAlert('bg-bg-danger', 'Error al borrar Nota y mandar a Papelera.');
          this.onClose();
        }
      });
    }

  onClose() {
    this.loadSignal.emit(true);
    const originalNote = this.noteInput();
    const actualNote = this.noteCurrent();
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
          this.refreshNotes('bg-success', 'Nota Actualizada Correctamente.');
          this.emitClose.emit();
          setTimeout(() => {
            this.loadSignal.emit(false);
          }, 200);
        },
        error:()=>  {
          this.emitingAlert('bg-danger', 'Error al Actualizar Nota.');
          this.emitClose.emit();
          this.loadSignal.emit(false);
        }
      });
    } else {
      this.emitClose.emit();
    }
    isUpload.set(false);
  }

   refreshNotes(type:string, txt:string) {
    this.noteServices.getNotesFireStore().subscribe({
      next: () => {
        this.emitingAlert(type, txt);
        // this.onClose()
        this.emitClose.emit();
      },
      error: () => {
        this.emitingAlert('bg-bg-danger', 'Error al Actualizar la Nota.');
        this.onClose();
      },
    });
  }

  emitingAlert(type:string, txt:string) {
    this.alertEmit.emit({
      type: type,
      txt: txt,
    });
  }
}
