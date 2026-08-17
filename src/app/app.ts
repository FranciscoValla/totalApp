import { isPlatformBrowser } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private mediaQueryList?: MediaQueryList;

  // Signal reactivo: guarda 'dark' o 'light'
  temaActual = signal<'light' | 'dark'>('light');

    ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
      this.evaluarTema(this.mediaQueryList.matches);

      // Usamos .bind(this) para asegurar que 'this' apunte a la clase dentro del método
      this.mediaQueryList.addEventListener('change', this.escucharCambioTema.bind(this));
    }
  }

  private evaluarTema(esOscuro: boolean): void {
    this.temaActual.set(esOscuro ? 'dark' : 'light');
  }

  // Se declara como un método de clase normal y limpio
  private escucharCambioTema(event: MediaQueryListEvent): void {
    this.evaluarTema(event.matches);
  }

  ngOnDestroy(): void {
    if (this.mediaQueryList) {
      // Al removerlo, también debes pasarle el .bind(this)
      this.mediaQueryList.removeEventListener('change', this.escucharCambioTema.bind(this));
    }
  }

}
