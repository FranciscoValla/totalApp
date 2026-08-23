import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthServices } from '../../services/auth';
import { Location } from '@angular/common';
import { AlertServices } from '../../services/alert-services';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email = signal('');
  password = signal('');
  authService = inject(AuthServices);
  alerService = inject(AlertServices);
  private location = inject(Location);

  backPage() {
    // 2. 🔥 LA MAGIA: Angular le dice al navegador "da un paso atrás en tu historial"
    this.location.back();
  }

  login () {
    if( this.email() !== '' && this.password() !== '') {
      this.authService.loginEmail(this.email(), this.password()).subscribe({
        next: ()=>{
          this.alerService.showAlert({type: 'bg-success-subtle', txt: 'Se Inició Sesión exitosamente.'});
          this.location.back();
        },
        error: ()=> {
          this.alerService.showAlert({type: 'bg-danger-subtle', txt: 'Error al iniciar Sesión'});
          this.location.back();
        }
      });
    }
  }
}
