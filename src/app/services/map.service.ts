import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { environment } from "@environments/environment.prod";
import { LineNameI } from "@models/interfaces";

@Injectable({
  providedIn: 'root'
})
export class MapService {

  constructor(
    private readonly http: HttpClient,
  ) {
  }

  getLineRoutes(name: string) {
    return this.http.get<any>(`${ environment.apiBaseUrl }/lines-routes/${ name }`);
  }

  compareLinestrings(linestring: string) {
    return this.http.post<any>(`${ environment.apiBaseUrl }/lines-routes/compare-linestrings`, { string: linestring });
  }

  getLinesNames() {
    return this.http.get<LineNameI[]>(`${ environment.apiBaseUrl }/lines-names`);
  }
}
