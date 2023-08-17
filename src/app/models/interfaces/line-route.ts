export interface LineRouteI {
  id: number;
  geom: GeomI;
  name: string;
  ground: string;
  direction: string;
}

export interface GeomI {
  type: string;
  coordinates: Array<[ number, number ]>;
}

export interface FindBestLineRoute {
  coordinates: Array<[ number, number ]>;
}

export interface NearestLinesRoutes {
  coordinate: [ number, number ];
}
