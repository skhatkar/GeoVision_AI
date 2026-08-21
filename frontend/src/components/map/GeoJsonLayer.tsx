"use client";

import { useEffect, useRef, useState } from "react";
import { GeoJSON } from "react-leaflet";
import L from "leaflet";
import type {
  GeoJSON as LeafletGeoJSON,
  Path,
} from "leaflet";

import type { GISLayer } from "@/types/layer";

import { useSelectionStore } from "@/store/selectionStore";
import { useMapStore } from "@/store/mapStore";
import { useTableStore } from "@/store/tableStore";
import { useToolStore } from "@/store/toolStore";

interface Props {
  layer: GISLayer;
}

export default function GeoJsonLayer({
  layer,
}: Props) {
  // ============================================
  // GEOJSON DATA
  // ============================================

  const [data, setData] = useState<any>(null);

  const geoJsonRef =
    useRef<LeafletGeoJSON | null>(null);

  // Keep track of registered asset IDs
  const registeredAssetIds =
    useRef<number[]>([]);

  // ============================================
  // SELECTION STORE
  // ============================================

  const setSelection =
    useSelectionStore(
      (state) => state.setSelection
    );

  // ============================================
  // TOOL STORE
  // ============================================

  // ============================================
  // MAP STORE
  // ============================================

  const registerLayer =
    useMapStore(
      (state) => state.registerLayer
    );

  const unregisterLayer =
    useMapStore(
      (state) => state.unregisterLayer
    );

  const registerAssetLayer =
    useMapStore(
      (state) => state.registerAssetLayer
    );

  const unregisterAssetLayer =
    useMapStore(
      (state) => state.unregisterAssetLayer
    );

  // ============================================
  // TABLE STORE
  // ============================================

  const setSelectedAsset =
    useTableStore(
      (state) => state.setSelectedAsset
    );

  const setSelectedAssetData =
    useTableStore(
      (state) => state.setSelectedAssetData
    );

  // ============================================
  // LOAD GEOJSON
  // ============================================

  useEffect(() => {
    let cancelled = false;

    async function loadLayer() {
      if (!layer.url) {
        console.error(
          `No GeoJSON URL provided for layer: ${layer.name}`
        );

        return;
      }

      console.log(
        "Fetching GeoJSON URL:",
        layer.url
      );

      try {
        const res = await fetch(
          layer.url,
          {
            cache: "no-store",
          }
        );

        console.log(
          "GeoJSON Response:",
          layer.name,
          res.status
        );

        if (!res.ok) {
          const text =
            await res.text();

          console.error(
            "Backend GeoJSON Error:",
            text
          );

          throw new Error(
            `HTTP ${res.status}`
          );
        }

        const json =
          await res.json();

        if (cancelled) {
          return;
        }

        console.log(
          "GeoJSON Loaded:",
          layer.name,
          json
        );

        setData(json);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          `Failed to load GeoJSON layer "${layer.name}":`,
          error
        );

        setData(null);
      }
    }

    loadLayer();

    return () => {
      cancelled = true;
    };
  }, [
    layer.url,
    layer.name,
  ]);

  // ============================================
  // REGISTER COMPLETE GEOJSON LAYER
  // ============================================

  useEffect(() => {
    if (!geoJsonRef.current) {
      return;
    }

    registerLayer(
      layer.id,
      geoJsonRef.current
    );

    return () => {
      unregisterLayer(
        layer.id
      );
    };
  }, [
    layer.id,
    data,
    registerLayer,
    unregisterLayer,
  ]);

  // ============================================
  // CLEANUP INDIVIDUAL ASSET LAYERS
  // ============================================

  useEffect(() => {
    return () => {
      registeredAssetIds.current.forEach(
        (assetId) => {
          unregisterAssetLayer(
            assetId
          );
        }
      );

      registeredAssetIds.current = [];
    };
  }, [
    layer.id,
    unregisterAssetLayer,
  ]);

  // ============================================
  // DEFAULT STYLE
  // ============================================

  const getDefaultStyle = () => ({
    color:
      layer.color ?? "#2563EB",

    weight:
      layer.weight ?? 2,

    opacity:
      layer.opacity ?? 1,

    fillColor:
      layer.fillColor ??
      layer.color ??
      "#2563EB",

    fillOpacity: 0.15,
  });

  // ============================================
  // SELECTED STYLE
  // ============================================

  const getSelectedStyle = () => ({
    color: "#FFD700",

    weight:
      Math.max(
        (layer.weight ?? 2) + 3,
        5
      ),

    opacity: 1,

    fillColor:
      layer.fillColor ??
      layer.color ??
      "#2563EB",

    fillOpacity: 0.45,
  });

  // ============================================
  // POINT STYLE
  // ============================================

  const pointToLayer = (
    feature: any,
    latlng: L.LatLng
  ) => {
    return L.circleMarker(
      latlng,
      {
        radius: 7,

        fillColor:
          layer.color ??
          "#2563EB",

        color: "#ffffff",

        weight: 2,

        opacity: 1,

        fillOpacity: 0.9,
      }
    );
  };

  // ============================================
  // GET ASSET ID
  // ============================================

  function getAssetId(
    feature: any
  ): number | null {
    const properties =
      feature?.properties;

    if (!properties) {
      return null;
    }

    const rawId =
      properties.id ??
      properties.ID ??
      properties.Id ??
      properties.objectid ??
      properties.OBJECTID ??
      properties.ObjectID ??
      properties.fid ??
      properties.FID;

    if (
      rawId === null ||
      rawId === undefined ||
      rawId === ""
    ) {
      return null;
    }

    const numericId =
      Number(rawId);

    if (
      Number.isFinite(
        numericId
      )
    ) {
      return numericId;
    }

    return null;
  }

  // ============================================
  // CREATE POPUP HTML
  // ============================================

  function createPopup(
    properties: any
  ) {
    if (!properties) {
      return (
        "<div>No attributes available</div>"
      );
    }

    let html = `
      <div class="min-w-[220px]">
        <div class="mb-2 border-b pb-2 font-semibold">
          ${layer.name}
        </div>
    `;

    Object.entries(
      properties
    ).forEach(
      ([key, value]) => {
        html += `
          <div class="flex gap-2 py-1 text-xs">
            <span class="font-semibold">
              ${key}
            </span>

            <span>
              ${String(value ?? "")}
            </span>
          </div>
        `;
      }
    );

    html += "</div>";

    return html;
  }

  // ============================================
  // FEATURE EVENTS
  // ============================================

  function handleFeature(
    feature: any,
    leafletLayer: any
  ) {
    // ==========================================
    // ASSET ID
    // ==========================================

    const assetId =
      getAssetId(feature);

    // ==========================================
    // REGISTER INDIVIDUAL FEATURE
    // ==========================================

    if (
      assetId !== null
    ) {
      registerAssetLayer(
        assetId,
        leafletLayer
      );

      if (
        !registeredAssetIds.current.includes(
          assetId
        )
      ) {
        registeredAssetIds.current.push(
          assetId
        );
      }
    }

    // ==========================================
    // POPUP
    // ==========================================

    if (
      feature?.properties
    ) {
      leafletLayer.bindPopup(
        createPopup(
          feature.properties
        )
      );
    }

    // ==========================================
    // EVENTS
    // ==========================================

    leafletLayer.on({

      // ========================================
      // CLICK
      // ========================================

      click: () => {

        // --------------------------------------
        // Only Select / Identify can select
        // --------------------------------------

        const currentTool = useToolStore.getState().activeTool;

        if (
          currentTool !== "pan" &&
          currentTool !== "select" &&
          currentTool !== "identify"
        ) {
          return;
        }

        // --------------------------------------
        // Previous selected feature
        // --------------------------------------

        const previous =
          useSelectionStore
            .getState()
            .selectedLeafletLayer;

        // --------------------------------------
        // Reset previous selection
        // --------------------------------------

        if (
          previous &&
          previous !== leafletLayer &&
          "setStyle" in previous &&
          typeof previous.setStyle ===
            "function"
        ) {
          (
            previous as Path
          ).setStyle(
            getDefaultStyle()
          );
        }

        // --------------------------------------
        // Map selection
        // --------------------------------------

        setSelection(
          layer.name,
          feature,
          leafletLayer
        );

        // --------------------------------------
        // Table selection
        // --------------------------------------

        if (
          assetId !== null
        ) {
          setSelectedAsset(
            assetId
          );

          setSelectedAssetData({
            id: assetId,

            attributes:
              feature.properties,

            geometry:
              feature.geometry,
          } as any);
        }

        // --------------------------------------
        // Highlight selected feature
        // --------------------------------------

        if (
          "setStyle" in leafletLayer &&
          typeof leafletLayer.setStyle ===
            "function"
        ) {
          (
            leafletLayer as Path
          ).setStyle(
            getSelectedStyle()
          );
        }

        // --------------------------------------
        // Bring feature to front
        // --------------------------------------

        if (
          "bringToFront" in leafletLayer &&
          typeof leafletLayer.bringToFront ===
            "function"
        ) {
          leafletLayer.bringToFront();
        }
      },

      // ========================================
      // MOUSE OVER
      // ========================================

      mouseover: () => {

        const selected =
          useSelectionStore
            .getState()
            .selectedLeafletLayer;

        if (
          selected ===
          leafletLayer
        ) {
          return;
        }

        if (
          "setStyle" in leafletLayer &&
          typeof leafletLayer.setStyle ===
            "function"
        ) {
          (
            leafletLayer as Path
          ).setStyle({
            weight:
              (layer.weight ?? 2) + 1,
          });
        }
      },

      // ========================================
      // MOUSE OUT
      // ========================================

      mouseout: () => {

        const selected =
          useSelectionStore
            .getState()
            .selectedLeafletLayer;

        if (
          selected ===
          leafletLayer
        ) {
          return;
        }

        if (
          "setStyle" in leafletLayer &&
          typeof leafletLayer.setStyle ===
            "function"
        ) {
          (
            leafletLayer as Path
          ).setStyle(
            getDefaultStyle()
          );
        }
      },
    });
  }

  // ============================================
  // NO DATA
  // ============================================

  if (!data) {
    return null;
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <GeoJSON
      ref={geoJsonRef}

      data={data}

      pointToLayer={
        pointToLayer
      }

      style={() =>
        getDefaultStyle()
      }

      onEachFeature={
        handleFeature
      }
    />
  );
}
