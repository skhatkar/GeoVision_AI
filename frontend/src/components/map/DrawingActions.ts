"use client";

import type { Map } from "leaflet";

// ============================================================
// TYPES
// ============================================================

type GeomanMap = Map & {
  pm?: {
    enableDraw: (
      shape: string,
      options?: Record<string, unknown>
    ) => void;

    disableDraw: () => void;

    enableGlobalRemovalMode: () => void;

    disableGlobalRemovalMode: () => void;

    enableGlobalEditMode: () => void;

    disableGlobalEditMode: () => void;
  };
};

// ============================================================
// GET MAP
// ============================================================

function getMap(): GeomanMap | null {
  if (
    typeof window === "undefined"
  ) {
    return null;
  }

  const map =
    window.__geoVisionMap;

  if (!map) {
    console.warn(
      "GeoVision map instance is not available."
    );

    return null;
  }

  return map as GeomanMap;
}

// ============================================================
// GET GEOMAN
// ============================================================

function getGeoman() {
  const map = getMap();

  if (!map?.pm) {
    console.warn(
      "Leaflet-Geoman is not initialized yet."
    );

    return null;
  }

  return map.pm;
}

// ============================================================
// STOP CURRENT TOOL
// ============================================================

export function stopDrawing() {
  const pm = getGeoman();

  if (!pm) {
    return;
  }

  pm.disableDraw();
}

// ============================================================
// DRAW MARKER
// ============================================================

export function drawMarker() {
  const pm = getGeoman();

  if (!pm) {
    return;
  }

  pm.disableDraw();

  pm.enableDraw(
    "Marker",
    {
      continueDrawing: false,
    }
  );
}

// ============================================================
// DRAW POINT
// ============================================================

export function drawPoint() {
  drawMarker();
}

// ============================================================
// DRAW POLYLINE
// ============================================================

export function drawPolyline() {
  const pm = getGeoman();

  if (!pm) {
    return;
  }

  pm.disableDraw();

  pm.enableDraw(
    "Line",
    {
      continueDrawing: false,
    }
  );
}

// ============================================================
// DRAW LINE
// ============================================================

export function drawLine() {
  drawPolyline();
}

// ============================================================
// DRAW POLYGON
// ============================================================

export function drawPolygon() {
  const pm = getGeoman();

  if (!pm) {
    return;
  }

  pm.disableDraw();

  pm.enableDraw(
    "Polygon",
    {
      continueDrawing: false,
    }
  );
}

// ============================================================
// DRAW RECTANGLE
// ============================================================

export function drawRectangle() {
  const pm = getGeoman();

  if (!pm) {
    return;
  }

  pm.disableDraw();

  pm.enableDraw(
    "Rectangle",
    {
      continueDrawing: false,
    }
  );
}

// ============================================================
// DRAW CIRCLE
// ============================================================

export function drawCircle() {
  const pm = getGeoman();

  if (!pm) {
    return;
  }

  pm.disableDraw();

  pm.enableDraw(
    "Circle",
    {
      continueDrawing: false,
    }
  );
}

// ============================================================
// MEASURE DISTANCE
// ============================================================

export function measureDistance() {
  const pm = getGeoman();

  if (!pm) {
    return;
  }

  pm.disableDraw();

  pm.enableDraw(
    "Line",
    {
      continueDrawing: false,
    }
  );
}

// ============================================================
// MEASURE AREA
// ============================================================

export function measureArea() {
  const pm = getGeoman();

  if (!pm) {
    return;
  }

  pm.disableDraw();

  pm.enableDraw(
    "Polygon",
    {
      continueDrawing: false,
    }
  );
}

// ============================================================
// EDIT FEATURES
// ============================================================

export function editFeatures() {
  const pm = getGeoman();

  if (!pm) {
    return;
  }

  pm.disableDraw();

  pm.enableGlobalEditMode();
}

// ============================================================
// DELETE FEATURES
// ============================================================

export function deleteFeatures() {
  const pm = getGeoman();

  if (!pm) {
    return;
  }

  pm.disableDraw();

  pm.enableGlobalRemovalMode();
}

// ============================================================
// DISABLE EDIT MODE
// ============================================================

export function disableEditMode() {
  const pm = getGeoman();

  if (!pm) {
    return;
  }

  pm.disableGlobalEditMode();
}

// ============================================================
// DISABLE DELETE MODE
// ============================================================

export function disableDeleteMode() {
  const pm = getGeoman();

  if (!pm) {
    return;
  }

  pm.disableGlobalRemovalMode();
}