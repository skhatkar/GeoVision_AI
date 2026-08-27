"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getDatasets, uploadDataset, deleteDataset, type Dataset } from "@/api/datasetApi";
import { getProjects, type Project } from "@/api/projectApi";
import {
  Upload,
  Database,
  Search,
  Trash2,
  Plus,
  File,
  AlertCircle,
  CheckCircle2,
  CloudUpload,
  X,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
function fmtDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function fileTypeBadge(type: string) {
  const map: Record<string, string> = {
    geojson: "bg-emerald-500/15 text-emerald-400",
    shp: "bg-blue-500/15 text-blue-400",
    shapefile: "bg-blue-500/15 text-blue-400",
    csv: "bg-orange-500/15 text-orange-400",
    tif: "bg-violet-500/15 text-violet-400",
    tiff: "bg-violet-500/15 text-violet-400",
    geotiff: "bg-violet-500/15 text-violet-400",
    json: "bg-cyan-500/15 text-cyan-400",
  };
  const key = type?.toLowerCase();
  return map[key] ?? "bg-muted text-muted-foreground";
}

function geomBadge(type: string | null) {
  if (!type) return "bg-muted text-muted-foreground";
  const map: Record<string, string> = {
    point: "bg-sky-500/15 text-sky-400",
    multipoint: "bg-sky-500/15 text-sky-400",
    linestring: "bg-yellow-500/15 text-yellow-400",
    multilinestring: "bg-yellow-500/15 text-yellow-400",
    polygon: "bg-rose-500/15 text-rose-400",
    multipolygon: "bg-rose-500/15 text-rose-400",
  };
  return map[type.toLowerCase()] ?? "bg-muted text-muted-foreground";
}

// ─────────────────────────────────────────────────────────────
// Upload Sheet
// ─────────────────────────────────────────────────────────────
interface UploadSheetProps {
  open: boolean;
  onClose: () => void;
  projects: Project[];
  onUploaded: () => void;
}

function UploadSheet({ open, onClose, projects, onUploaded }: UploadSheetProps) {
  const [projectId, setProjectId] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setFile(null);
    setStatus("idle");
    setErrMsg("");
    setProjectId("");
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  }

  async function handleUpload() {
    if (!projectId || !file) {
      setErrMsg("Please select a project and a file.");
      return;
    }
    setUploading(true);
    setErrMsg("");
    try {
      await uploadDataset(Number(projectId), file);
      setStatus("success");
      onUploaded();
      setTimeout(() => { onClose(); reset(); }, 1500);
    } catch (err: any) {
      setStatus("error");
      setErrMsg(err?.message || "Upload failed. Check file format and try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={() => { onClose(); reset(); }} modal={false}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <CloudUpload size={20} className="text-primary" />
            Upload Dataset
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Project selector */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Target Project *</label>
            <Select value={projectId} onValueChange={(v) => setProjectId(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="Select a project…" />
              </SelectTrigger>
              <SelectContent className="z-[9999]">
                {projects.length === 0 ? (
                  <SelectItem value="__none" disabled>No projects found – create one first</SelectItem>
                ) : (
                  projects.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`
              relative flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all
              ${dragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-border hover:border-primary/50 hover:bg-muted/30"}
            `}
          >
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept=".geojson,.json,.shp,.zip,.csv,.gpkg,.tif,.tiff"
              onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
            />
            {file ? (
              <div className="space-y-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mx-auto">
                  <File size={28} className="text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{file.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mx-auto"
                >
                  <X size={12} /> Remove
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted mx-auto">
                  <CloudUpload size={28} className="text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-sm">Drop file here or click to browse</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    GeoJSON · Shapefile (.zip or .shp) · CSV · GeoPackage
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Supported formats */}
          <div className="flex flex-wrap gap-2">
            {[".zip (Shapefile)", ".shp", ".geojson", ".csv", ".gpkg"].map((ext) => (
              <span
                key={ext}
                className="rounded-lg border bg-muted px-2.5 py-1 text-xs font-mono text-muted-foreground"
              >
                {ext}
              </span>
            ))}
          </div>

          {/* Status messages */}
          {errMsg && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              {errMsg}
            </div>
          )}
          {status === "success" && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-400">
              <CheckCircle2 size={15} />
              Dataset uploaded successfully!
            </div>
          )}

          <Button
            className="w-full gap-2 h-11"
            onClick={handleUpload}
            disabled={uploading || status === "success"}
          >
            {uploading ? (
              <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Uploading…</>
            ) : (
              <><Upload size={16} /> Upload Dataset</>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────
export default function DatasetsPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterGeom, setFilterGeom] = useState("all");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Dataset | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ds, ps] = await Promise.all([
        getDatasets().catch((e) => { console.error("Failed to load datasets", e); return []; }),
        getProjects().catch((e) => { console.error("Failed to load projects", e); return []; }),
      ]);
      setDatasets(ds);
      setProjects(ps);
    } catch {
      setDatasets([]);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteDataset(deleteTarget.id);
      await load();
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  const fileTypes = [...new Set(datasets.map((d) => d.file_type).filter(Boolean))];
  const geomTypes = [...new Set(datasets.map((d) => d.geometry_type).filter(Boolean) as string[])];

  const filtered = datasets.filter((d) => {
    const q = search.toLowerCase();
    const matchSearch = d.name.toLowerCase().includes(q) || d.file_name.toLowerCase().includes(q);
    const matchType = filterType === "all" || d.file_type === filterType;
    const matchGeom = filterGeom === "all" || d.geometry_type === filterGeom;
    return matchSearch && matchType && matchGeom;
  });

  return (
    <AppShell>
      <PageHeader
        title="Datasets"
        subtitle="Upload, manage, and explore your spatial datasets"
      />

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        {[
          { label: "Total Datasets", value: datasets.length, color: "text-emerald-400" },
          { label: "GeoJSON", value: datasets.filter((d) => d.file_type?.toLowerCase().includes("geojson")).length, color: "text-emerald-400" },
          { label: "Shapefiles", value: datasets.filter((d) => d.file_type?.toLowerCase().includes("shp")).length, color: "text-blue-400" },
          { label: "Total Features", value: datasets.reduce((s, d) => s + (d.feature_count ?? 0), 0).toLocaleString("en-IN"), color: "text-violet-400" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className={`mt-1 text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-60 flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search datasets…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <Select value={filterType} onValueChange={(v) => setFilterType(v ?? "all")}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="File type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {fileTypes.map((t) => <SelectItem key={t} value={t}>{t.toUpperCase()}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={filterGeom} onValueChange={(v) => setFilterGeom(v ?? "all")}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Geometry" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All geometry</SelectItem>
            {geomTypes.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
          </SelectContent>
        </Select>

        <Button onClick={() => setUploadOpen(true)} className="gap-2 shrink-0">
          <Plus size={16} />
          Upload Dataset
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>File Type</TableHead>
              <TableHead>Geometry</TableHead>
              <TableHead>Features</TableHead>
              <TableHead>CRS</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(7)].map((_, j) => (
                    <TableCell key={j}>
                      <div className="h-4 w-full animate-pulse rounded bg-muted" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}

            {!loading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>
                  <div className="flex flex-col items-center py-16 text-center">
                    <Database size={40} className="mb-4 text-muted-foreground/40" />
                    <p className="font-medium">{search ? "No matching datasets" : "No datasets yet"}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {search ? `No results for "${search}".` : "Upload a dataset to get started."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {!loading && filtered.map((d) => (
              <TableRow key={d.id} className="hover:bg-muted/30">
                <TableCell>
                  <div>
                    <p className="font-medium text-sm">{d.name}</p>
                    <p className="text-xs text-muted-foreground">{d.file_name}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={`text-xs ${fileTypeBadge(d.file_type)}`}>
                    {d.file_type?.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>
                  {d.geometry_type ? (
                    <Badge className={`text-xs ${geomBadge(d.geometry_type)}`}>
                      {d.geometry_type}
                    </Badge>
                  ) : "—"}
                </TableCell>
                <TableCell className="text-sm">{(d.feature_count ?? 0).toLocaleString("en-IN")}</TableCell>
                <TableCell className="text-xs text-muted-foreground font-mono">{d.crs ?? "—"}</TableCell>
                <TableCell className="text-sm">{fmtDate(d.created_at)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => setDeleteTarget(d)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Upload Sheet */}
      <UploadSheet
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        projects={projects}
        onUploaded={load}
      />

      {/* Delete confirm */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Dataset</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Delete <strong>"{deleteTarget?.name}"</strong>? This will also remove any associated layers.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
