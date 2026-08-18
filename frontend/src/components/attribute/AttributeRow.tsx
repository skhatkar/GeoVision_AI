"use client";

import { useMapStore } from "@/store/mapStore";
import { useTableStore } from "@/store/tableStore";

interface Props {
  asset: any;
  columns: string[];
}

export default function AttributeRow({
  asset,
  columns,
}: Props) {
  // ============================================
  // TABLE STORE
  // ============================================

  const selectedAssetId =
    useTableStore(
      (s) => s.selectedAssetId
    );

  const setSelectedAsset =
    useTableStore(
      (s) => s.setSelectedAsset
    );

  const setSelectedAssetData =
    useTableStore(
      (s) => s.setSelectedAssetData
    );

  // ============================================
  // MAP STORE
  // ============================================

  const zoomToAsset =
    useMapStore(
      (s) => s.zoomToAsset
    );

  const getAssetLayer =
    useMapStore(
      (s) => s.getAssetLayer
    );

  // ============================================
  // GET ASSET ID
  // ============================================

  const assetId = Number(
    asset?.id ??
      asset?.attributes?.id ??
      asset?.attributes?.ID ??
      asset?.attributes?.objectid ??
      asset?.attributes?.OBJECTID
  );

  const isSelected =
    selectedAssetId === assetId;

  // ============================================
  // HANDLE ROW CLICK
  // ============================================

  function handleRowClick() {
    if (
      !Number.isFinite(assetId)
    ) {
      console.warn(
        "Invalid asset ID:",
        asset
      );

      return;
    }

    // ------------------------------------------
    // Update table selection
    // ------------------------------------------

    setSelectedAsset(
      assetId
    );

    setSelectedAssetData(
      asset
    );

    // ------------------------------------------
    // Find corresponding Leaflet feature
    // ------------------------------------------

    const leafletLayer =
      getAssetLayer(
        assetId
      );

    if (!leafletLayer) {
      console.warn(
        `Leaflet layer not registered for asset ${assetId}`
      );

      // Still keep table selection
      return;
    }

    // ------------------------------------------
    // Zoom to feature
    // ------------------------------------------

    zoomToAsset(
      assetId
    );

    // ------------------------------------------
    // Highlight feature
    // ------------------------------------------

    if (
      "setStyle" in leafletLayer &&
      typeof leafletLayer.setStyle ===
        "function"
    ) {
      leafletLayer.setStyle({
        color: "#FFD700",
        weight: 5,
        opacity: 1,
        fillColor: "#FFD700",
        fillOpacity: 0.45,
      });
    }

    // ------------------------------------------
    // Bring feature to front
    // ------------------------------------------

    if (
      "bringToFront" in leafletLayer &&
      typeof leafletLayer.bringToFront ===
        "function"
    ) {
      leafletLayer.bringToFront();
    }

    // ------------------------------------------
    // Open popup
    // ------------------------------------------

    if (
      "openPopup" in leafletLayer &&
      typeof leafletLayer.openPopup ===
        "function"
    ) {
      leafletLayer.openPopup();
    }
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <tr
      onClick={
        handleRowClick
      }
      className={`
        cursor-pointer
        border-b
        transition-colors
        ${
          isSelected
            ? "bg-yellow-100"
            : "hover:bg-muted"
        }
      `}
    >
      {/* ======================================
          ID
      ====================================== */}

      <td
        className="
          whitespace-nowrap
          border-r
          px-3
          py-2
          font-medium
        "
      >
        {Number.isFinite(
          assetId
        )
          ? assetId
          : "-"}
      </td>

      {/* ======================================
          ATTRIBUTES
      ====================================== */}

      {columns.map(
        (column) => (
          <td
            key={column}
            className="
              max-w-[260px]
              whitespace-nowrap
              overflow-hidden
              text-ellipsis
              px-3
              py-2
            "
            title={String(
              asset?.attributes?.[
                column
              ] ?? ""
            )}
          >
            {String(
              asset?.attributes?.[
                column
              ] ?? ""
            )}
          </td>
        )
      )}
    </tr>
  );
}