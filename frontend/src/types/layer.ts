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
  fillOpacity?: number;

  weight: number;

  icon?: string;
  customIcon?: string;
  pointSize?: number;

  loading?: boolean;

  // GIS Information
  geometryType?: string;
  featureCount?: number;
  crs?: string;

  // Backend Metadata
  datasetId?: number;
  departmentId?: number;
  projectId?: number | string;
  projectName?: string;

  filePath?: string;

  createdAt?: string;
  updatedAt?: string;
}