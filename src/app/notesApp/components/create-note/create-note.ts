import {
  Component,
  ElementRef,
  HostListener,
  inject,
  signal,
  computed,
  output,
  viewChildren,
  effect,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NoteServices } from '../../services/notes';
import { Note } from '../../interfaces/note.interface';
import { NgClass } from '@angular/common';
import { SelectColor } from '../select-color/select-color';
import { AlertInterface } from '../../pages/bin/bin';
import { CompressImage } from '../../services/compress-image';
declare var bootstrap: any;

@Component({
  selector: 'create-note',
  imports: [FormsModule, NgClass, SelectColor],
  templateUrl: './create-note.html',
  styleUrl: './create-note.css',
})
export class CreateNote {
  noteServices = inject(NoteServices);
  iComprService = inject(CompressImage);
  private elementRef = inject(ElementRef);

  isExpanded = signal(false);
  isList = signal(false);
  listNote = signal<{ type: boolean; txt: string }[]>([]);
  showListButton = signal(true);
  elementosInput = viewChildren<ElementRef<HTMLInputElement>>('notaInput');
  isShowSelectColor = signal(false);

  loadSignal = output<boolean>();
  alertEmit = output<AlertInterface>();
  imagenUrl = signal<string | null>(null);

  title = signal('');
  content = signal('');
  fix = signal(false);
  color = signal('bg-white');
  textcolor = computed(() => {
    switch (this.color()) {
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

  constructor() {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
    effect(() => {
      const inputs = this.elementosInput();
      if (inputs.length > 0) {
        // Tomamos el último input renderizado en pantalla y le damos foco
        const ultimoInput = inputs[inputs.length - 1].nativeElement;
        ultimoInput.focus();
      }
    });
  }

  @HostListener('document:click', ['$event'])
  onclickOutside(event: MouseEvent) {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      if (this.title().trim().length === 0 && this.content().trim().length === 0) {
        this.isExpanded.set(false);
        this.fix.set(false);
        this.imagenUrl.set(null);
        this.isList.set(false);
        this.listNote.set([]);
        this.showListButton.set(true);
      } else {
        this.createNote();
      }
      this.color.set('bg-white');
    }
  }

  onEnter(event: Event) {
    event.preventDefault();
    this.listNote.update(lista => [...lista, {type:true, txt: ''}]);
    setTimeout(() => {
      const inputs = this.elementosInput();
      if (inputs.length > 0) {
        inputs[inputs.length - 1].nativeElement.focus();
      }
    }, 10);
  }

  deleteliList (indexDelete:number) {
    this.listNote.update( li =>
      li.filter( (_item,index) => index !== indexDelete )
    );
  }
  createNote() {
    let contenTemp:any;
      if( this.isList() ) {
        contenTemp = this.listNote();
      } else {
        contenTemp = this.content();
      }
    if (
      this.title().trim().length === 0 &&
      contenTemp.length === 0 &&
      this.imagenUrl() === null
    ) {
      this.isExpanded.set(false);
      this.fix.set(false);
      this.color.set('bg-white');
      this.imagenUrl.set(null);
      this.isList.set(false);
      this.listNote.set([]);
      this.showListButton.set(true);
      this.alertEmit.emit({
        type: 'bg-warning',
        txt: 'Nota vacía. No se creó la Nota.',
      });
    } else {

      this.loadSignal.emit(true);
      const newNote: Note = {
        id: Math.random().toString(36).substring(2, 8).toUpperCase(),
        title: this.title(),
        content: contenTemp,
        fix: this.fix(),
        color: this.color(),
        img: this.imagenUrl(),
        date: new Date(),
      };
      this.noteServices.createNoteFireStore(newNote).subscribe( ()=> {
        this.refreshNotes();
        this.isExpanded.set(false);
        this.title.set('');
        this.content.set('');
        this.fix.set(false);
        this.imagenUrl.set(null);
        this.color.set('bg-white');
        this.isList.set(false);
        this.listNote.set([]);
        this.showListButton.set(true);
      }, () => {
        this.alertEmit.emit({
          type: 'bg-bg-danger',
          txt: 'Error al guardar la Nota. No se creó la Nota.',
        });
        this.isExpanded.set(false);
        this.title.set('');
        this.content.set('');
        this.fix.set(false);
        this.imagenUrl.set(null);
        this.color.set('bg-white');
        this.isList.set(false);
        this.listNote.set([]);
        this.showListButton.set(true);
      });
    }
  }

  refreshNotes() {
    this.noteServices.getNotesFireStore().subscribe( ()=> {
      this.alertEmit.emit({
        type: 'bg-success',
        txt: 'Nota Creada.',
      });
      this.loadSignal.emit(false);
    }, () => {
      this.alertEmit.emit({
          type: 'bg-bg-danger',
          txt: 'Error al cargar notas.',
        });
      this.loadSignal.emit(false);
    })
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      try {
        const imageCompressBase64 = await this.iComprService.compressFile(file, 1200, 0.4);
        this.imagenUrl.set(imageCompressBase64);
      } catch {
        this.alertEmit.emit({
          type: 'bg-bg-danger',
          txt: 'Error al guardar la imagen',
        });
      }
    }
  }
}
