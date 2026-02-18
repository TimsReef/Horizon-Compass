
export interface OrientationData {
  heading: number;
  pitch: number;
  roll: number;
}

export interface LocationData {
  latitude: number | null;
  longitude: number | null;
  altitude: number | null;
  speed: number | null;
  accuracy: number | null;
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark'
}

export interface InsightData {
  headingName: string;
  description: string;
  landmarks?: string[];
}
