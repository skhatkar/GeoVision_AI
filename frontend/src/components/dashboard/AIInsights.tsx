"use client";

import {
  Database,
  Layers,
  Box,
  MapPin,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import useDashboard from "@/hooks/useDashboard";


export default function AIInsights() {
  const {
    data,
    loading,
  } = useDashboard();


  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>GeoVision Insights</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="h-32 animate-pulse rounded-xl bg-muted" />
        </CardContent>
      </Card>
    );
  }


  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>GeoVision Insights</CardTitle>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-muted-foreground">
            No dashboard information available.
          </p>
        </CardContent>
      </Card>
    );
  }


  const {
    summary,
    geometry,
  } = data;


  const insights = [
    {
      icon: Database,
      color: "text-emerald-500",
      text: `${summary.total_datasets.toLocaleString("en-IN")} datasets are available in GeoVision.`,
    },
    {
      icon: Layers,
      color: "text-violet-500",
      text: `${summary.total_layers.toLocaleString("en-IN")} GIS layers are currently registered.`,
    },
    {
      icon: Box,
      color: "text-sky-500",
      text: `${summary.total_assets.toLocaleString("en-IN")} spatial assets are available.`,
    },
    {
      icon: MapPin,
      color: "text-orange-500",
      text: `${geometry.point_layers} point, ${geometry.line_layers} line and ${geometry.polygon_layers} polygon layers.`,
    },
  ];


  return (
    <Card>
      <CardHeader>
        <CardTitle>
          GeoVision Insights
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">

        {insights.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={index}
              className="flex items-center gap-3 rounded-lg border p-3"
            >
              <Icon
                className={`h-5 w-5 ${item.color}`}
              />

              <p className="text-sm">
                {item.text}
              </p>
            </div>
          );
        })}

      </CardContent>
    </Card>
  );
}