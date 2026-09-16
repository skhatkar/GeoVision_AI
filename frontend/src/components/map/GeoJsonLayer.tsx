"use client";

import { useEffect, useRef, useState, useMemo } from "react";
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
import { useLayerStore } from "@/store/layerStore";
import { useSpatialFilterStore } from "@/store/spatialFilterStore";

const DISTRICT_KEYS = [
  "district_lgd_name",
  "district_name",
  "district_1",
  "district",
  "dist_name",
  "dist",
];

const BLOCK_KEYS = [
  "block_lgd_name",
  "block_name",
  "block_lgd1",
  "block",
  "blk_name",
  "tehsil",
  "sub_district",
  "sub-division",
];

const PANCHAYAT_KEYS = [
  "panchayat_lgd_name",
  "panchayat_name",
  "panchayat1",
  "panchayat",
  "gp_name",
  "gram_panchayat",
  "village_lgd_name",
  "village__1",
  "village",
];

function getPropValue(props: Record<string, any>, candidateKeys: string[]): string | null {
  if (!props) return null;
  const propKeys = Object.keys(props);
  for (const candidate of candidateKeys) {
    const found = propKeys.find((k) => k.toLowerCase() === candidate.toLowerCase());
    if (found && props[found] !== undefined && props[found] !== null && String(props[found]).trim() !== "") {
      return String(props[found]).trim();
    }
  }
  return null;
}

function matchesAdminFilter(
  props: Record<string, any>,
  selectedDistrict: string,
  selectedBlock: string,
  selectedPanchayat: string
): boolean {
  if (!props) return true;

  const featureDistrict = getPropValue(props, DISTRICT_KEYS);
  const featureBlock = getPropValue(props, BLOCK_KEYS);
  const featurePanchayat = getPropValue(props, PANCHAYAT_KEYS);

  // If the feature doesn't have ANY administrative attributes, keep it visible
  if (!featureDistrict && !featureBlock && !featurePanchayat) {
    return true;
  }

  // 1. District Check
  if (selectedDistrict && featureDistrict) {
    const sd = selectedDistrict.toLowerCase().trim();
    const fd = featureDistrict.toLowerCase().trim();
    if (sd !== fd && !fd.includes(sd) && !sd.includes(fd)) {
      return false;
    }
  }

  // 2. Block Check
  if (selectedBlock && featureBlock) {
    const sb = selectedBlock.toLowerCase().trim();
    const fb = featureBlock.toLowerCase().trim();
    if (sb !== fb && !fb.includes(sb) && !sb.includes(fb)) {
      return false;
    }
  }

  // 3. Panchayat Check
  if (selectedPanchayat && featurePanchayat) {
    const sp = selectedPanchayat.toLowerCase().trim();
    const fp = featurePanchayat.toLowerCase().trim();
    if (sp !== fp && !fp.includes(sp) && !sp.includes(fp)) {
      return false;
    }
  }

  return true;
}

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

      try {
        const res = await fetch(
          layer.url,
          {
            cache: "no-store",
          }
        );

        if (!res.ok) {
          const text = await res.text();
          console.error(
            "Backend GeoJSON Error:",
            text
          );
          throw new Error(
            `HTTP ${res.status}`
          );
        }

        const json = await res.json();

        if (cancelled) {
          return;
        }

        setData(json);
        useLayerStore.getState().setLayerGeoJsonData(layer.id, json);
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

    fillOpacity: layer.fillOpacity ?? (layer.opacity != null ? layer.opacity * 0.25 : 0.25),
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

    fillOpacity: 0.55,
  });

  // ============================================
  // POINT STYLE & ICONS
  // ============================================

  const ICON_SVGS: Record<string, string> = {
    hospital: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6v12"/><path d="M6 12h12"/></svg>`,
    shield: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>`,
    tree: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m8 14 4-8 4 8"/><path d="m4 19 8-6 8 6"/><path d="M12 19v3"/></svg>`,
    school: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`,
    pin: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3" fill="#fff"/></svg>`,
    building: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M8 10h.01"/><path d="M16 10h.01"/><path d="M8 14h.01"/><path d="M16 14h.01"/></svg>`,
    star: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    alert: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    water: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`,
    fire: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`,
  };

  const pointToLayer = (
    feature: any,
    latlng: L.LatLng
  ) => {
    // 1. Check for uploaded custom image icon (Data URL or image path)
    const customImg = layer.customIcon || (layer.icon && (layer.icon.startsWith("data:") || layer.icon.startsWith("http") || layer.icon.startsWith("/")));
    if (customImg) {
      const imgSrc = typeof customImg === "string" ? customImg : layer.icon;
      const size = layer.pointSize ?? 30;
      const html = `
        <div style="
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #ffffff;
          border: 2.5px solid ${layer.color ?? '#2563EB'};
          box-shadow: 0 3px 8px rgba(0,0,0,0.4);
          overflow: hidden;
          opacity: ${layer.opacity ?? 1};
          padding: 2px;
          transition: transform 0.15s ease;
        ">
          <img src="${imgSrc}" alt="Icon" style="width: 100%; height: 100%; object-fit: contain; border-radius: 50%; display: block;" />
        </div>
      `;
      return L.marker(latlng, {
        icon: L.divIcon({
          html,
          className: "geovision-uploaded-icon-marker",
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
          popupAnchor: [0, -size / 2],
        }),
      });
    }

    // 2. Check for preset SVG icon
    const iconKey = (layer.icon || "").toLowerCase();
    const svg = ICON_SVGS[iconKey];

    if (svg && iconKey !== "circle") {
      const size = layer.pointSize ?? 28;
      const html = `
        <div style="
          background-color: ${layer.color ?? '#2563EB'};
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #ffffff;
          box-shadow: 0 3px 8px rgba(0,0,0,0.35);
          color: #ffffff;
          opacity: ${layer.opacity ?? 1};
          transition: transform 0.15s ease;
        ">
          ${svg}
        </div>
      `;
      return L.marker(latlng, {
        icon: L.divIcon({
          html,
          className: "geovision-custom-icon",
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
          popupAnchor: [0, -size / 2],
        }),
      });
    }

    return L.circleMarker(
      latlng,
      {
        radius: layer.pointSize ? Math.round(layer.pointSize / 3) : 7,

        fillColor:
          layer.fillColor ??
          layer.color ??
          "#2563EB",

        color: "#ffffff",

        weight: layer.weight ?? 2,

        opacity: 1,

        fillOpacity: layer.fillOpacity ?? layer.opacity ?? 0.9,
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
    const assetId =
      getAssetId(feature);

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

    if (
      feature?.properties
    ) {
      leafletLayer.bindPopup(
        createPopup(
          feature.properties
        )
      );
    }

    leafletLayer.on({
      click: () => {
        const currentTool = useToolStore.getState().activeTool;

        if (
          currentTool !== "pan" &&
          currentTool !== "select" &&
          currentTool !== "identify"
        ) {
          return;
        }

        const previous =
          useSelectionStore
            .getState()
            .selectedLeafletLayer;

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

        setSelection(
          layer.name,
          feature,
          leafletLayer
        );

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

        if (
          "bringToFront" in leafletLayer &&
          typeof leafletLayer.bringToFront ===
            "function"
        ) {
          leafletLayer.bringToFront();
        }
      },

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
  // SPATIAL HIERARCHY FILTER (DISTRICT > BLOCK > PANCHAYAT)
  // ============================================

  const selectedDistrict = useSpatialFilterStore((s) => s.selectedDistrict);
  const selectedBlock = useSpatialFilterStore((s) => s.selectedBlock);
  const selectedPanchayat = useSpatialFilterStore((s) => s.selectedPanchayat);

  const filteredData = useMemo(() => {
    if (!data || !data.features) {
      return data;
    }
    if (!selectedDistrict && !selectedBlock && !selectedPanchayat) {
      return data;
    }

    const matchingFeatures = data.features.filter((f: any) =>
      matchesAdminFilter(
        f?.properties ?? {},
        selectedDistrict,
        selectedBlock,
        selectedPanchayat
      )
    );

    return {
      ...data,
      features: matchingFeatures,
    };
  }, [data, selectedDistrict, selectedBlock, selectedPanchayat]);

  // ============================================
  // NO DATA
  // ============================================

  if (!filteredData || !filteredData.features || filteredData.features.length === 0) {
    return null;
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <GeoJSON
      key={`${layer.id}-${layer.color}-${layer.fillColor}-${layer.icon}-${layer.customIcon}-${layer.weight}-${layer.opacity}-${layer.pointSize}-${selectedDistrict}-${selectedBlock}-${selectedPanchayat}`}
      ref={geoJsonRef}
      data={filteredData}
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
