import { AfterViewInit, Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet.locatecontrol';
import { LeafletControlLayersConfig } from "@asymmetrik/ngx-leaflet";
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';

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
    minZoom: 10,
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

  destination!: L.Marker;
  myLocation!: L.Marker;
  // @ts-ignore
  searchControl!: SearchControl;
  routingControl!: L.Routing.Control;
  locateControl!: L.Control.Locate;
  map!: L.Map;

  ngOnInit(): void {
    // this.getMyLocation();
  }


  ngAfterViewInit(): void {
  }

  getMyLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition((position) => {
        if (this.myLocation) {
          this.myLocation.remove();
        }
        this.myLocation = L.marker([ position.coords.latitude, position.coords.longitude ], {
          icon: L.icon({
            iconSize: [ 32, 32 ],
            iconUrl: 'assets/images/blue-dot.png',
          }),
          draggable: false,
        });
      });
    } else {
      alert('No se puede obtener la ubicación actual del usuario');
    }
  }

  onDblClickPutMarker($event: L.LeafletMouseEvent) {
    if (this.destination) {
      this.destination.setLatLng($event.latlng);
      if (this.myLocation && this.routingControl) {
        this.routingControl.setWaypoints([
          L.latLng(this.myLocation.getLatLng().lat, this.myLocation.getLatLng().lng),
          L.latLng(this.destination.getLatLng().lat, this.destination.getLatLng().lng),
        ]);
      }
      return;
    }
    this.destination = L.marker($event.latlng, {
      icon: L.icon({
        iconSize: [ 21, 33 ],
        iconUrl: 'assets/images/marker-icon.png',
      }),
      draggable: true,
    });

    if (this.myLocation && this.routingControl) {
      this.routingControl.setWaypoints([
        L.latLng(this.myLocation.getLatLng().lat, this.myLocation.getLatLng().lng),
        L.latLng(this.destination.getLatLng().lat, this.destination.getLatLng().lng),
      ]);
    } else {
      this.assignRoutingControl();
      this.map.addControl(this.routingControl);
    }

    this.destination.on('dblclick', () => {
      this.destination.remove();
      this.destination = undefined!;
    });
  }

  assignRoutingControl() {
    if (this.routingControl) {
      this.routingControl.setWaypoints([
        L.latLng(this.myLocation.getLatLng().lat, this.myLocation.getLatLng().lng),
        L.latLng(this.destination.getLatLng().lat, this.destination.getLatLng().lng),
      ]);
      return;
    } else {
      this.routingControl = L.Routing.control({
        router: L.Routing.osrmv1({
          language: 'es',
        }),
        plan: L.Routing.plan([
          L.latLng(this.myLocation.getLatLng().lat, this.myLocation.getLatLng().lng),
          L.latLng(this.destination.getLatLng().lat, this.destination.getLatLng().lng),
        ], {
          createMarker: (waypointIndex, _, __) => {
            if (waypointIndex === 0) {
              return this.myLocation;
            } else {
              return this.destination;
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
      });
    }
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
      iconLoading: 'fa fa-spinner fa-spin',
      iconElementTag: 'a',
      keepCurrentZoomLevel: true,
      flyTo: true,
      cacheLocation: true,
    });
  }

  onLocationFound(e: L.LocationEvent) {
    if (this.myLocation) {
      this.myLocation.remove();
    }
    this.myLocation = L.marker(e.latlng, {
      icon: L.icon({
        iconSize: [ 32, 32 ],
        iconUrl: 'assets/images/blue-dot.png',
      }),
      draggable: false,
    });
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
      style: 'bar',
      notFoundMessage: 'No se encontraron resultados',
      searchLabel: 'Ingresa el destino',
    });
  }

  onGeosearchShowLocation(e: L.LeafletEvent) {
    this.destination = (e as any).marker;
    if (this.myLocation && this.destination) {
      this.assignRoutingControl();
      this.map.addControl(this.routingControl);
    }
  }

  async onMapReady($event: L.Map) {
    this.map = $event;
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
}
