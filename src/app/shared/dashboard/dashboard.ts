import { Component } from '@angular/core';
import { VerticalMenu } from "../vertical-menu/vertical-menu";
import { RouterOutlet } from "@angular/router";
import { HorizontalMenu } from '../horizontal-menu/horizontal-menu';

@Component({
  selector: 'app-dashboard',
  imports: [VerticalMenu, RouterOutlet, HorizontalMenu],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {}
