import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet.locatecontrol';
import 'leaflet-sidebar-v2';
import 'leaflet.fullscreen';
import { LeafletControlLayersConfig } from "@asymmetrik/ngx-leaflet";
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import { MapService } from "@services/map.service";
import { LineNameI, RoutingResponseI } from "@models/interfaces";
import { SidebarComponent } from "@home/sidebar/sidebar.component";
import { ActivatedRoute } from "@angular/router";
import { FindLineRoute } from "@models/interfaces/line-route";
import { Subscription } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: [ './map.component.css' ]
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  options: L.MapOptions = {
    center: L.latLng(-17.7834, -63.1821),
    zoom: 13,
    layers: [
      L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: [ 'mt0', 'mt1', 'mt2', 'mt3' ],
      }),
    ],
    doubleClickZoom: false,
    attributionControl: false,
    maxBoundsViscosity: 1.0,
    maxBounds: L.latLngBounds(
      L.latLng(-18.4834, -62.1821),
      L.latLng(-17.0834, -64.0821),
    ),
    minZoom: 9.5,
    zoomAnimation: true,
  };

  layersControl: LeafletControlLayersConfig = {
    baseLayers: {
      'Google Maps': L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 22,
        subdomains: [ 'mt0', 'mt1', 'mt2', 'mt3' ],
      }),
      'Google Satellite': L.tileLayer('https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
        maxZoom: 22,
        subdomains: [ 'mt0', 'mt1', 'mt2', 'mt3' ],
      }),
      'Open Street Map': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 20,
      }),
    },
    overlays: {},
  };

  lines: LineNameI[] = [];
  destination!: L.Marker;
  myLocation!: L.Marker;
  // @ts-ignore
  searchControl!: GeoSearchControl;
  routingControl!: L.Routing.Control;
  locateControl!: L.Control.Locate;
  sidebarControl!: L.Control.Sidebar;
  fullScreenControl!: L.Control.Fullscreen;
  lineRoutesSelected: L.Polyline[] = [];
  nearestLinesRoutes: L.Polyline[] = [];
  nearestLinesRoutesToMyQrCode: L.Polyline[] = [];
  map!: L.Map;
  @ViewChild('sidebar', { static: false }) sidebar!: SidebarComponent;
  param!: Object;
  showChannel = false;
  channel!: L.Polyline;
  pointParam!: L.Marker;
  coordinateParam!: L.LatLng;
  showNavTabQrCode = false;
  qrPoints: L.Marker[] = [];
  showQrPoints: boolean = false;

  constructor(
    private readonly mapService: MapService,
    private readonly route: ActivatedRoute,
    private readonly breakpointObserver: BreakpointObserver,
  ) {
    this.subscription = breakpointObserver.observe([
      Breakpoints.HandsetPortrait
    ]).subscribe(result => {
      this.isSmallScreen = result.matches;
    });
  }

  ngOnInit(): void {
    this.mapService.findAllLinesNames().subscribe({
      next: (response) => {
        this.lines = response;
      },
    });
    this.mapService.findQrPoints().subscribe({
      next: (response) => {
        response.forEach((stopPoint) => {
          this.qrPoints.push(L.marker([ stopPoint.geom.coordinates[ 1 ], stopPoint.geom.coordinates[ 0 ] ], {
            icon: L.icon({
              iconSize: [ 30, 30 ],
              iconAnchor: [ 18, 18 ],
              iconUrl: 'assets/images/qr-code.png',
            }),
          }));
        });
      },
    });
  }

  ngAfterViewInit(): void {
    this.route.queryParams.subscribe({
      next: (params: any) => {
        if (params.hasOwnProperty('lat') && params.hasOwnProperty('lng')) {
          const lat = parseFloat(params.lat);
          const lng = parseFloat(params.lng);

          this.mapService.findChannelWithCoordinates(lat, lng).subscribe({
            next: (response) => {
              if (!response) return;
              this.showChannel = true;
              this.showNavTabQrCode = true;
              this.param = { lat, lng };
              this.coordinateParam = L.latLng(lat, lng);
              this.pointParam = L.marker([ lat, lng ], {
                icon: L.icon({
                  iconSize: [ 37, 37 ],
                  iconAnchor: [ 18, 18 ],
                  iconUrl: 'assets/images/qr-code.png',
                  pane: 'overlayPane',
                }),
              });
              this.map.zoomIn(10, {
                animate: true,
              });
              this.map.panTo([ lat, lng ], {
                animate: true,
                duration: 1,
              });
            },
          });
        }
      },
    });
  }

  onDblClickPutMarker($event: L.LeafletMouseEvent) {
    if (this.destination) {
      this.destination.setLatLng($event.latlng);
    } else {
      this.destination = L.marker($event.latlng, {
        icon: L.icon({
          iconSize: [ 21, 33 ],
          iconUrl: 'assets/images/marker-icon.png',
        }),
        draggable: true,
      });
    }

    this.destination.on('dblclick', () => {
      if (this.destination) {
        this.destination.remove();
        this.destination = undefined!;
      }
      if (this.routingControl) {
        this.map.removeEventListener('routesfound');
        this.map.removeControl(this.routingControl);
      }
      this.routingControl = undefined!;
    });

  }

  showRoutingControl() {
    if (this.routingControl) {
      const latLngMyLocation = this.myLocation.getLatLng();
      const latLngDestination = this.destination.getLatLng();
      this.routingControl.setWaypoints([
        L.latLng(latLngMyLocation.lat, latLngMyLocation.lng),
        L.latLng(latLngDestination.lat, latLngDestination.lng),
      ]);
    } else {
      this.assignRoutingControl();
      (this.routingControl as L.Routing.Control).on('routesfound', (e) => {
        e.routes.forEach((routingResponseI: RoutingResponseI) => {
          const coordinates = routingResponseI.coordinates.map((coordinate) => [ coordinate.lng, coordinate.lat ]);
          console.log(coordinates);
        });
      });
      this.map.addControl(this.routingControl);
    }
  }

  assignRoutingControl() {
    this.routingControl = L.Routing.control({
      router: L.Routing.osrmv1({
        language: 'es',
      }),
      plan: L.Routing.plan([
        L.latLng(this.myLocation.getLatLng().lat, this.myLocation.getLatLng().lng),
        L.latLng(this.destination.getLatLng().lat, this.destination.getLatLng().lng),
      ], {
        createMarker: (waypointIndex, _, __) => {
          if (waypointIndex === 1) {
            return this.destination;
          } else {
            return false;
          }
        },
      }),
      routeWhileDragging: true,
      altLineOptions: {
        styles: [
          { color: '#EE675C', weight: 5 },
        ],
        extendToWaypoints: true,
        missingRouteTolerance: 100,
      },
      lineOptions: {
        styles: [
          { color: '#EE675C', weight: 5 },
        ],
        extendToWaypoints: true,
        missingRouteTolerance: 100,
      },
      collapsible: true,
      show: false,
    });
  }

  assignLocationControl() {
    this.locateControl = L.control.locate({
      position: 'bottomright',
      strings: {
        title: 'Mostrar mi ubicación actual',
      },
      locateOptions: {
        enableHighAccuracy: true,
        watch: true,
      },
      keepCurrentZoomLevel: true,
      flyTo: true,
      cacheLocation: true,
    });
  }

  onLocationFound(e: L.LocationEvent) {
    if (this.myLocation) {
      this.myLocation.setLatLng(e.latlng);
    } else {
      this.myLocation = L.marker(e.latlng, {
        icon: L.icon({
          iconSize: [ 21, 33 ],
          iconUrl: 'assets/images/marker-icon.png',
        }),
        draggable: true,
      });
    }
  }

  assignSearchControl() {
    const provider = new OpenStreetMapProvider({
      params: {
        countrycodes: 'bo',
      },
    });
    this.searchControl = GeoSearchControl({
      provider: provider,
      marker: {
        icon: L.icon({
          iconSize: [ 21, 33 ],
          iconUrl: 'assets/images/marker-icon.png',
        }),
        draggable: true,
      },
      notFoundMessage: 'No se encontraron resultados',
      searchLabel: 'Ingrese el destino',
    });
  }

  assignSidebarControl() {
    this.sidebarControl = L.control.sidebar({
      closeButton: true,
      position: 'left',
      container: 'sidebar',
      autopan: true,
    });
  }

  onGeosearchShowLocation(e: L.LeafletEvent) {
    console.log(e);
    this.destination = (e as any).marker;
    if (this.myLocation) {
      this.showRoutingControl();
    }
  }

  onLocateDeactivate(_: L.LeafletEvent) {
    this.myLocation.remove();
    this.myLocation = undefined!;
  }

  async onMapReady($event: L.Map) {
    this.map = $event;
    this.assignFullScreenControl();
    this.map.addControl(this.fullScreenControl);
    this.assignSidebarControl();
    this.map.addControl(this.sidebarControl);
    this.assignLocationControl();
    this.map.addControl(this.locateControl);
    this.map.on('locationfound', this.onLocationFound.bind(this));
    this.map.on('locationerror', this.onLocationError.bind(this));
    this.map.on('locatedeactivate', this.onLocateDeactivate.bind(this));
    this.assignSearchControl();
    this.map.addControl(this.searchControl);
    this.map.on('geosearch/showlocation', this.onGeosearchShowLocation.bind(this));
  }
  assignFullScreenControl() {
    this.fullScreenControl = L.control.fullscreen({
      position: 'topleft',
      title: 'Pantalla completa',
      content: '<i class="fas fa-expand"></i>',
      forceSeparateButton: true,
    });
  }

  onLocationError(_: L.LeafletEvent) {
    if (this.myLocation) {
      this.myLocation.remove();
      this.myLocation = undefined!;
    }
  }

  lineSelected($event: FindLineRoute) {
    this.lineRoutesSelected = [];
    this.mapService.findLineRoutesByName($event).subscribe({
      next: (response) => {
          const coordinates = response.geom.coordinates.map((coordinate) => L.latLng(coordinate[ 1 ], coordinate[ 0 ]));
          this.lineRoutesSelected.push(L.polyline(coordinates, {
            color: '#EE675C',
            weight: 5,
          }));
        this.sidebarControl.close();
      },
    });
  }

  onShowNearestLinesRoutes() {
    this.nearestLinesRoutes = [];
    this.sidebar.loadingNearestLines = true;
    const coordinate: [ number, number ] = [ this.myLocation.getLatLng().lng, this.myLocation.getLatLng().lat ];
    this.mapService.findNearestLineRoute({ coordinate }).subscribe({
      next: (linesNames) => {
        this.sidebar.linesNearest = linesNames;
        this.sidebar.loadingNearestLines = false;
      },
      error: (_) => {
        this.sidebar.loadingNearestLines = false;
        console.clear();
      },
    });
  }

  planeTravel() {
    const myLocationCoordinate: [ number, number ] = [ this.myLocation.getLatLng().lng, this.myLocation.getLatLng().lat ];
    const destinationCoordinate: [ number, number ] = [ this.destination.getLatLng().lng, this.destination.getLatLng().lat ];
    console.log({ myLocationCoordinate, destinationCoordinate });
  }

  toggleMyQrCode() {
    if (this.pointParam) {
      this.pointParam.remove();
      this.pointParam = undefined!;
    } else {
      this.pointParam = L.marker([ this.coordinateParam.lat, this.coordinateParam.lng ], {
        icon: L.icon({
          iconSize: [ 30, 30 ],
          iconAnchor: [ 18, 18 ],
          iconUrl: 'assets/images/qr-code.png',
        }),
      });
    }
    this.sidebarControl.close();
  }

  onShowQrPoints() {
    this.sidebar.loadingQr = true;
    this.showQrPoints = !this.showQrPoints;
    this.sidebar.loadingQr = false;
    this.sidebarControl.close();
  }

  onShowLinesNearMyQrCode() {
    this.nearestLinesRoutesToMyQrCode = [];
    this.sidebar.loadingLinesNearMyQrCode = true;
    const coordinate: [ number, number ] = [ this.coordinateParam.lng, this.coordinateParam.lat ];
    this.mapService.findNearestLineRoute({ coordinate }).subscribe({
      next: (linesNames) => {
        this.sidebar.linesNearMyQrCode = linesNames;
        this.sidebar.loadingLinesNearMyQrCode = false;
      },
      error: (_) => {
        this.sidebar.loadingLinesNearMyQrCode = false;
        console.clear();
      },
    });
  }

  isSmallScreen = false;
  private subscription!: Subscription;

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  styleMap(): string {
    if (this.isSmallScreen) {
      return "height: calc(100% - 168px); width: 100%";
    } else {
      return 'height: calc(100% - 140px); width: 100%;';
    }
  }
}
