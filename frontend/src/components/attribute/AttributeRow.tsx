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

  return (

    <tr

      onClick={() =>
        setSelectedAsset(asset.id)
      }

      className={`cursor-pointer border-b transition

      ${
        selectedAssetId === asset.id

          ? "bg-sky-100"

          : "hover:bg-muted"

      }`}

    >

      {columns.map((column) => (

        <td
          key={column}
          className="px-3 py-2"
        >
          {String(asset.attributes[column] ?? "")}
        </td>

      ))}

    </tr>

  );

}