export interface GISLayer {
  // Core
  id: string;
  name: string;

  type:
    | "geojson"
    | "wms"
    | "tile"
    | "vector";

  url: string;

  // Display
  visible: boolean;
  opacity: number;

  color: string;
  fillColor?: string;

  weight: number;

  loading?: boolean;

  // GIS Information
  geometryType?: string;
  featureCount?: number;
  crs?: string;

  // Backend Metadata
  datasetId?: number;
  departmentId?: number;

  filePath?: string;

  createdAt?: string;
  updatedAt?: string;
}