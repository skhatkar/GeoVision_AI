export interface Asset {
  id: number;

  name: string;

  geometry: string;

  attributes: Record<string, any>;

  layer_id: number;

  created_at: string;

  updated_at: string;
}