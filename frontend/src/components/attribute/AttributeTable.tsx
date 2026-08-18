"use client";

import { useEffect, useMemo } from "react";

import useAttributeTable from "@/hooks/useAttributeTable";
import { useTableStore } from "@/store/tableStore";

import AttributeToolbar from "./AttributeToolbar";
import AttributeHeader from "./AttributeHeader";
import AttributeRow from "./AttributeRow";
import AttributePagination from "./AttributePagination";

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

  // ============================================
  // TABLE STORE
  // ============================================

  const search = useTableStore(
    (s) => s.search
  );

  const currentPage = useTableStore(
    (s) => s.currentPage
  );

  const pageSize = useTableStore(
    (s) => s.pageSize
  );

  const sortColumn = useTableStore(
    (s) => s.sortColumn
  );

  const sortDirection = useTableStore(
    (s) => s.sortDirection
  );

  const setCurrentPage = useTableStore(
    (s) => s.setCurrentPage
  );

  // ============================================
  // FILTER + SORT
  // ============================================

  const processedAssets = useMemo(() => {
    let result = [...assets];

    // ------------------------------------------
    // SEARCH
    // ------------------------------------------

    if (search.trim()) {
      const query = search
        .trim()
        .toLowerCase();

      result = result.filter((asset) =>
        JSON.stringify(
          asset.attributes
        )
          .toLowerCase()
          .includes(query)
      );
    }

    // ------------------------------------------
    // SORT
    // ------------------------------------------

    if (sortColumn) {
      result.sort((a: any, b: any) => {
        const aValue =
          a?.attributes?.[sortColumn];

        const bValue =
          b?.attributes?.[sortColumn];

        // Same value
        if (aValue === bValue) {
          return 0;
        }

        // Empty values
        const aEmpty =
          aValue === null ||
          aValue === undefined ||
          aValue === "";

        const bEmpty =
          bValue === null ||
          bValue === undefined ||
          bValue === "";

        if (aEmpty) {
          return sortDirection === "asc"
            ? -1
            : 1;
        }

        if (bEmpty) {
          return sortDirection === "asc"
            ? 1
            : -1;
        }

        // ----------------------------------------
        // NUMERIC SORT
        // ----------------------------------------

        const aNumber = Number(aValue);
        const bNumber = Number(bValue);

        if (
          Number.isFinite(aNumber) &&
          Number.isFinite(bNumber)
        ) {
          return sortDirection === "asc"
            ? aNumber - bNumber
            : bNumber - aNumber;
        }

        // ----------------------------------------
        // STRING SORT
        // ----------------------------------------

        const comparison =
          String(aValue).localeCompare(
            String(bValue),
            undefined,
            {
              numeric: true,
              sensitivity: "base",
            }
          );

        return sortDirection === "asc"
          ? comparison
          : -comparison;
      });
    }

    return result;
  }, [
    assets,
    search,
    sortColumn,
    sortDirection,
  ]);

  // ============================================
  // RESET PAGE
  // ============================================

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    sortColumn,
    sortDirection,
    pageSize,
    setCurrentPage,
  ]);

  // ============================================
  // PAGINATION
  // ============================================

  const totalRecords =
    processedAssets.length;

  const totalPages = Math.max(
    1,
    Math.ceil(
      totalRecords / pageSize
    )
  );

  const safePage = Math.min(
    Math.max(currentPage, 1),
    totalPages
  );

  const startIndex =
    (safePage - 1) * pageSize;

  const endIndex =
    startIndex + pageSize;

  const visibleAssets =
    processedAssets.slice(
      startIndex,
      endIndex
    );

  // ============================================
  // COLUMNS
  // ============================================

  const columns = useMemo(() => {
    if (!assets.length) {
      return [];
    }

    const first =
      assets[0]?.attributes;

    if (!first) {
      return [];
    }

    return Object.keys(first).filter(
      (column) =>
        column.toLowerCase() !== "id"
    );
  }, [assets]);

  // ============================================
  // LOADING
  // ============================================

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-10">
        <div className="text-sm text-muted-foreground">
          Loading Attribute Table...
        </div>
      </div>
    );
  }

  // ============================================
  // EMPTY
  // ============================================

  if (!assets.length) {
    return (
      <div className="flex h-full items-center justify-center p-10 text-muted-foreground">
        No records found.
      </div>
    );
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border bg-background">

      {/* ======================================
          TOOLBAR
      ====================================== */}

      <AttributeToolbar />

      {/* ======================================
          TABLE
      ====================================== */}

      <div className="min-h-0 flex-1 overflow-auto">

        <table className="w-full min-w-max border-collapse text-sm">

          <AttributeHeader
            columns={columns}
          />

          <tbody>

            {visibleAssets.length > 0 ? (
              visibleAssets.map(
                (asset) => (
                  <AttributeRow
                    key={asset.id}
                    asset={asset}
                    columns={columns}
                  />
                )
              )
            ) : (
              <tr>

                <td
                  colSpan={
                    columns.length + 1
                  }
                  className="p-8 text-center text-muted-foreground"
                >
                  No records match your search.
                </td>

              </tr>
            )}

          </tbody>

        </table>

      </div>

      {/* ======================================
          PAGINATION
      ====================================== */}

      <AttributePagination
        currentPage={safePage}
        totalPages={totalPages}
        totalRecords={totalRecords}
        pageSize={pageSize}
      />

    </div>
  );
}