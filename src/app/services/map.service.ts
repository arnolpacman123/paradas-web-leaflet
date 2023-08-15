import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { environment } from "@environments/environment.prod";
import { CompareLinestrings, LineNameI, LineRouteI } from "@models/interfaces";

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

  getLineRoutes(name: string) {
    return this.http.get<any>(`${ environment.apiBaseUrl }/lines-routes/${ name }`);
  }

  compareLinestrings(compareLinestrings: CompareLinestrings) {
    return this.http.post<LineRouteI[]>(`${ environment.apiBaseUrl }/lines-routes/compare-linestrings`, compareLinestrings);
  }

  findLineRoutesByName(name: string) {
    return this.http.get<LineRouteI[]>(`${ environment.apiBaseUrl }/lines-routes/find-by-name/${ name }`);
  }
}
