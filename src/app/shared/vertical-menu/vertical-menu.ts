import { AuthServices } from './../../notesApp/services/auth';
import { Component, inject, input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from "@angular/router";
import { AlertInterface } from '../../notesApp/pages/bin/bin';
import { AlertServices } from '../../notesApp/services/alert-services';

@Component({
  selector: 'vertical-menu',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './vertical-menu.html',
  styleUrl: './vertical-menu.css',
})
export class VerticalMenu {
  authSevice = inject( AuthServices);
  alertService = inject(AlertServices);

  tokenAuthRefresh = signal(localStorage.getItem('tokenAuthRefresh') || '');

  logOut () {
    console.log('>>>: ', this.tokenAuthRefresh());
    this.authSevice.logOutEmail();
    this.tokenAuthRefresh.set(localStorage.getItem('tokenAuthRefresh') || '');
    this.alertService.showAlert({type: 'bg-success-subtle', txt: 'Se cerró Sesión. Ahora solo se guardan notas localmente'})
  }
}
