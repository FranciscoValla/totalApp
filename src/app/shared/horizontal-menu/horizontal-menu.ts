import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NoteServices } from '../../notesApp/services/notes';
import { AuthServices } from '../../notesApp/services/auth';
import { AlertServices } from '../../notesApp/services/alert-services';

@Component({
  selector: 'app-horizontal-menu',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './horizontal-menu.html',
  styleUrl: './horizontal-menu.css',
})
export class HorizontalMenu {
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
