"use client";

import Link from "next/link";

import {
  FileUp,
  ArrowRight,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import useDashboard from "@/hooks/useDashboard";


function formatDate(
  date: string | null
) {
  if (!date) {
    return "Unknown date";
  }

  return new Date(date).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}


export default function RecentUploads() {
  const {
    data,
    loading,
  } = useDashboard();


  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Uploads</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-12 animate-pulse rounded-lg bg-muted"
            />
          ))}
        </CardContent>
      </Card>
    );
  }


  const datasets =
    data?.datasets ?? [];


  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">

        <CardTitle>
          Recent Uploads
        </CardTitle>

        <Link
          href="/datasets"
          className="flex items-center gap-1 text-sm text-sky-500 hover:text-sky-400"
        >
          View all
          <ArrowRight size={15} />
        </Link>

      </CardHeader>

      <CardContent className="space-y-3">

        {datasets.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No datasets uploaded yet.
          </p>
        ) : (
          datasets.map((dataset) => (
            <Link
              key={dataset.id}
              href={`/datasets?id=${dataset.id}`}
              className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted"
            >

              <div className="flex items-center gap-3">

                <FileUp
                  className="h-5 w-5 text-emerald-500"
                />

                <div>

                  <p className="font-medium">
                    {dataset.file_name || dataset.name}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {dataset.feature_count.toLocaleString("en-IN")} features
                  </p>

                </div>

              </div>

              <span className="text-xs text-muted-foreground">
                {formatDate(dataset.created_at)}
              </span>

            </Link>
          ))
        )}

      </CardContent>
    </Card>
  );
}