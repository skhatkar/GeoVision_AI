"use client";

import { useTableStore } from "@/store/tableStore";

interface Props {
  asset: any;
  columns: string[];
}

export default function AttributeRow({
  asset,
  columns,
}: Props) {
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

  return (
    <tr
      onClick={() => {
        setSelectedAsset(
          asset.id
        );

        setSelectedAssetData(
          asset
        );
      }}
      className={`
        cursor-pointer
        border-b
        transition
        ${
          selectedAssetId ===
          asset.id
            ? "bg-sky-100"
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
        {asset.id}
      </td>

      {/* ======================================
          ATTRIBUTES
      ====================================== */}

      {columns.map(
        (column) => (
          <td
            key={column}
            className="
              max-w-[300px]
              whitespace-nowrap
              border-r
              px-3
              py-2
            "
            title={String(
              asset.attributes?.[
                column
              ] ?? ""
            )}
          >
            {String(
              asset.attributes?.[
                column
              ] ?? ""
            )}
          </td>
        )
      )}

    </tr>
  );
}