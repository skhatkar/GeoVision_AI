export interface GISLayer {
  id: string;
  name: string;

  type:
    | "geojson"
    | "wms"
    | "tile"
    | "vector";

  url: string;

  visible: boolean;

  opacity: number;

  color: string;

  weight: number;

  fillColor?: string;

  loading?: boolean;

  featureCount?: number;
}