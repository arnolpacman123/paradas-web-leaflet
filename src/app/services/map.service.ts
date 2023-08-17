import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "@environments/environment.prod";
import {FindBestLineRoute, LineNameI, LineRouteI, NearestLinesRoutes} from "@models/interfaces";

@Injectable({
  providedIn: 'root'
})
export class MapService {

  constructor(
    private readonly http: HttpClient,
  ) {
  }

  findAllLinesNames() {
    return this.http.get<LineNameI[]>(`${environment.apiBaseUrl}/lines-names`);
  }

  findLineRoutesByName(name: string) {
    return this.http.get<LineRouteI[]>(`${environment.apiBaseUrl}/lines-routes/find-by-name/${name}`);
  }

  findBestLineRoute(findBestLineRoute: FindBestLineRoute) {
    return this.http.post<LineRouteI[]>(`${environment.apiBaseUrl}/lines-routes/find-best-line-route`, findBestLineRoute);
  }

  findNearestLineRoute(nearestLinesRoutes: NearestLinesRoutes) {
    return this.http.post<LineNameI[]>(`${environment.apiBaseUrl}/lines-routes/find-nearest-lines-routes`, nearestLinesRoutes);
  }
}
