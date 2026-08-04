import { api } from "./client";

export function getAssets(layerId: number) {
  return api(`/layers/${layerId}/assets`);
}