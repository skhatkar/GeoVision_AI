"use client";

import {
  useCallback,
  useEffect,
  useRef,
} from "react";

import { useMap } from "react-leaflet";
import L from "leaflet";

import { useToolStore } from "@/store/toolStore";
import { useSelectionStore } from "@/store/selectionStore";

// ============================================================
// TYPES
// ============================================================

interface MeasurementState {
  layer:
    | L.Polyline
    | L.Polygon
    | null;

  points: L.LatLng[];

  markers: L.CircleMarker[];
}

type GeomanPM = {
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

type GeomanMap = L.Map & {
  pm?: GeomanPM;
};

// ============================================================
// COMPONENT
// ============================================================

export default function MapToolController() {
  const map = useMap();

  // ==========================================================
  // TOOL STORE
  // ==========================================================

  const activeTool =
    useToolStore(
      (state) => state.activeTool
    );

  const clearTool =
    useToolStore(
      (state) => state.clearTool
    );

  // ==========================================================
  // SELECTION STORE
  // ==========================================================

  const setSelection =
    useSelectionStore(
      (state) => state.setSelection
    );

  // ==========================================================
  // REFS
  // ==========================================================

  const measurementRef =
    useRef<MeasurementState>({
      layer: null,
      points: [],
      markers: [],
    });

  const temporaryLayersRef =
    useRef<L.Layer[]>([]);

  // ==========================================================
  // GEOMAN
  // ==========================================================

  const getGeoman =
    useCallback(() => {
      const geomanMap =
        map as GeomanMap;

      return geomanMap.pm ?? null;
    }, [map]);

  // ==========================================================
  // CLEAR MEASUREMENT
  // ==========================================================

  const clearMeasurement =
    useCallback(() => {
      const measurement =
        measurementRef.current;

      if (measurement.layer) {
        if (
          map.hasLayer(
            measurement.layer
          )
        ) {
          map.removeLayer(
            measurement.layer
          );
        }
      }

      measurement.markers.forEach(
        (marker) => {
          if (
            map.hasLayer(marker)
          ) {
            map.removeLayer(marker);
          }
        }
      );

      measurementRef.current = {
        layer: null,
        points: [],
        markers: [],
      };
    }, [map]);

  // ==========================================================
  // CLEAR TEMPORARY LAYERS
  // ==========================================================

  const clearTemporaryLayers =
    useCallback(() => {
      temporaryLayersRef.current.forEach(
        (layer) => {
          if (
            map.hasLayer(layer)
          ) {
            map.removeLayer(layer);
          }
        }
      );

      temporaryLayersRef.current = [];
    }, [map]);

  // ==========================================================
  // DISABLE GEOMAN
  // ==========================================================

  const disableDrawing =
    useCallback(() => {
      const pm =
        getGeoman();

      if (!pm) {
        return;
      }

      try {
        pm.disableDraw();
      } catch (error) {
        console.warn(
          "GeoVision: Unable to disable Geoman drawing.",
          error
        );
      }
    }, [getGeoman]);

  // ==========================================================
  // ENABLE GEOMAN
  // ==========================================================

  const enableDrawing =
    useCallback(
      (
        tool:
          | "draw-point"
          | "draw-line"
          | "draw-polygon"
      ) => {
        const pm =
          getGeoman();

        if (!pm) {
          console.warn(
            "GeoVision: Geoman is not ready yet."
          );

          return;
        }

        try {
          pm.disableDraw();

          switch (tool) {
            case "draw-point":
              pm.enableDraw(
                "Marker",
                {
                  continueDrawing: false,
                }
              );
              break;

            case "draw-line":
              pm.enableDraw(
                "Line",
                {
                  continueDrawing: false,
                }
              );
              break;

            case "draw-polygon":
              pm.enableDraw(
                "Polygon",
                {
                  continueDrawing: false,
                }
              );
              break;
          }
        } catch (error) {
          console.error(
            "GeoVision: Geoman drawing error:",
            error
          );
        }
      },
      [getGeoman]
    );

  // ==========================================================
  // FINISH MEASUREMENT
  // ==========================================================

  const finishMeasurement =
    useCallback(() => {
      const measurement =
        measurementRef.current;

      if (
        measurement.points.length <
        2
      ) {
        clearMeasurement();
        return;
      }

      if (measurement.layer) {
        measurement.layer.setStyle({
          color: "#2563EB",
          weight: 3,
          opacity: 0.9,
        });
      }

      console.log(
        "GeoVision: Measurement finished.",
        measurement.points
      );
    }, [clearMeasurement]);

  // ==========================================================
  // DISTANCE
  // ==========================================================

  const handleDistanceClick =
    useCallback(
      (
        event: L.LeafletMouseEvent
      ) => {
        const point =
          event.latlng;

        const measurement =
          measurementRef.current;

        measurement.points.push(
          point
        );

        const marker =
          L.circleMarker(
            point,
            {
              radius: 5,
              color: "#2563EB",
              fillColor: "#ffffff",
              fillOpacity: 1,
              weight: 2,
            }
          ).addTo(map);

        measurement.markers.push(
          marker
        );

        if (
          measurement.points.length ===
          1
        ) {
          measurement.layer =
            L.polyline(
              [point],
              {
                color: "#2563EB",
                weight: 3,
                dashArray: "6 6",
              }
            ).addTo(map);

          return;
        }

        measurement.layer?.setLatLngs(
          measurement.points
        );

        let distance = 0;

        for (
          let i = 1;
          i <
          measurement.points.length;
          i++
        ) {
          distance +=
            measurement.points[
              i - 1
            ].distanceTo(
              measurement.points[i]
            );
        }

        console.log(
          "GeoVision Distance:",
          formatDistance(distance)
        );
      },
      [map]
    );

  // ==========================================================
  // AREA
  // ==========================================================

  const handleAreaClick =
    useCallback(
      (
        event: L.LeafletMouseEvent
      ) => {
        const point =
          event.latlng;

        const measurement =
          measurementRef.current;

        measurement.points.push(
          point
        );

        const marker =
          L.circleMarker(
            point,
            {
              radius: 5,
              color: "#16A34A",
              fillColor: "#ffffff",
              fillOpacity: 1,
              weight: 2,
            }
          ).addTo(map);

        measurement.markers.push(
          marker
        );

        if (
          measurement.points.length ===
          1
        ) {
          measurement.layer =
            L.polygon(
              [point],
              {
                color: "#16A34A",
                weight: 3,
                fillColor: "#16A34A",
                fillOpacity: 0.15,
                dashArray: "6 6",
              }
            ).addTo(map);

          return;
        }

        measurement.layer?.setLatLngs(
          measurement.points
        );

        if (
          measurement.points.length >=
          3
        ) {
          const area =
            calculatePolygonArea(
              measurement.points
            );

          console.log(
            "GeoVision Area:",
            formatArea(area)
          );
        }
      },
      [map]
    );

  // ==========================================================
  // IDENTIFY
  // ==========================================================

  const handleIdentify =
    useCallback(
      (
        event: L.LeafletMouseEvent
      ) => {
        const lat =
          event.latlng.lat;

        const lng =
          event.latlng.lng;

        const identifyFeature = {
          type: "Feature",
          properties: {
            latitude: lat,
            longitude: lng,
          },
          geometry: {
            type: "Point",
            coordinates: [
              lng,
              lat,
            ],
          },
        };

        console.log(
          "GeoVision Identify:",
          identifyFeature
        );

        setSelection(
          "Map",
          identifyFeature,
          L.marker(event.latlng)
        );
      },
      [setSelection]
    );

  // ==========================================================
  // TOOL CHANGE
  // ==========================================================

  useEffect(() => {
    clearMeasurement();
    disableDrawing();

    if (
      activeTool === "draw-point" ||
      activeTool === "draw-line" ||
      activeTool === "draw-polygon"
    ) {
      enableDrawing(
        activeTool
      );

      map.getContainer().style.cursor =
        "crosshair";

      return;
    }

    if (
      activeTool ===
        "measure-distance" ||
      activeTool ===
        "measure-area" ||
      activeTool ===
        "identify"
    ) {
      map.getContainer().style.cursor =
        "crosshair";

      return;
    }

    map.getContainer().style.cursor =
      "";

    if (
      activeTool === "none"
    ) {
      clearTemporaryLayers();
    }
  }, [
    activeTool,
    map,
    clearMeasurement,
    disableDrawing,
    enableDrawing,
    clearTemporaryLayers,
  ]);

  // ==========================================================
  // MAP CLICK
  // ==========================================================

  useEffect(() => {
    const handleMapClick =
      (
        event: L.LeafletMouseEvent
      ) => {
        if (
          activeTool ===
          "measure-distance"
        ) {
          handleDistanceClick(
            event
          );

          return;
        }

        if (
          activeTool ===
          "measure-area"
        ) {
          handleAreaClick(
            event
          );

          return;
        }

        if (
          activeTool ===
          "identify"
        ) {
          handleIdentify(
            event
          );
        }
      };

    map.on(
      "click",
      handleMapClick
    );

    return () => {
      map.off(
        "click",
        handleMapClick
      );
    };
  }, [
    map,
    activeTool,
    handleDistanceClick,
    handleAreaClick,
    handleIdentify,
  ]);

  // ==========================================================
  // DOUBLE CLICK
  // ==========================================================

  useEffect(() => {
    const handleDoubleClick =
      () => {
        if (
          activeTool ===
            "measure-distance" ||
          activeTool ===
            "measure-area"
        ) {
          finishMeasurement();
        }
      };

    map.on(
      "dblclick",
      handleDoubleClick
    );

    return () => {
      map.off(
        "dblclick",
        handleDoubleClick
      );
    };
  }, [
    map,
    activeTool,
    finishMeasurement,
  ]);

  // ==========================================================
  // ESCAPE
  // ==========================================================

  useEffect(() => {
    const handleKeyDown =
      (
        event: KeyboardEvent
      ) => {
        if (
          event.key !== "Escape"
        ) {
          return;
        }

        clearMeasurement();
        disableDrawing();
        clearTemporaryLayers();

        map.getContainer().style.cursor =
          "";

        clearTool();
      };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    clearTool,
    clearMeasurement,
    disableDrawing,
    clearTemporaryLayers,
    map,
  ]);

  // ==========================================================
  // CLEANUP
  // ==========================================================

  useEffect(() => {
    return () => {
      clearMeasurement();
      disableDrawing();
      clearTemporaryLayers();

      if (
        map.getContainer()
      ) {
        map.getContainer().style.cursor =
          "";
      }
    };
  }, [
    map,
    clearMeasurement,
    disableDrawing,
    clearTemporaryLayers,
  ]);

  return null;
}

// ============================================================
// DISTANCE FORMATTER
// ============================================================

function formatDistance(
  meters: number
): string {
  if (meters < 1000) {
    return `${meters.toFixed(2)} m`;
  }

  return `${(
    meters / 1000
  ).toFixed(2)} km`;
}

// ============================================================
// AREA CALCULATION
// ============================================================

function calculatePolygonArea(
  points: L.LatLng[]
): number {
  if (points.length < 3) {
    return 0;
  }

  const earthRadius =
    6378137;

  let area = 0;

  for (
    let i = 0;
    i < points.length;
    i++
  ) {
    const j =
      (i + 1) %
      points.length;

    const lat1 =
      points[i].lat *
      Math.PI /
      180;

    const lat2 =
      points[j].lat *
      Math.PI /
      180;

    const lon1 =
      points[i].lng *
      Math.PI /
      180;

    const lon2 =
      points[j].lng *
      Math.PI /
      180;

    area +=
      (lon2 - lon1) *
      (
        2 +
        Math.sin(lat1) +
        Math.sin(lat2)
      );
  }

  return (
    Math.abs(area) *
    earthRadius *
    earthRadius /
    2
  );
}

// ============================================================
// AREA FORMATTER
// ============================================================

function formatArea(
  squareMeters: number
): string {
  if (
    squareMeters < 10000
  ) {
    return `${squareMeters.toFixed(
      2
    )} m²`;
  }

  return `${(
    squareMeters / 10000
  ).toFixed(2)} ha`;
}