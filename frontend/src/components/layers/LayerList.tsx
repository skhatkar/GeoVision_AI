"use client";

import { useState, useMemo, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Folder,
  FolderOpen,
  Eye,
  EyeOff,
  CheckSquare,
  Square,
  Layers,
  ChevronDown,
  ChevronRight,
  Filter,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLayerStore } from "@/store/layerStore";
import { getProjects, type Project } from "@/api/projectApi";
import SortableLayerRow from "@/components/map/SortableLayerRow";
import type { GISLayer } from "@/types/layer";

interface Props {
  search?: string;
}

export default function LayerList({ search = "" }: Props) {
  const layers = useLayerStore((state) => state.layers);
  const moveLayer = useLayerStore((state) => state.moveLayer);
  const updateLayerStyle = useLayerStore((state) => state.updateLayerStyle);

  const [projects, setProjects] = useState<Project[]>([]);
  // Selected project IDs (empty array or "all" = all projects)
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [collapsedProjects, setCollapsedProjects] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<"project_tree" | "flat">("project_tree");

  useEffect(() => {
    getProjects()
      .then((data) => setProjects(data))
      .catch(() => setProjects([]));
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // Group layers by Project
  const projectGroups = useMemo(() => {
    const groups: {
      projectId: string;
      projectName: string;
      layers: GISLayer[];
    }[] = [];

    const projectMap = new Map<string, { projectName: string; layers: GISLayer[] }>();

    layers.forEach((layer) => {
      const matchSearch = layer.name.toLowerCase().includes(search.toLowerCase());
      if (!matchSearch) return;

      const pId = layer.projectId ? String(layer.projectId) : "general";
      const pName = layer.projectName || (pId === "general" ? "General / Base Layers" : `Project #${pId}`);

      if (!projectMap.has(pId)) {
        projectMap.set(pId, { projectName: pName, layers: [] });
      }
      projectMap.get(pId)!.layers.push(layer);
    });

    projectMap.forEach((val, pId) => {
      groups.push({
        projectId: pId,
        projectName: val.projectName,
        layers: val.layers,
      });
    });

    return groups;
  }, [layers, search]);

  // Distinct projects available in current layers
  const availableProjects = useMemo(() => {
    const map = new Map<string, string>();
    layers.forEach((l) => {
      const pId = l.projectId ? String(l.projectId) : "general";
      const pName = l.projectName || (pId === "general" ? "General / Base Layers" : `Project #${pId}`);
      map.set(pId, pName);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [layers]);

  // Filtered layers based on search and multi-project selection
  const activeFilteredLayers = useMemo(() => {
    return layers.filter((layer) => {
      const matchSearch = layer.name.toLowerCase().includes(search.toLowerCase());
      if (!matchSearch) return false;

      if (selectedProjectIds.length === 0) return true; // all selected
      const pId = layer.projectId ? String(layer.projectId) : "general";
      return selectedProjectIds.includes(pId);
    });
  }, [layers, search, selectedProjectIds]);

  const toggleProjectSelect = (projectId: string) => {
    setSelectedProjectIds((prev) => {
      if (prev.includes(projectId)) {
        return prev.filter((id) => id !== projectId);
      } else {
        return [...prev, projectId];
      }
    });
  };

  const selectAllProjects = () => {
    setSelectedProjectIds([]);
  };

  const toggleProjectCollapse = (projectId: string) => {
    setCollapsedProjects((prev) => ({
      ...prev,
      [projectId]: !prev[projectId],
    }));
  };

  const toggleAllLayersInProject = (groupLayers: GISLayer[], targetVisible: boolean) => {
    groupLayers.forEach((l) => {
      updateLayerStyle(l.id, { visible: targetVisible });
    });
  };

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = layers.findIndex((l) => l.id === active.id);
    const newIndex = layers.findIndex((l) => l.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      moveLayer(oldIndex, newIndex);
    }
  }

  if (layers.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
        <Layers size={24} className="mx-auto mb-2 opacity-40" />
        No layers registered yet. Upload a dataset to begin.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Multi-Project Filter Header */}
      {availableProjects.length > 1 && (
        <div className="rounded-xl border bg-muted/20 p-2.5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">
              <Filter size={11} />
              <span>Project Filter</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setViewMode(viewMode === "project_tree" ? "flat" : "project_tree")}
                className="text-[10px] text-primary hover:underline"
              >
                {viewMode === "project_tree" ? "Flat View" : "Project Groups"}
              </button>
            </div>
          </div>

          {/* Project Multi-Select Pills */}
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={selectAllProjects}
              className={`
                flex items-center gap-1 rounded-md px-2 py-0.5 text-xs transition-all cursor-pointer
                ${
                  selectedProjectIds.length === 0
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }
              `}
            >
              All ({layers.length})
            </button>

            {availableProjects.map((p) => {
              const isSelected = selectedProjectIds.includes(p.id);
              const pCount = layers.filter((l) => (l.projectId ? String(l.projectId) : "general") === p.id).length;

              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggleProjectSelect(p.id)}
                  className={`
                    flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs transition-all cursor-pointer
                    ${
                      isSelected
                        ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }
                  `}
                >
                  <span className="truncate max-w-[110px]">{p.name}</span>
                  <span className="opacity-75 text-[10px]">({pCount})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Layer Content */}
      {activeFilteredLayers.length === 0 ? (
        <div className="rounded-lg border p-4 text-center text-xs text-muted-foreground">
          No layers match the selected project filter or search.
        </div>
      ) : viewMode === "project_tree" ? (
        /* Hierarchical Project Group Folders */
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="space-y-3">
            {projectGroups
              .filter(
                (grp) =>
                  selectedProjectIds.length === 0 ||
                  selectedProjectIds.includes(grp.projectId)
              )
              .map((grp) => {
                const isCollapsed = !!collapsedProjects[grp.projectId];
                const allVisible = grp.layers.every((l) => l.visible);
                const someVisible = grp.layers.some((l) => l.visible);

                return (
                  <div
                    key={grp.projectId}
                    className="rounded-xl border bg-card/70 backdrop-blur-xs overflow-hidden shadow-xs"
                  >
                    {/* Project Folder Header */}
                    <div className="flex items-center justify-between bg-muted/40 px-3 py-2 border-b">
                      <button
                        type="button"
                        onClick={() => toggleProjectCollapse(grp.projectId)}
                        className="flex items-center gap-2 min-w-0 text-left cursor-pointer group"
                      >
                        {isCollapsed ? (
                          <ChevronRight size={14} className="text-muted-foreground group-hover:text-foreground" />
                        ) : (
                          <ChevronDown size={14} className="text-muted-foreground group-hover:text-foreground" />
                        )}
                        {isCollapsed ? (
                          <Folder size={15} className="text-amber-500 shrink-0" />
                        ) : (
                          <FolderOpen size={15} className="text-amber-500 shrink-0" />
                        )}
                        <span className="text-xs font-semibold text-foreground truncate max-w-[140px]">
                          {grp.projectName}
                        </span>
                      </button>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-mono">
                          {grp.layers.length} {grp.layers.length === 1 ? "layer" : "layers"}
                        </Badge>

                        {/* Toggle all layers in project */}
                        <button
                          type="button"
                          onClick={() => toggleAllLayersInProject(grp.layers, !allVisible)}
                          className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          title={allVisible ? "Hide all layers in project" : "Show all layers in project"}
                        >
                          {allVisible ? (
                            <Eye size={13} className="text-sky-500" />
                          ) : (
                            <EyeOff size={13} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Layers inside Project */}
                    {!isCollapsed && (
                      <div className="p-2.5 space-y-2">
                        <SortableContext
                          items={grp.layers.map((l) => l.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {grp.layers.map((layer) => (
                            <SortableLayerRow key={layer.id} layer={layer} />
                          ))}
                        </SortableContext>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </DndContext>
      ) : (
        /* Flat List View */
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={activeFilteredLayers.map((l) => l.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2.5">
              {activeFilteredLayers.map((layer) => (
                <SortableLayerRow key={layer.id} layer={layer} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}