import { Component, Input } from '@angular/core';
import { LineNameI } from "@models/interfaces";

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  @Input() lines: LineNameI[] = [];

  getImageUrl(name: string) {
    const lineString = `LINEA ${ name }`.replaceAll(' ', '+');
    return `https://imagenes-micros.s3.amazonaws.com/${ lineString }.jpg`;
  }
}
