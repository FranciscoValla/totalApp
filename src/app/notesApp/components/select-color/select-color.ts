import { Component, effect, ElementRef, HostListener, inject, input, output, signal } from '@angular/core';

@Component({
  selector: 'select-color',
  imports: [],
  templateUrl: './select-color.html',
  styleUrl: './select-color.css',
})
export class SelectColor {
  private elementRef = inject(ElementRef);
  colorInput = input.required<string>();
  hideSelect = output();
  colorSelectOutput = output<string>();

  listadoColores = [
    { bg: 'bg-white', text: 'text-dark', border: 'border border-dark' }, // El primero blanco
    { bg: 'bg-primary', text: 'text-white', border: '' },
    { bg: 'bg-secondary', text: 'text-white', border: '' },
    { bg: 'bg-success', text: 'text-white', border: '' },
    { bg: 'bg-danger', text: 'text-white', border: '' },
    { bg: 'bg-warning', text: 'text-dark', border: '' },
    { bg: 'bg-info', text: 'text-dark', border: '' },
    { bg: 'bg-dark', text: 'text-white', border: '' }
  ];

  colorSelecionado = signal('');

  constructor() {
    effect( ()=> {
      this.colorSelecionado.set(this.colorInput());
    })
  }

  @HostListener('window:click', ['$event']) // 💡 Escucha la ventana global
onclickOutside(event: MouseEvent) {
  const clickedInside = this.elementRef.nativeElement.contains(event.target);
  console.log('>>> Clic dentro del átomo:', clickedInside);

  if (!clickedInside) {
    this.hideSelect.emit();
  }
}

  changueColor () {
    this.colorSelectOutput.emit(this.colorSelecionado());
  }
}
