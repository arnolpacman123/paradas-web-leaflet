import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LineNameI } from "@models/interfaces";
import { FindLineRoute } from "@models/interfaces/line-route";

@Component({
  selector: 'app-lines-list',
  templateUrl: './lines-list.component.html',
  styleUrls: [ './lines-list.component.css' ]
})
export class LinesListComponent {
  @Input() linesNames: LineNameI[] = [];
  @Input() result: LineNameI[] = [];
  @Output() lineSelected = new EventEmitter<FindLineRoute>();
  searchText: string = '';

  getImageUrl(name: string) {
    const lineString = `LINEA ${ name }`.replaceAll(' ', '+');
    return `https://imagenes-micros.s3.amazonaws.com/${ lineString }.jpg`;
  }

  onLineSelected(line: LineNameI, ground: string) {
    this.lineSelected.emit({ name: line.name!, ground });
  }

  search(searchText: string) {
    this.result = this.linesNames.filter((lineName) =>
      lineName.name!.includes(searchText.toUpperCase())
    );
  }

  onSearchText(searchText: string) {
    this.search(searchText);
  }
}
