import { NoteServices } from './../../services/notes';
import { AfterViewInit, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Note } from '../../interfaces/note.interface';
import { LisBin } from "../../components/list-bin/list-bin";
import { ModalBin } from '../../components/modal-bin/modal-bin';

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
  binModal = signal<Note | null>(null);
  showModal = signal(false);
  load = signal(false);
  alertShow = signal<boolean>(false);
  alert = signal<AlertInterface>({
    type: '',
    txt: ''
  });

  ngOnInit(): void {
    this.load.set(true);
    this.notervice.getBinsFireStore().subscribe( {
      next: () => this.load.set(false),
      error: () => {
        this.showAlert({
          type: 'bg-danger',
          txt: 'Erorr al Obtener las Notas.',
        });
      }
  });
  }
  binList = computed(() => {
    return this.notervice.binList();
  });

  isOpen(note: Note) {
    this.binModal.set({ ...note });
    this.showModal.set(true);
  }

  cleanBin () {
    this.notervice.deleteAllBin();
  }

  showAlert ( alert:AlertInterface) {
    this.alert.set({
      type: alert.type,
      txt: alert.txt,
    });
    this.alertShow.set(true);
    setTimeout(() => {
      this.alertShow.set(false);
      this.alert.set({
        type: '',
        txt: ''
      });
    }, 5000);
  }
}
