import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { environment } from "@environments/environment.prod";
import { FindBestLineRoute, LineNameI, LineRouteI, NearestLinesRoutes, StopPointI } from "@models/interfaces";
import { FindLineRoute, PlaneTravel } from "@models/interfaces/line-route";

@Injectable({
  providedIn: 'root'
})
export class MapService {

  constructor(
    private readonly http: HttpClient,
  ) {
  }

  findAllLinesNames() {
    return this.http.get<LineNameI[]>(`${ environment.apiBaseUrl }/lines-names`);
  }

  findLineRoutesByName(findLineRoute: FindLineRoute) {
    return this.http.post<LineRouteI>(`${ environment.apiBaseUrl }/lines-routes/find-line-route`, findLineRoute);
  }

  findBestLineRoute(findBestLineRoute: FindBestLineRoute) {
    return this.http.post<LineRouteI[]>(`${ environment.apiBaseUrl }/lines-routes/find-best-line-route`, findBestLineRoute);
  }

  findNearestLineRoute(nearestLinesRoutes: NearestLinesRoutes) {
    return this.http.post<LineNameI[]>(`${ environment.apiBaseUrl }/lines-routes/find-nearest-lines-routes`, nearestLinesRoutes);
  }

  findPlaneTravel(planeTravel: PlaneTravel) {
    return this.http.post<LineRouteI[]>(`${ environment.apiBaseUrl }/lines-routes/find-plane-travel`, planeTravel);
  }

  findChannelWithCoordinates(lat: number, lng: number) {
    return this.http.get<any>(`${ environment.apiBaseUrl }/stops-points/find-with-coordinates?lat=${ lat }&lng=${ lng }`);
  }

  findQrPoints() {
    return this.http.get<StopPointI[]>(`${ environment.apiBaseUrl }/stops-points`);
  }
}
