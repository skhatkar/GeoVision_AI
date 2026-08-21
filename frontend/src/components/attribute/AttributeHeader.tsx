"use client";

import {
  ArrowUp,
  ArrowDown,
} from "lucide-react";

import { useTableStore } from "@/store/tableStore";

interface Props {
  columns: string[];
}

export default function AttributeHeader({
  columns,
}: Props) {
  const sortColumn =
    useTableStore(
      (state) => state.sortColumn
    );

  const sortDirection =
    useTableStore(
      (state) => state.sortDirection
    );

  const setSort =
    useTableStore(
      (state) => state.setSort
    );

  function handleSort(
    column: string
  ) {
    if (
      sortColumn === column
    ) {
      setSort(
        column,
        sortDirection === "asc"
          ? "desc"
          : "asc"
      );

      return;
    }

    setSort(
      column,
      "asc"
    );
  }

  return (
    <thead
      className="
        sticky
        top-0
        z-20
        bg-background
      "
    >
      <tr>

        {/* ==================================
            ID COLUMN
        ================================== */}

        <th
          className="
            whitespace-nowrap
            border
            bg-background
            px-3
            py-2
            text-left
            font-semibold
          "
        >
          ID
        </th>

        {/* ==================================
            ATTRIBUTE COLUMNS
        ================================== */}

        {columns.map(
          (column) => {

            const isActive =
              sortColumn === column;

            return (
              <th
                key={column}
                className="
                  whitespace-nowrap
                  border
                  bg-background
                  px-3
                  py-2
                  text-left
                  font-semibold
                "
              >
                <button
                  type="button"
                  onClick={() =>
                    handleSort(
                      column
                    )
                  }
                  className="
                    flex
                    w-full
                    items-center
                    justify-between
                    gap-3
                    text-left
                    hover:text-sky-600
                  "
                >

                  <span>
                    {column}
                  </span>

                  <span
                    className="
                      flex
                      flex-col
                      leading-none
                    "
                  >

                    {isActive &&
                    sortDirection ===
                      "asc" ? (
                      <ArrowUp
                        size={13}
                        className="text-sky-600"
                      />
                    ) : isActive &&
                      sortDirection ===
                        "desc" ? (
                      <ArrowDown
                        size={13}
                        className="text-sky-600"
                      />
                    ) : (
                      <>
                        <ArrowUp
                          size={10}
                          className="
                            text-muted-foreground/50
                          "
                        />

                        <ArrowDown
                          size={10}
                          className="
                            text-muted-foreground/50
                          "
                        />
                      </>
                    )}

                  </span>

                </button>
              </th>
            );
          }
        )}

      </tr>
    </thead>
  );
}