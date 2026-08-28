import { HttpClient } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { Observable, tap } from 'rxjs';

@Service()
export class AuthServices {
  private http = inject(HttpClient);
  private apiKey = environment.apiKeyFirebase;

  currentUserToken = signal<string | null> (localStorage.getItem('tokenAuth'));

  loginEmail ( email:string, password:string): Observable<any> {
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${this.apiKey}`;
    const bodyLogin = {
      email: email,
      password: password,
      returnSecureToken: true
    };
    return  this.http.post<any>( url, bodyLogin).pipe(
      tap( response => {
        console.log('>>> Response:', response);
        localStorage.setItem('tokenAuth', response.idToken);
        localStorage.setItem('refreshTokenAuth', response.refreshToken)
        this.currentUserToken.set(response.idToken);
      })
    );
  }

  refreshToken (): Observable<any> {
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${this.apiKey}`;
    const savedRefreshToken = localStorage.getItem('refreshTokenAuth');
    const bodyRefresh = {
      grant_type: 'refresh_token',
      refreshToken: savedRefreshToken
    };
    return this.http.post<any>(url, bodyRefresh).pipe(
      tap ( response =>{
        localStorage.setItem('tokenAuth', response.id_token);
      })
    );
  }

  logOutEmail () {
    localStorage.removeItem('tokenAuth');
    localStorage.removeItem('refreshTokenAuth')
    this.currentUserToken.set('');
  }
}
