"use client";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { useTableStore } from "@/store/tableStore";

interface Props {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  pageSize: number;
}

export default function AttributePagination({
  currentPage,
  totalPages,
  totalRecords,
  pageSize,
}: Props) {
  const setCurrentPage =
    useTableStore(
      (s) => s.setCurrentPage
    );

  const setPageSize =
    useTableStore(
      (s) => s.setPageSize
    );

  const start =
    totalRecords === 0
      ? 0
      : (currentPage - 1) *
          pageSize +
        1;

  const end =
    Math.min(
      currentPage *
        pageSize,
      totalRecords
    );

  // --------------------------------------------
  // Page numbers
  // --------------------------------------------

  const pages: number[] =
    [];

  const maxVisiblePages =
    5;

  let startPage =
    Math.max(
      1,
      currentPage -
        Math.floor(
          maxVisiblePages /
            2
        )
    );

  let endPage =
    Math.min(
      totalPages,
      startPage +
        maxVisiblePages -
        1
    );

  if (
    endPage -
      startPage +
      1 <
    maxVisiblePages
  ) {
    startPage =
      Math.max(
        1,
        endPage -
          maxVisiblePages +
          1
      );
  }

  for (
    let page = startPage;
    page <= endPage;
    page++
  ) {
    pages.push(page);
  }

  return (
    <div
      className="
        flex
        flex-wrap
        items-center
        justify-between
        gap-3
        border-t
        bg-background
        px-3
        py-2
      "
    >

      {/* ======================================
          RECORD COUNT
      ====================================== */}

      <div className="text-xs text-muted-foreground">
        Showing{" "}
        <span className="font-medium text-foreground">
          {start}
        </span>
        {" – "}
        <span className="font-medium text-foreground">
          {end}
        </span>
        {" of "}
        <span className="font-medium text-foreground">
          {totalRecords}
        </span>
      </div>

      {/* ======================================
          CONTROLS
      ====================================== */}

      <div className="flex items-center gap-2">

        {/* PAGE SIZE */}

        <select
          value={pageSize}
          onChange={(e) =>
            setPageSize(
              Number(
                e.target.value
              )
            )
          }
          className="
            rounded-md
            border
            bg-background
            px-2
            py-1.5
            text-xs
            outline-none
            focus:ring-2
            focus:ring-sky-500
          "
        >
          <option value={10}>
            10 / page
          </option>

          <option value={25}>
            25 / page
          </option>

          <option value={50}>
            50 / page
          </option>

          <option value={100}>
            100 / page
          </option>
        </select>

        {/* PREVIOUS */}

        <button
          type="button"
          disabled={
            currentPage <= 1
          }
          onClick={() =>
            setCurrentPage(
              currentPage - 1
            )
          }
          className="
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-md
            border
            hover:bg-muted
            disabled:cursor-not-allowed
            disabled:opacity-40
          "
          title="Previous page"
        >
          <ChevronLeft
            size={16}
          />
        </button>

        {/* PAGE NUMBERS */}

        <div className="flex items-center gap-1">

          {startPage > 1 && (
            <>
              <button
                type="button"
                onClick={() =>
                  setCurrentPage(
                    1
                  )
                }
                className="
                  h-8
                  min-w-8
                  rounded-md
                  border
                  px-2
                  text-xs
                  hover:bg-muted
                "
              >
                1
              </button>

              {startPage > 2 && (
                <span className="px-1 text-muted-foreground">
                  ...
                </span>
              )}
            </>
          )}

          {pages.map(
            (page) => (
              <button
                key={page}
                type="button"
                onClick={() =>
                  setCurrentPage(
                    page
                  )
                }
                className={`
                  h-8
                  min-w-8
                  rounded-md
                  border
                  px-2
                  text-xs
                  transition
                  ${
                    currentPage ===
                    page
                      ? "border-sky-600 bg-sky-600 text-white"
                      : "hover:bg-muted"
                  }
                `}
              >
                {page}
              </button>
            )
          )}

          {endPage <
            totalPages && (
            <>
              {endPage <
                totalPages -
                  1 && (
                <span className="px-1 text-muted-foreground">
                  ...
                </span>
              )}

              <button
                type="button"
                onClick={() =>
                  setCurrentPage(
                    totalPages
                  )
                }
                className="
                  h-8
                  min-w-8
                  rounded-md
                  border
                  px-2
                  text-xs
                  hover:bg-muted
                "
              >
                {totalPages}
              </button>
            </>
          )}

        </div>

        {/* NEXT */}

        <button
          type="button"
          disabled={
            currentPage >=
            totalPages
          }
          onClick={() =>
            setCurrentPage(
              currentPage + 1
            )
          }
          className="
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-md
            border
            hover:bg-muted
            disabled:cursor-not-allowed
            disabled:opacity-40
          "
          title="Next page"
        >
          <ChevronRight
            size={16}
          />
        </button>

      </div>

    </div>
  );
}