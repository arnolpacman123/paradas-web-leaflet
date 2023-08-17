import {Component, EventEmitter, Input, Output} from '@angular/core';
import {LineNameI} from "@models/interfaces";

@Component({
  selector: 'app-lines-list',
  templateUrl: './lines-list.component.html',
  styleUrls: ['./lines-list.component.css']
})
export class LinesListComponent {
  @Input() linesNames: LineNameI[] = [];
  @Output() lineSelected = new EventEmitter<LineNameI>();

  getImageUrl(name: string) {
    const lineString = `LINEA ${ name }`.replaceAll(' ', '+');
    return `https://imagenes-micros.s3.amazonaws.com/${ lineString }.jpg`;
  }

  onLineSelected(line: LineNameI) {
    this.lineSelected.emit(line);
  }

  onLineInfoSelected(line: LineNameI) {

  }
}
