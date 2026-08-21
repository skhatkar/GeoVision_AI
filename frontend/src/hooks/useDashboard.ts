"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getDashboardData,
} from "@/services/dashboard";

import type {
  DashboardData,
} from "@/types/dashboard";


interface UseDashboardResult {

  data: DashboardData | null;

  loading: boolean;

  error: string | null;

  refresh: () => Promise<void>;
}


export default function useDashboard(): UseDashboardResult {

  const [data, setData] =
    useState<DashboardData | null>(null);


  const [loading, setLoading] =
    useState(true);


  const [error, setError] =
    useState<string | null>(null);


  const loadDashboard = useCallback(
    async () => {

      try {

        setLoading(true);

        setError(null);


        const result =
          await getDashboardData();


        setData(result);

      } catch (err) {

        console.error(
          "Failed to load dashboard:",
          err
        );


        setError(
          err instanceof Error
            ? err.message
            : "Failed to load dashboard"
        );

      } finally {

        setLoading(false);

      }

    },
    []
  );


  useEffect(() => {

    loadDashboard();

  }, [loadDashboard]);


  return {

    data,

    loading,

    error,

    refresh: loadDashboard,

  };
}