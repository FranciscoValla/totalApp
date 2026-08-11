import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from "@angular/router";

@Component({
  selector: 'vertical-menu',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './vertical-menu.html',
  styleUrl: './vertical-menu.css',
})
export class VerticalMenu {}
