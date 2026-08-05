import { apiFetch } from "./api";

import type { Asset } from "@/types/asset";

export function getLayerAssets(
  layerId: number
): Promise<Asset[]> {
  return apiFetch<Asset[]>(
    `/assets/layer/${layerId}`
  );
}