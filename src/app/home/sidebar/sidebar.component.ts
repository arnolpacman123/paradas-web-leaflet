import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LineNameI } from "@models/interfaces";
import * as L from 'leaflet';
import { FindLineRoute } from "@models/interfaces/line-route";

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: [ './sidebar.component.css' ]
})
export class SidebarComponent {
  @Input() lines: LineNameI[] = [];
  @Input() result: LineNameI[] = this.lines;
  @Output() onLineSelected = new EventEmitter<FindLineRoute>();
  @Input() myLocation!: L.Marker;
  @Input() destination!: L.Marker;
  @Output() onShowNearestLinesRoutes = new EventEmitter();
  @Output() onPlaneTravel = new EventEmitter();
  @Input() showNavTabQrCode: boolean = false;
  @Input() toggleMyQrCode: boolean = false;
  @Output() onToggleMyQrCode = new EventEmitter<boolean>();
  @Output() onShowQrPoints = new EventEmitter();
  @Output() onShowLinesNearMyQrCode = new EventEmitter();
  linesNearest: LineNameI[] = [];
  linesNearMyQrCode: LineNameI[] = [];
  loadingNearestLines: boolean = false;
  loadingLinesNearMyQrCode: boolean = false;
  loadingQr: boolean = false;
  toggleQrPoints: boolean = false;

  constructor() {
  }

  _onLineSelected(findLineRoute: FindLineRoute) {
    this.onLineSelected.emit(findLineRoute);
  }

  showNearestLinesRoutes() {
    this.onShowNearestLinesRoutes.emit();
  }

  planeTravel() {
    this.onPlaneTravel.emit();
  }

  _onToggleMyQrCode() {
    this.toggleMyQrCode = !this.toggleMyQrCode;
    this.onToggleMyQrCode.emit(this.toggleMyQrCode);
  }

  showQrPoints() {
    this.onShowQrPoints.emit();
    this.toggleQrPoints = !this.toggleQrPoints;
  }

  _onShowLinesNearMyQrCode() {
    this.onShowLinesNearMyQrCode.emit();
  }
}
