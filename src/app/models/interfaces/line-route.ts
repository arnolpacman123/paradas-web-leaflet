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

export interface CompareLinestrings {
  coordinates: Array<[ number, number ]>;
}
