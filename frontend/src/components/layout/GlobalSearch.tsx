"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  Map,
  Workflow,
  ChartColumnIncreasing,
  Brain,
  FolderKanban,
  Database,
  Layers,
  Box,
  Settings,
  ArrowRight,
  X,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getProjects, type Project } from "@/api/projectApi";
import { getDatasets, type Dataset } from "@/api/datasetApi";
import { getLayers, type BackendLayer } from "@/api/layerApi";

interface SearchResultItem {
  id: string;
  title: string;
  subtitle?: string;
  category: "Navigation" | "Layers" | "Datasets" | "Projects";
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

const STATIC_ROUTES: SearchResultItem[] = [
  {
    id: "nav-dashboard",
    title: "Dashboard",
    subtitle: "State-wide GIS executive command center & metrics",
    category: "Navigation",
    href: "/dashboard",
    icon: <LayoutDashboard size={16} className="text-sky-500" />,
    badge: "Module",
  },
  {
    id: "nav-map",
    title: "GIS Map Viewer",
    subtitle: "Interactive spatial map, drawing tools & layer inspector",
    category: "Navigation",
    href: "/map",
    icon: <Map size={16} className="text-emerald-500" />,
    badge: "Core",
  },
  {
    id: "nav-analysis",
    title: "Spatial Analysis Engine",
    subtitle: "Buffer, intersect, within, clip, convex hull & clustering",
    category: "Navigation",
    href: "/analysis",
    icon: <Workflow size={16} className="text-amber-500" />,
    badge: "PostGIS",
  },
  {
    id: "nav-analytics",
    title: "Spatial Analytics & Reports",
    subtitle: "Departmental asset distribution & boundary breakdowns",
    category: "Navigation",
    href: "/analytics",
    icon: <ChartColumnIncreasing size={16} className="text-violet-500" />,
    badge: "Analytics",
  },
  {
    id: "nav-ai",
    title: "GeoVision AI Copilot",
    subtitle: "Natural language GIS reasoning, query & automated audit",
    category: "Navigation",
    href: "/ai",
    icon: <Brain size={16} className="text-pink-500" />,
    badge: "AI",
  },
  {
    id: "nav-projects",
    title: "GIS Projects",
    subtitle: "Multi-departmental workspace and GIS portfolios",
    category: "Navigation",
    href: "/projects",
    icon: <FolderKanban size={16} className="text-blue-500" />,
    badge: "Workspace",
  },
  {
    id: "nav-datasets",
    title: "State Datasets",
    subtitle: "Raw GeoJSON, Shapefiles, KML vector repositories",
    category: "Navigation",
    href: "/datasets",
    icon: <Database size={16} className="text-teal-500" />,
    badge: "Data",
  },
  {
    id: "nav-layers",
    title: "Spatial Layers",
    subtitle: "Curated departmental layers and thematic overlays",
    category: "Navigation",
    href: "/layers",
    icon: <Layers size={16} className="text-indigo-500" />,
    badge: "GIS",
  },
  {
    id: "nav-assets",
    title: "Infrastructure Assets",
    subtitle: "Mapped physical assets and government facilities",
    category: "Navigation",
    href: "/assets",
    icon: <Box size={16} className="text-orange-500" />,
    badge: "SDI",
  },
  {
    id: "nav-settings",
    title: "System Settings",
    subtitle: "Configure state credentials, appearance & projections",
    category: "Navigation",
    href: "/settings",
    icon: <Settings size={16} className="text-slate-400" />,
    badge: "Config",
  },
];

export default function GlobalSearch() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [liveLayers, setLiveLayers] = useState<BackendLayer[]>([]);
  const [liveDatasets, setLiveDatasets] = useState<Dataset[]>([]);
  const [liveProjects, setLiveProjects] = useState<Project[]>([]);
  const [hasLoadedData, setHasLoadedData] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut listener (Cmd/Ctrl + K or /)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "/" && !isOpen && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        setIsOpen(true);
      } else if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      if (!hasLoadedData) {
        loadData();
      }
    } else {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen, hasLoadedData]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [layersRes, datasetsRes, projectsRes] = await Promise.allSettled([
        getLayers(),
        getDatasets(),
        getProjects(),
      ]);

      if (layersRes.status === "fulfilled" && Array.isArray(layersRes.value)) {
        setLiveLayers(layersRes.value);
      }
      if (datasetsRes.status === "fulfilled" && Array.isArray(datasetsRes.value)) {
        setLiveDatasets(datasetsRes.value);
      }
      if (projectsRes.status === "fulfilled" && Array.isArray(projectsRes.value)) {
        setLiveProjects(projectsRes.value);
      }
      setHasLoadedData(true);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  // Filter results
  const q = query.trim().toLowerCase();

  const matchingNav = q
    ? STATIC_ROUTES.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          (r.subtitle && r.subtitle.toLowerCase().includes(q))
      )
    : STATIC_ROUTES.slice(0, 5);

  const matchingLayers: SearchResultItem[] = q
    ? liveLayers
        .filter((l) => l.name.toLowerCase().includes(q) || l.geometry_type?.toLowerCase().includes(q))
        .slice(0, 4)
        .map((l) => ({
          id: `layer-${l.id}`,
          title: l.name,
          subtitle: `${l.geometry_type || "Geometry"} · ${l.feature_count || 0} features · CRS ${l.crs || "EPSG:4326"}`,
          category: "Layers",
          href: `/map?layer=${l.id}`,
          icon: <Layers size={16} className="text-indigo-500" />,
          badge: l.geometry_type || "Layer",
        }))
    : [];

  const matchingDatasets: SearchResultItem[] = q
    ? liveDatasets
        .filter((d) => d.name.toLowerCase().includes(q) || d.file_type?.toLowerCase().includes(q))
        .slice(0, 3)
        .map((d) => ({
          id: `dataset-${d.id}`,
          title: d.name,
          subtitle: `${d.file_type?.toUpperCase() || "FILE"} · ${d.feature_count || 0} items · ${d.crs || "WGS84"}`,
          category: "Datasets",
          href: "/datasets",
          icon: <Database size={16} className="text-teal-500" />,
          badge: d.file_type || "Data",
        }))
    : [];

  const matchingProjects: SearchResultItem[] = q
    ? liveProjects
        .filter((p) => p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)))
        .slice(0, 3)
        .map((p) => ({
          id: `proj-${p.id}`,
          title: p.name,
          subtitle: p.description || `Project ID #${p.id} · Status: ${p.status}`,
          category: "Projects",
          href: "/projects",
          icon: <FolderKanban size={16} className="text-blue-500" />,
          badge: p.status || "Active",
        }))
    : [];

  const allResults: SearchResultItem[] = [
    ...matchingNav,
    ...matchingLayers,
    ...matchingDatasets,
    ...matchingProjects,
  ];

  // Keyboard navigation
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (allResults.length || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + (allResults.length || 1)) % (allResults.length || 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const current = allResults[selectedIndex];
      if (current) {
        handleSelect(current.href);
      }
    }
  };

  const handleSelect = (href: string) => {
    setIsOpen(false);
    router.push(href);
  };

  return (
    <>
      {/* Trigger button in Topbar */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="group relative flex h-9 w-72 lg:w-96 items-center justify-between rounded-xl border border-border/60 bg-muted/40 px-3 text-xs text-muted-foreground shadow-sm transition-all hover:border-primary/50 hover:bg-muted/70 hover:text-foreground cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Search size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
          <span className="truncate">Search layers, datasets, modules…</span>
        </div>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground font-semibold shadow-xs">
          <span>⌘</span>
          <span>K</span>
        </kbd>
      </button>

      {/* Command Dialog Overlay via Portal to sit above all Leaflet map layers */}
      {mounted &&
        isOpen &&
        createPortal(
          <div className="fixed inset-0 z-[99999] flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 pt-16 sm:pt-24 animate-in fade-in duration-150">
            <div
              ref={containerRef}
              className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border/80 bg-card shadow-2xl animate-in zoom-in-95 duration-150 flex flex-col max-h-[80vh]"
            >
              {/* Search Input Bar */}
              <div className="flex items-center border-b border-border/70 px-4 py-3.5 gap-3 bg-muted/20">
                <Search size={18} className="text-primary shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedIndex(0);
                  }}
                  onKeyDown={handleInputKeyDown}
                  placeholder="Type a spatial layer name, dataset, or GIS command…"
                  className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none font-medium"
                />
                {loading && <Loader2 size={16} className="animate-spin text-muted-foreground shrink-0" />}
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                )}
                <kbd className="hidden sm:inline-flex items-center rounded border border-border bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                  ESC
                </kbd>
              </div>

              {/* Results Container */}
              <div className="flex-1 overflow-y-auto p-2 divide-y divide-border/30">
                {allResults.length === 0 ? (
                  <div className="py-12 text-center text-xs text-muted-foreground">
                    <Sparkles size={28} className="mx-auto mb-2 text-muted-foreground/50" />
                    <p className="font-semibold text-foreground">No matching GIS entities found</p>
                    <p className="mt-1">Try searching for &quot;forest&quot;, &quot;roads&quot;, &quot;buffer&quot;, or &quot;dashboard&quot;</p>
                  </div>
                ) : (
                  <div className="space-y-1 p-1">
                    {allResults.map((item, idx) => {
                      const isSelected = idx === selectedIndex;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelect(item.href)}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-left transition-all cursor-pointer ${
                            isSelected
                              ? "bg-primary/10 text-foreground border border-primary/30 shadow-xs"
                              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
                              isSelected ? "border-primary/40 bg-background shadow-xs" : "border-border/60 bg-muted/30"
                            }`}>
                              {item.icon}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-semibold truncate ${isSelected ? "text-foreground" : "text-foreground/90"}`}>
                                  {item.title}
                                </span>
                                {item.badge && (
                                  <Badge variant="outline" className="text-[9px] py-0 px-1.5 font-medium border-border/80">
                                    {item.badge}
                                  </Badge>
                                )}
                              </div>
                              {item.subtitle && (
                                <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                                  {item.subtitle}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 ml-3">
                            <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">
                              {item.category}
                            </span>
                            <ArrowRight
                              size={14}
                              className={`transition-transform duration-200 ${
                                isSelected ? "text-primary translate-x-0.5" : "text-muted-foreground/40 opacity-0"
                              }`}
                            />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between border-t border-border/60 bg-muted/30 px-4 py-2 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-border bg-background px-1 text-[10px]">↑</kbd>
                    <kbd className="rounded border border-border bg-background px-1 text-[10px]">↓</kbd>
                    Navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-border bg-background px-1 text-[10px]">↵</kbd>
                    Select
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-border bg-background px-1 text-[10px]">ESC</kbd>
                    Close
                  </span>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground/80">
                  HP State Spatial SDI
                </span>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
