import { useMapStore } from "@/store/mapStore";

function getMap() {
  return useMapStore.getState().map;
}

export function drawMarker() {
  const map = getMap();
  if (!map) return;

  map.pm.enableDraw("Marker");
}

export function drawPolyline() {
  const map = getMap();
  if (!map) return;

  map.pm.enableDraw("Line");
}

export function drawPolygon() {
  const map = getMap();
  if (!map) return;

  map.pm.enableDraw("Polygon");
}

export function drawRectangle() {
  const map = getMap();
  if (!map) return;

  map.pm.enableDraw("Rectangle");
}

export function drawCircle() {
  const map = getMap();
  if (!map) return;

  map.pm.enableDraw("Circle");
}

export function editFeatures() {
  const map = getMap();
  if (!map) return;

  map.pm.toggleGlobalEditMode();
}

export function deleteFeatures() {
  const map = getMap();
  if (!map) return;

  map.pm.toggleGlobalRemovalMode();
}