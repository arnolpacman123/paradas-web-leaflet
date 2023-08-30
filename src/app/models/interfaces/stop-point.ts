export interface StopPointI {
  id:   number;
  geom: Geom;
}

export interface Geom {
  type:        string;
  coordinates: [number, number];
}
