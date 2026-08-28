import { Component, computed, inject, input, linkedSignal, output, signal } from '@angular/core';
import { SelectColor } from "../../components/select-color/select-color";
import { finalize, timeout } from 'rxjs';
import { Note } from '../../interfaces/note.interface';
import { CompressImage } from '../../services/compress-image';
import { NgClass } from '@angular/common';
import { NoteServices } from '../../services/notes';
import { AlertServices } from '../../services/alert-services';

@Component({
  selector: 'atom-footer',
  imports: [SelectColor,NgClass],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  isList = input<boolean>(false);
  noteInput = input.required<Note>();
  closeOutput = output();
  updateOutput = output<Note>();
  refresOutput = output<any>();
  loadOutput = output<boolean>();
  iCompService = inject(CompressImage);
  noteServices = inject(NoteServices);
  alerService = inject(AlertServices);
  noteCurrent = linkedSignal(() => ({ ...this.noteInput() }));
  isShowSelectColor = signal(false);

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

  updateColor(newColor: string) {
    this.noteCurrent.update((current) => ({
      ...current,
      color: newColor,
    }));
    this.updateOutput.emit(this.noteCurrent());
    if ( this.isList() ) {
      this.noteServices.updateNoteFireStore(this.noteCurrent().id, { color: this.noteCurrent().color}).subscribe({
      next: ()=> this.refresOutput.emit({type:'bg-success-subtle', txt:'Cambio de Color Exitoso.'}),
      error: ()=> this.alerService.showAlert({type:'bg-danger-subtle', txt:'Error al Cambiar Color.'})
    })
    }
  }

  updateNoteFix() {
    this.noteCurrent.update((current) => ({
      ...current,
      fix: !current.fix,
    }));
    this.updateOutput.emit(this.noteCurrent());
    if ( this.isList() ){
      this.noteServices.updateNoteFireStore(this.noteCurrent().id, { fix: this.noteCurrent().fix }).subscribe({
        next: () => this.refresOutput.emit({type:'bg-success-subtle', txt:'Se cambio Fijo/Normal.'}),
        error: () =>
          this.alerService.showAlert({type:'bg-danger-subtle', txt:'Error al Fijar/Normal.'})
      });
    }
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
      this.updateOutput.emit(this.noteCurrent());
      if ( this.isList() ){
        this.noteServices.updateNoteFireStore(this.noteCurrent().id, {img: this.noteCurrent().img}).subscribe({
          next: ()=> this.refresOutput.emit({type:'bg-success-subtle', txt:'Se cambio Imagen.'}),
          error: ()=> this.alerService.showAlert({type:'bg-danger-subtle', txt:'Error al Agregar/Cambiar Imagen.'})
        })
      }
      } catch {
        this.alerService.showAlert({type:'bg-danger-subtle', txt:'Error Guardar Imagen.'});
      }
      inputElement.value = '';
    }
  }

  deleteNote(id: string) {
    this.loadOutput.emit(true);
    this.noteServices.deleteNoteFireStore(id).pipe(
      timeout(6000),
      finalize(() => {}),
    ).subscribe({
      next: () => this.addBin(),
      error: (err) => {
        this.alerService.showAlert({type:'bg-danger-subtle', txt: 'Error al borrar Nota y mandar a Papelera.'});
        this.closeOutput.emit();
      },
    });
  }

  addBin() {
    this.noteServices.addListBinFireStore(this.noteInput()).pipe(
      timeout(6000),
      finalize(() => {}),
    ).subscribe({
      next: () => this.refresOutput.emit({type:'bg-warning-subtle', txt:'Nota Borrada. Se Manda a Papelera.'}),
      error: () => {
        this.alerService.showAlert({type:'bg-danger-subtle', txt: 'Error al borrar Nota y mandar a Papelera.'});
        this.closeOutput.emit();
      }
    });
  }

}
