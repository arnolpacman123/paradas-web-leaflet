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
  @Input() destination!: L.Marker;
  @Output() onShowNearestLinesRoutes = new EventEmitter();
  @Output() onPlaneTravel = new EventEmitter();
  searchTextAllLines: string = '';
  searchTextNearestLines: string = '';
  linesNearest: LineNameI[] = [];
  loadingNearestLines: boolean = false;

  constructor() {
  }

  onLineSelected(line: LineNameI) {
    this.lineSelected.emit(line);
  }

  search(searchText: string) {
    this.result = this.lines.filter((line) =>
      line.name!.includes(searchText.toUpperCase())
    );
  }

  onSearchText(searchText: string) {
    this.search(searchText);
  }

  showNearestLinesRoutes() {
    this.onShowNearestLinesRoutes.emit();
  }

  planeTravel() {
    this.onPlaneTravel.emit();
  }
}
