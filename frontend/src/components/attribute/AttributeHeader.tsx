"use client";

import {
  ArrowUp,
  ArrowDown,
} from "lucide-react";

interface Props {
  columns: string[];
}

export default function AttributeHeader({
  columns,
}: Props) {
  return (
    <thead className="sticky top-0 bg-background z-20">

      <tr>

        <th className="border px-3 py-2">
          ID
        </th>

        {columns.map((column) => (

          <th
            key={column}
            className="border px-3 py-2"
          >

            <div className="flex items-center justify-between">

              {column}

              <span className="flex flex-col">

                <ArrowUp size={10} />

                <ArrowDown size={10} />

              </span>

            </div>

          </th>

        ))}

      </tr>

    </thead>
  );
}