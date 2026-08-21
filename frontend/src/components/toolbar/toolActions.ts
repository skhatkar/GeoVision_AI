import { useMapStore } from "@/store/mapStore";

const HOME_CENTER: [
  number,
  number
] = [
  31.1048,
  77.1734,
];

const HOME_ZOOM = 8;

// ============================================
// ZOOM IN
// ============================================

export function zoomIn() {

  const map =
    useMapStore
      .getState()
      .map;

  if (!map) {
    console.warn(
      "Zoom In: Map instance not available."
    );

    return;
  }

  map.zoomIn();
}

// ============================================
// ZOOM OUT
// ============================================

export function zoomOut() {

  const map =
    useMapStore
      .getState()
      .map;

  if (!map) {
    console.warn(
      "Zoom Out: Map instance not available."
    );

    return;
  }

  map.zoomOut();
}

// ============================================
// HOME
// ============================================

export function goHome() {

  const map =
    useMapStore
      .getState()
      .map;

  if (!map) {
    console.warn(
      "Home: Map instance not available."
    );

    return;
  }

  map.setView(
    HOME_CENTER,
    HOME_ZOOM,
    {
      animate: true,
    }
  );
}