import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LineNameI } from "@models/interfaces";
import * as L from 'leaflet';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: [ './sidebar.component.css' ]
})
export class SidebarComponent {
  @Input() lines: LineNameI[] = [];
  @Input() result: LineNameI[] = this.lines;
  @Output() lineSelected = new EventEmitter<LineNameI>();
  @Input() myLocation!: L.Marker;
  @Output() onShowNearestLinesRoutes = new EventEmitter();
  searchText: string = '';
  linesNearest: LineNameI[] = [];
  loadingNearestLines: boolean = false;

  constructor() {
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

  showNearestLinesRoutes() {
    this.onShowNearestLinesRoutes.emit();
  }
}
