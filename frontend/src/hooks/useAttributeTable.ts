"use client";

import { useEffect, useState } from "react";

import { getLayerAssets } from "@/services/assets";
import type { Asset } from "@/types/asset";

export default function useAttributeTable(
  layerId?: number
) {
  const [assets, setAssets] = useState<Asset[]>([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!layerId) return;

    async function load() {
      try {
        setLoading(true);

        const data = await getLayerAssets(layerId);

        setAssets(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [layerId]);

  return {
    assets,
    loading,
  };
}