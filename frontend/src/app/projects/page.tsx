"use client";

import { useState, useEffect, useCallback } from "react";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  type Project,
} from "@/api/projectApi";
import {
  FolderKanban,
  Plus,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  Calendar,
  Database,
  Layers,
  ArrowRight,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
function fmtDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

const CARD_COLORS = [
  "from-blue-500/20 to-blue-600/5 border-blue-500/20",
  "from-emerald-500/20 to-emerald-600/5 border-emerald-500/20",
  "from-violet-500/20 to-violet-600/5 border-violet-500/20",
  "from-orange-500/20 to-orange-600/5 border-orange-500/20",
  "from-rose-500/20 to-rose-600/5 border-rose-500/20",
  "from-cyan-500/20 to-cyan-600/5 border-cyan-500/20",
];

const BADGE_COLORS = [
  "bg-blue-500/15 text-blue-400",
  "bg-emerald-500/15 text-emerald-400",
  "bg-violet-500/15 text-violet-400",
  "bg-orange-500/15 text-orange-400",
  "bg-rose-500/15 text-rose-400",
  "bg-cyan-500/15 text-cyan-400",
];

// ─────────────────────────────────────────────────────────────
// Project Form Dialog
// ─────────────────────────────────────────────────────────────
interface ProjectFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (name: string, description: string) => Promise<void>;
  initial?: { name: string; description: string };
  title: string;
}

function ProjectFormDialog({
  open,
  onClose,
  onSave,
  initial,
  title,
}: ProjectFormDialogProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [desc, setDesc] = useState(initial?.description ?? "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (open) {
      setName(initial?.name ?? "");
      setDesc(initial?.description ?? "");
      setErr("");
    }
  }, [open, initial]);

  async function handleSave() {
    if (!name.trim()) { setErr("Project name is required."); return; }
    setSaving(true);
    try {
      await onSave(name.trim(), desc.trim());
      onClose();
    } catch {
      setErr("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Project Name *</label>
            <Input
              placeholder="e.g. Road Infrastructure Survey"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Description</label>
            <textarea
              placeholder="Brief description of this project…"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
          {err && (
            <p className="text-sm text-destructive">{err}</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────
// Delete Confirm Dialog
// ─────────────────────────────────────────────────────────────
interface DeleteDialogProps {
  open: boolean;
  projectName: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

function DeleteDialog({ open, projectName, onClose, onConfirm }: DeleteDialogProps) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try { await onConfirm(); onClose(); }
    finally { setDeleting(false); }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete Project</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground py-2">
          Are you sure you want to delete <strong>"{projectName}"</strong>?
          This action cannot be undone and will remove all associated datasets and layers.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={deleting}>Cancel</Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────
export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Project | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProjects();
      setProjects(data);
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  async function handleCreate(name: string, description: string) {
    await createProject({ name, description });
    await load();
  }

  async function handleEdit(name: string, description: string) {
    if (!editTarget) return;
    await updateProject(editTarget.id, { name, description });
    await load();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await deleteProject(deleteTarget.id);
    await load();
  }

  return (
    <AppShell>
      <PageHeader
        title="Projects"
        subtitle="Organize your GIS datasets and layers by project"
      />

      {/* Stats row */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Projects", value: projects.length, color: "text-blue-400" },
          { label: "Total Datasets", value: "—", color: "text-emerald-400" },
          { label: "Total Layers", value: "—", color: "text-violet-400" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className={`mt-1 text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-60">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="gap-2 shrink-0"
        >
          <Plus size={16} />
          New Project
        </Button>
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-52 animate-pulse rounded-2xl border bg-card"
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <FolderKanban size={36} className="text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold">
            {search ? "No matching projects" : "No projects yet"}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-xs">
            {search
              ? `No projects found for "${search}".`
              : "Create your first project to start organizing your GIS data."}
          </p>
          {!search && (
            <Button className="mt-6 gap-2" onClick={() => setCreateOpen(true)}>
              <Plus size={16} />
              Create Project
            </Button>
          )}
        </div>
      )}

      {/* Project cards grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((project, idx) => {
            const colorClass = CARD_COLORS[idx % CARD_COLORS.length];
            const badgeColor = BADGE_COLORS[idx % BADGE_COLORS.length];

            return (
              <div
                key={project.id}
                className={`group hover-lift relative rounded-2xl border bg-gradient-to-br p-6 transition-all duration-300 ${colorClass}`}
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold ${badgeColor}`}
                    >
                      {initials(project.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="truncate font-semibold text-foreground leading-tight">
                        {project.name}
                      </h3>
                      <Badge variant="secondary" className="mt-1 text-xs">
                        ID #{project.id}
                      </Badge>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className={`
                        inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-all
                        opacity-0 group-hover:opacity-100
                        hover:bg-accent hover:text-accent-foreground
                        focus:outline-none
                      `}
                    >
                      <MoreVertical size={15} />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => setEditTarget(project)}
                        className="gap-2"
                      >
                        <Pencil size={14} />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setDeleteTarget(project)}
                        className="gap-2 text-destructive focus:text-destructive"
                      >
                        <Trash2 size={14} />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Description */}
                <p className="mt-4 text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                  {project.description || "No description provided."}
                </p>

                {/* Meta row */}
                <div className="mt-5 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Database size={12} />
                    Datasets
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Layers size={12} />
                    Layers
                  </span>
                  <span className="ml-auto flex items-center gap-1.5">
                    <Calendar size={12} />
                    {fmtDate(project.created_at)}
                  </span>
                </div>

                {/* Footer link */}
                <div className="mt-4 flex items-center justify-end">
                  <button className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity hover:gap-2">
                    View details
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dialogs */}
      <ProjectFormDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSave={handleCreate}
        title="New Project"
      />

      <ProjectFormDialog
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSave={handleEdit}
        initial={editTarget ? { name: editTarget.name, description: editTarget.description ?? "" } : undefined}
        title="Edit Project"
      />

      <DeleteDialog
        open={!!deleteTarget}
        projectName={deleteTarget?.name ?? ""}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </AppShell>
  );
}
