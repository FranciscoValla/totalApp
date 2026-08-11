import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-horizontal-menu',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './horizontal-menu.html',
  styleUrl: './horizontal-menu.css',
})
export class HorizontalMenu {}
