"use client";

import { useMemo, useState } from "react";

import useAttributeTable from "@/hooks/useAttributeTable";

import AttributeToolbar from "./AttributeToolbar";
import AttributeHeader from "./AttributeHeader";
import AttributeRow from "./AttributeRow";

interface Props {
  layerId: number;
}

export default function AttributeTable({
  layerId,
}: Props) {

  const {
    assets,
    loading,
  } = useAttributeTable(layerId);

  const [search, setSearch] = useState("");

  const filteredAssets = useMemo(() => {

    if (!search) return assets;

    return assets.filter((asset) =>

      JSON.stringify(asset.attributes)
        .toLowerCase()
        .includes(search.toLowerCase())

    );

  }, [assets, search]);

  if (loading) {

    return (
      <div className="flex items-center justify-center p-10">
        Loading Attribute Table...
      </div>
    );

  }

  if (!assets.length) {

    return (
      <div className="flex items-center justify-center p-10 text-muted-foreground">
        No records found.
      </div>
    );

  }

  const columns = Object.keys(
    assets[0].attributes
  );

  return (

    <div className="flex h-full flex-col rounded-xl border bg-background">

      <AttributeToolbar
        search={search}
        setSearch={setSearch}
      />

      <div className="flex-1 overflow-auto">

        <table className="w-full border-collapse text-sm">

          <AttributeHeader
            columns={columns}
          />

          <tbody>

            {filteredAssets.map((asset) => (

              <AttributeRow
                key={asset.id}
                asset={asset}
                columns={columns}
              />

            ))}

          </tbody>

        </table>

      </div>

    </div>

  );

}