import { AuthServices } from './../../notesApp/services/auth';
import { Component, inject, input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from "@angular/router";
import { AlertInterface } from '../../notesApp/pages/bin/bin';
import { AlertServices } from '../../notesApp/services/alert-services';
import { NoteServices } from '../../notesApp/services/notes';

@Component({
  selector: 'vertical-menu',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './vertical-menu.html',
  styleUrl: './vertical-menu.css',
})
export class VerticalMenu {
  noteService = inject(NoteServices);
  authSevice = inject( AuthServices);
  alertService = inject(AlertServices);

  refreshTokenAuth = signal(localStorage.getItem('refreshTokenAuth') || '');

  logOut () {
    this.authSevice.logOutEmail();
    this.refreshTokenAuth.set(localStorage.getItem('refreshTokenAuth') || '');
    this.noteService.getNotesFireStore().subscribe({
      next: ()=> {

      },
      error: ()=>{
        this.alertService.showAlert({ type: 'bg-danger-subtle', txt: 'Error al cargar notas.' });
      }
    });
    this.alertService.showAlert({type: 'bg-success-subtle', txt: 'Se cerró Sesión. Ahora solo se guardan notas localmente'})
  }
}
