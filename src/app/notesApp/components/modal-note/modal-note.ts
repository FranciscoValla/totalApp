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

  private document = inject(DOCUMENT);

  // ... el resto de tus propiedades actuales (inputs, signals, computed)

  // 🚀 Cuando el modal aparece en pantalla, congelamos el fondo
  ngOnInit(): void {
    this.document.body.classList.add('modal-abierto');
  }

  // 🚀 Cuando el modal se cierra (se destruye el componente), descongelamos el fondo
  ngOnDestroy(): void {
    this.document.body.classList.remove('modal-abierto');
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
        const copiaActual = this.noteCurrent();
        this.noteCurrent.set({
          ...copiaActual,
          img: imageCompressBase64,
        });
      } catch {

      }
      inputElement.value = '';
    }
  }

  deleteNote(id: string) {
    this.noteServices.deleteBinFirestore(id).subscribe({
      next: ()=> {
        this.addBin();
      },
      error: ()=> {
        this.emitingAlert('bg-danger', 'Error al Borrar Nota')
        this.emitClose.emit();
      }
    })
    this.emitClose.emit();
  }

  addBin() {
    this.noteServices.addListBinFireStore(this.noteCurrent()).subscribe({
      next: ()=> {
        this.emitingAlert('bg-danger', 'Nota Borrada Correctamente.');
        this.emitClose.emit();
      },
      error: ()=> {
        this.emitingAlert('bg-danger', 'error al Borrar Nota.');
        this.emitClose.emit();
      }
    });
    this.emitClose.emit();
  }

  onClose() {
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
      console.log('Entra en IsUpload')
      this.noteServices.updateNoteFireStore(this.noteInput().id, update).subscribe({
        next: ()=> {
          this.refreshNotes('bg-success', 'Nota Actualizada Correctamente.');
          this.emitClose.emit();
        },
        error:()=>  {
          this.emitingAlert('bg-danger', 'Error al Actualizar Nota.');
          this.emitClose.emit();
        }
      });
    } else {
      // 3. Si el usuario no modificó nada, el modal se cierra al instante
      this.emitClose.emit();
    }
    isUpload.set(false);
  }

   refreshNotes(type:string, txt:string) {
    this.noteServices.getNotesFireStore().subscribe({
      next: () => {
        this.emitingAlert(type, txt);
      },
      error: () => {
        this.emitingAlert('bg-bg-danger', 'Error al Actualizar la Nota.');
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
