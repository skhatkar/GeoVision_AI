"use client";

import { useEffect, useState } from "react";

import { getLayerAssets } from "@/services/assets";

export default function useAttributeTable(
  layerId?: number
) {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (layerId === undefined) {
      setAssets([]);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadAssets = async () => {
      try {
        setLoading(true);
        setError(null);

        const data =
          await getLayerAssets(layerId);

        if (cancelled) return;

        setAssets(data);
      } catch (err) {
        if (cancelled) return;

        console.error(
          "Failed to load layer assets:",
          err
        );

        setAssets([]);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load attributes"
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadAssets();

    return () => {
      cancelled = true;
    };
  }, [layerId]);

  return {
    assets,
    loading,
    error,
  };
}