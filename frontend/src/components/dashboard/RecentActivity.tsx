"use client";

import {
  Activity,
  Upload,
  Layers,
  Box,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import useDashboard from "@/hooks/useDashboard";


function formatRelativeDate(
  date: string | null
) {
  if (!date) {
    return "Unknown";
  }

  const created =
    new Date(date).getTime();

  const now =
    Date.now();

  const difference =
    Math.max(0, now - created);

  const minutes =
    Math.floor(
      difference / (1000 * 60)
    );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours =
    Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hr ago`;
  }

  const days =
    Math.floor(hours / 24);

  if (days < 30) {
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }

  return new Date(date).toLocaleDateString(
    "en-IN"
  );
}


export default function RecentActivity() {
  const {
    data,
    loading,
  } = useDashboard();


  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
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
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-muted-foreground">
            No activity available.
          </p>
        </CardContent>
      </Card>
    );
  }


  const activities = [
    ...data.datasets.map((item) => ({
      id: `dataset-${item.id}`,
      icon: Upload,
      text: `${item.file_name || item.name} uploaded`,
      date: item.created_at,
    })),

    ...data.layers.map((item) => ({
      id: `layer-${item.id}`,
      icon: Layers,
      text: `${item.name} layer created`,
      date: item.created_at,
    })),

    ...data.assets.map((item) => ({
      id: `asset-${item.id}`,
      icon: Box,
      text: `${item.name} asset created`,
      date: item.created_at,
    })),
  ]
    .sort(
      (a, b) =>
        new Date(b.date ?? 0).getTime() -
        new Date(a.date ?? 0).getTime()
    )
    .slice(0, 5);


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-sky-500" />
          Recent Activity
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">

        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No recent activity.
          </p>
        ) : (
          activities.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4"
              >

                <div className="flex items-center gap-3">

                  <Icon className="h-5 w-5 shrink-0 text-sky-500" />

                  <span className="text-sm">
                    {item.text}
                  </span>

                </div>

                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatRelativeDate(item.date)}
                </span>

              </div>
            );
          })
        )}

      </CardContent>
    </Card>
  );
}