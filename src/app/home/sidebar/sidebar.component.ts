import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LineNameI } from "@models/interfaces";

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: [ './sidebar.component.css' ]
})
export class SidebarComponent {
  @Input() lines: LineNameI[] = [];
  @Input() result: LineNameI[] = this.lines;
  @Output() lineSelected = new EventEmitter<LineNameI>();
  searchText: string = '';

  constructor() {
  }

  getImageUrl(name: string) {
    const lineString = `LINEA ${ name }`.replaceAll(' ', '+');
    return `https://imagenes-micros.s3.amazonaws.com/${ lineString }.jpg`;
  }

  onLineSelected(line: LineNameI) {
    this.lineSelected.emit(line);
  }

  onLineInfoSelected(line: LineNameI) {

  }

  search(searchText: string) {
    this.result = this.lines.filter((line) =>
      line.name!.includes(searchText.toUpperCase())
    );
  }

  onSearchText() {
    this.search(this.searchText);
  }
}
