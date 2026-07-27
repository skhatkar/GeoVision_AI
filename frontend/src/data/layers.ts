export interface LayerData {
  id: string;
  name: string;
  type: "vector" | "raster" | "basemap";
  visible: boolean;
  opacity: number;
}

export const defaultLayers: LayerData[] = [
  {
    id: "district",
    name: "District Boundary",
    type: "vector",
    visible: true,
    opacity: 1,
  },
  {
    id: "block",
    name: "Block Boundary",
    type: "vector",
    visible: true,
    opacity: 1,
  },
  {
    id: "panchayat",
    name: "Panchayat",
    type: "vector",
    visible: true,
    opacity: 1,
  },
  {
    id: "village",
    name: "Village",
    type: "vector",
    visible: true,
    opacity: 1,
  },
  {
    id: "roads",
    name: "Road Network",
    type: "vector",
    visible: true,
    opacity: 1,
  },
  {
    id: "health",
    name: "Health Facilities",
    type: "vector",
    visible: false,
    opacity: 1,
  },
];