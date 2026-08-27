"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  Search,
  LogOut,
  Settings,
  Shield,
  Crown,
  TreePine,
  Microscope,
  ChevronDown,
  LogIn,
  FolderKanban,
  Database,
  Layers,
  Box,
  X,
  Loader2,
} from "lucide-react";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/api/client";

interface SearchResult {
  id: number;
  name: string;
  type: "project" | "dataset" | "layer" | "asset";
  subtitle?: string;
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  project: <FolderKanban size={13} className="text-primary" />,
  dataset: <Database size={13} className="text-emerald-500" />,
  layer: <Layers size={13} className="text-sky-500" />,
  asset: <Box size={13} className="text-amber-500" />,
};

const TYPE_HREF: Record<string, string> = {
  project: "/projects",
  dataset: "/datasets",
  layer: "/layers",
  asset: "/assets",
};

async function globalSearch(q: string): Promise<SearchResult[]> {
  try {
    const [projects, datasets, layers] = await Promise.allSettled([
      api<{ id: number; name: string; description?: string }[]>(`/projects?search=${encodeURIComponent(q)}&limit=3`),
      api<{ id: number; name: string; file_type?: string }[]>(`/datasets?search=${encodeURIComponent(q)}&limit=3`),
      api<{ id: number; name: string; geometry_type?: string }[]>(`/layers?search=${encodeURIComponent(q)}&limit=3`),
    ]);

    const results: SearchResult[] = [];

    if (projects.status === "fulfilled") {
      projects.value?.slice(0, 3).forEach((p) =>
        results.push({ id: p.id, name: p.name, type: "project", subtitle: p.description || "Project" })
      );
    }
    if (datasets.status === "fulfilled") {
      datasets.value?.slice(0, 3).forEach((d) =>
        results.push({ id: d.id, name: d.name, type: "dataset", subtitle: d.file_type || "Dataset" })
      );
    }
    if (layers.status === "fulfilled") {
      layers.value?.slice(0, 3).forEach((l) =>
        results.push({ id: l.id, name: l.name, type: "layer", subtitle: l.geometry_type || "Layer" })
      );
    }

    return results;
  } catch {
    return [];
  }
}

export default function Topbar() {
  const router = useRouter();
  const { user, isAuthenticated, logout, initAuth, loginAsRole } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    if (!value.trim()) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }

    setSearchLoading(true);
    setSearchOpen(true);

    searchDebounceRef.current = setTimeout(async () => {
      const results = await globalSearch(value.trim());
      setSearchResults(results);
      setSearchLoading(false);
    }, 350);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    router.push("/login");
  };

  const handleQuickSwitch = async (role: "admin" | "analyst" | "officer") => {
    setDropdownOpen(false);
    await loginAsRole(role);
    window.location.reload();
  };

  const displayName = user?.full_name || user?.username || "Guest User";
  const roleName = user?.role?.name || "Official";
  const departmentName = user?.department?.name || "HP State Govt";

  const initials = displayName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "GU";

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card/80 backdrop-blur-md px-8 sticky top-0 z-30 transition-all">
      {/* Global Search */}
      <div className="relative w-80 lg:w-96" ref={searchRef}>
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search projects, datasets, layers…"
          className="pl-9 pr-8 h-9 text-xs bg-muted/30 border-border/60 focus:bg-background transition-all"
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          onFocus={() => searchQuery.trim() && setSearchOpen(true)}
          autoComplete="off"
        />
        {searchLoading && (
          <Loader2 size={13} className="absolute right-3 top-2.5 text-muted-foreground animate-spin" />
        )}
        {searchQuery && !searchLoading && (
          <button
            type="button"
            onClick={() => { setSearchQuery(""); setSearchResults([]); setSearchOpen(false); }}
            className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X size={13} />
          </button>
        )}

        {/* Search Dropdown */}
        {searchOpen && (
          <div className="absolute top-11 left-0 right-0 rounded-2xl border border-border/70 bg-card/95 backdrop-blur-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            {searchLoading ? (
              <div className="flex items-center gap-2 px-4 py-3 text-xs text-muted-foreground">
                <Loader2 size={13} className="animate-spin" />
                <span>Searching spatial database…</span>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="px-4 py-3 text-xs text-muted-foreground">
                No results found for <span className="font-semibold text-foreground">"{searchQuery}"</span>
              </div>
            ) : (
              <div className="py-1.5">
                {searchResults.map((r) => (
                  <Link
                    key={`${r.type}-${r.id}`}
                    href={`${TYPE_HREF[r.type]}?highlight=${r.id}`}
                    onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/70 transition-colors cursor-pointer group"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-muted group-hover:bg-background transition-colors">
                      {TYPE_ICON[r.type]}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{r.name}</p>
                      <p className="text-[10px] text-muted-foreground capitalize">{r.type} · {r.subtitle}</p>
                    </div>
                  </Link>
                ))}
                <div className="border-t border-border/50 mx-3 mt-1 pt-1.5 pb-1">
                  <p className="text-[10px] text-muted-foreground px-1">
                    {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} found
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right User & Notifications */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground transition-all cursor-pointer"
          title="Notifications"
        >
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
        </button>

        {/* User Profile / Dropdown Menu */}
        {isAuthenticated && user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex items-center gap-2.5 pl-2 border-l border-border/60 cursor-pointer group select-none text-left"
            >
              <Avatar className="h-8 w-8 ring-2 ring-primary/20 ring-offset-2 ring-offset-background transition-transform group-hover:scale-105">
                <AvatarFallback className="bg-gradient-to-tr from-primary to-emerald-500 text-white font-bold text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="hidden md:block">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-semibold leading-none text-foreground">{displayName}</p>
                  <ChevronDown size={12} className="text-muted-foreground" />
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">{roleName} · {departmentName}</p>
              </div>
            </button>

            {/* Dropdown Menu Modal */}
            {dropdownOpen && (
              <div className="absolute right-0 top-11 w-64 rounded-2xl border border-border/70 bg-card/95 backdrop-blur-xl p-2.5 shadow-xl space-y-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                {/* User Header */}
                <div className="p-2 border-b border-border/50 space-y-1">
                  <p className="text-xs font-bold text-foreground">{displayName}</p>
                  <p className="text-[11px] text-muted-foreground font-mono truncate">{user.email}</p>
                  <div className="pt-1 flex items-center gap-1.5">
                    <Badge className="text-[9px] bg-primary/10 text-primary border-primary/20 font-bold px-1.5 py-0">
                      {roleName}
                    </Badge>
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 font-medium">
                      {departmentName}
                    </Badge>
                  </div>
                </div>

                {/* Quick Role Switchers */}
                <div className="space-y-1">
                  <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Switch Active Persona
                  </p>

                  <button
                    type="button"
                    onClick={() => handleQuickSwitch("admin")}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-muted/70 transition-colors text-left cursor-pointer"
                  >
                    <Crown size={13} className="text-amber-500" />
                    <span>State SuperAdmin</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickSwitch("analyst")}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-muted/70 transition-colors text-left cursor-pointer"
                  >
                    <Microscope size={13} className="text-sky-500" />
                    <span>GIS Spatial Analyst</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickSwitch("officer")}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-muted/70 transition-colors text-left cursor-pointer"
                  >
                    <TreePine size={13} className="text-emerald-500" />
                    <span>Forest Dept Officer</span>
                  </button>
                </div>

                {/* Navigation Links */}
                <div className="pt-1 border-t border-border/50 space-y-1">
                  <Link
                    href="/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-muted/70 text-foreground transition-colors"
                  >
                    <Settings size={13} className="text-muted-foreground" />
                    <span>Account Settings</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-destructive hover:bg-destructive/10 transition-colors text-left cursor-pointer"
                  >
                    <LogOut size={13} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition-opacity"
          >
            <LogIn size={13} />
            <span>Sign In</span>
          </Link>
        )}
      </div>
    </header>
  );
}