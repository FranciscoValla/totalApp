import { NoteServices } from './../../services/notes';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Note } from '../../interfaces/note.interface';
import { CreateNote } from '../../components/create-note/create-note';
import { ListNote } from '../../components/list-note/list-note';
import { ModalNote } from '../../components/modal-note/modal-note';
import { AlertInterface } from '../bin/bin';
import { AlertServices } from '../../services/alert-services';

@Component({
  selector: 'app-notes',
  imports: [FormsModule, CreateNote, ListNote, ModalNote],
  templateUrl: './notes.html',
  styleUrl: './notes.css',
})
export class Notes implements OnInit {
  noteModal = signal<Note | null>(null);
  showModal = signal(false);
  noteServices = inject(NoteServices);
  alertService = inject(AlertServices)
  load = signal(false);

  ngOnInit(): void {
    this.load.set(true);
    this.noteServices.getNotesFireStore().subscribe({
      next: () => this.load.set(false),
      error: (err) => {
        this.alertService.showAlert({type:'bg-danger-subtle', txt:'Erorr al Obtener las Notas.'})
      },
    });
  }

  isOpen(note: Note) {
    this.noteModal.set({ ...note });
    this.showModal.set(true);
  }

  notesFix = computed(() => {
  return this.noteServices.noteList().filter((note) => note.fix)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // <--- Ordena de más nueva a más vieja
  });

  notesNormal = computed(() => {
    return this.noteServices.noteList().filter((note) => !note.fix)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });
}
