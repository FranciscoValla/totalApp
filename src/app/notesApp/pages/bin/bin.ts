import { NoteServices } from './../../services/notes';
import { AfterViewInit, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Note } from '../../interfaces/note.interface';
import { LisBin } from "../../components/list-bin/list-bin";
import { ModalBin } from '../../components/modal-bin/modal-bin';
import { AlertServices } from '../../services/alert-services';

export interface AlertInterface {
  type: string;
  txt: string;
}

@Component({
  selector: 'app-bin',
  imports: [ LisBin, ModalBin],
  templateUrl: './bin.html',
  styleUrl: './bin.css',
})
export class Bin implements OnInit {
  notervice = inject(NoteServices);
  alertService = inject(AlertServices);
  binModal = signal<Note | null>(null);
  showModal = signal(false);
  load = signal(false);

  ngOnInit(): void {
    this.load.set(true);
    this.notervice.getBinsFireStore().subscribe({
      next: () => this.load.set(false),
      error: (err) => {
        this.alertService.showAlert({type:'bg-danger-subtle', txt:'Erorr al Obtener las Notas.'});
      },
    });
  }

  binList = computed(() => {
    return this.notervice.binList().sort( (a,b) => new Date(a.date).getTime() - new Date(b.date).getTime() );
  });

  isOpen(note: Note) {
    this.binModal.set({ ...note });
    this.showModal.set(true);
  }

  cleanBin () {
    this.notervice.deleteAllBin();
  }
}
