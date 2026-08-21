"use client";

import Link from "next/link";

import {
  FolderKanban,
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


export default function RecentProjects() {
  const {
    data,
    loading,
  } = useDashboard();


  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Projects</CardTitle>
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


  const projects =
    data?.projects ?? [];


  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">

        <CardTitle>
          Recent Projects
        </CardTitle>

        <Link
          href="/projects"
          className="flex items-center gap-1 text-sm text-sky-500 hover:text-sky-400"
        >
          View all
          <ArrowRight size={15} />
        </Link>

      </CardHeader>

      <CardContent className="space-y-3">

        {projects.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No projects found.
          </p>
        ) : (
          projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects?id=${project.id}`}
              className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted"
            >

              <div className="flex items-center gap-3">

                <FolderKanban
                  className="h-5 w-5 text-sky-500"
                />

                <span className="font-medium">
                  {project.name}
                </span>

              </div>

              <span className="text-xs text-muted-foreground">
                {formatDate(project.created_at)}
              </span>

            </Link>
          ))
        )}

      </CardContent>
    </Card>
  );
}