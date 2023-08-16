import { AfterViewInit, Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet.locatecontrol';
import 'leaflet-sidebar-v2';
import { LeafletControlLayersConfig } from "@asymmetrik/ngx-leaflet";
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import { MapService } from "@services/map.service";
import { LineNameI } from "@models/interfaces";

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: [ './map.component.css' ]
})
export class MapComponent implements OnInit, AfterViewInit {
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
    minZoom: 9,
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
  searchControl!: SearchControl;
  routingControl!: L.Routing.Control;
  locateControl!: L.Control.Locate;
  sidebarControl!: L.Control.Sidebar;
  lineRoutesSelected: L.Polyline[] = [];
  map!: L.Map;

  constructor(
    private readonly mapService: MapService,
  ) {
  }

  ngOnInit(): void {
    this.mapService.findAllLinesNames().subscribe({
      next: (response) => {
        this.lines = response;
      },
    });
  }

  ngAfterViewInit(): void {
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

    if (this.myLocation) {
      this.showRoutingControl();
    }

    this.destination.on('dblclick', () => {
      this.destination = undefined!;
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
        e.routes.forEach((route: any) => {
          const coordinates = route.coordinates.map((coordinate: any) => [ coordinate.lng, coordinate.lat ]);
          this.mapService.findBestLineRoute({ coordinates }).subscribe({
            next: (response) => {
              console.log(response);
            },
          });
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
      searchLabel: 'Ingresa el destino',
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
    this.destination = (e as any).marker;
    if (this.myLocation) {
      this.showRoutingControl();
    }
  }

  async onMapReady($event: L.Map) {
    this.map = $event;
    this.assignSidebarControl();
    this.map.addControl(this.sidebarControl);
    this.assignLocationControl();
    this.map.addControl(this.locateControl);
    this.map.on('locationfound', this.onLocationFound.bind(this));
    this.map.on('locationerror', this.onLocationError.bind(this));
    this.assignSearchControl();
    this.map.addControl(this.searchControl);
    this.map.on('geosearch/showlocation', this.onGeosearchShowLocation.bind(this));
  }

  onLocationError(_: L.LeafletEvent) {
    if (this.myLocation) {
      this.myLocation.remove();
      this.myLocation = undefined!;
    }
  }

  lineSelected($event: LineNameI) {
    this.lineRoutesSelected = [];
    this.mapService.findLineRoutesByName($event.name!).subscribe({
      next: (response) => {
        response.forEach((lineRoute) => {
          const coordinates = lineRoute.geom.coordinates.map((coordinate: any) => [ coordinate[1], coordinate[0] ]);
          this.lineRoutesSelected.push(L.polyline(coordinates, {
            weight: 5,
          }));
        });
        this.lineRoutesSelected.forEach((lineRoute) => {
          this.map.addLayer(lineRoute);
        });
        this.sidebarControl.close();
      },
    });
  }
}
