export type PlaceResult = {
  id: string;
  name: string;
  fullAddress: string;
  lat: number;
  lng: number;
  category?: string;
  city?: string;
  state?: string;
  country?: string;
};

export type NearbyPlaceResult = PlaceResult & {
  distanceMeters?: number;
};

export type RoutePoint = {
  lat: number;
  lng: number;
};

export type RouteResult = {
  distanceMeters: number;
  durationSeconds: number;
  geometry: RoutePoint[];
};
