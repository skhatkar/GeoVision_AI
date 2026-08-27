"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  User,
  Palette,
  Key,
  Info,
  Moon,
  Sun,
  Monitor,
  CheckCircle2,
  XCircle,
  Loader2,
  Globe,
  MapPin,
  Layers,
  Database,
  Brain,
  Zap,
  Sliders,
  RotateCcw,
  Sparkles,
  Map as MapIcon,
  ShieldCheck,
  Cpu,
} from "lucide-react";
import { useTheme } from "next-themes";
import { API_BASE_URL } from "@/api/client";

// Theme option card
function ThemeOption({
  value,
  current,
  icon,
  label,
  onClick,
}: {
  value: string;
  current: string | undefined;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  const active = current === value;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex flex-col items-center gap-2.5 rounded-2xl border p-5 transition-all cursor-pointer hover:-translate-y-1 shadow-xs
        ${
          active
            ? "border-primary bg-primary/10 shadow-md ring-2 ring-primary/30"
            : "border-border/70 bg-card hover:border-primary/40 hover:bg-card/90"
        }
      `}
    >
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl transition-all ${
          active ? "bg-primary text-primary-foreground shadow-sm scale-105" : "bg-muted text-muted-foreground"
        }`}
      >
        {icon}
      </div>
      <span className={`text-xs font-semibold ${active ? "text-primary" : "text-foreground"}`}>
        {label}
      </span>
      {active && (
        <Badge className="text-[10px] bg-primary/15 text-primary border-primary/20 font-bold px-2 py-0">
          Active
        </Badge>
      )}
    </button>
  );
}

const TECH_STACK = [
  { label: "Frontend", items: ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS v4"] },
  { label: "Mapping & GIS", items: ["Leaflet + React-Leaflet", "Turf.js", "Leaflet-Geoman", "WGS 84 (EPSG:4326)"] },
  { label: "Backend Core", items: ["FastAPI", "SQLAlchemy 2", "GeoAlchemy2", "PostGIS 3.4"] },
  { label: "Data Pipeline", items: ["GeoPandas", "Shapely", "PyProj", "GDAL / OGR"] },
  { label: "State Management", items: ["Zustand Store", "TanStack React Query"] },
  { label: "Security & Auth", items: ["JWT Bearer (python-jose)", "bcrypt", "Role-Based Access"] },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  // Profile state with localStorage persistence
  const [displayName, setDisplayName] = useState("Sunaina Khatkar");
  const [department, setDepartment] = useState("Information Technology");
  const [organization, setOrganization] = useState("Government of Himachal Pradesh");
  const [email, setEmail] = useState("admin@hp.gov.in");
  const [savedProfile, setSavedProfile] = useState(false);

  // Map preferences
  const [defaultBasemap, setDefaultBasemap] = useState("osm");
  const [units, setUnits] = useState("metric");
  const [savedMapPrefs, setSavedMapPrefs] = useState(false);

  // API connectivity test state
  const [apiStatus, setApiStatus] = useState<"idle" | "testing" | "ok" | "error">("idle");
  const [apiMsg, setApiMsg] = useState("");
  const [responseTime, setResponseTime] = useState<number | null>(null);

  // Load profile from localStorage on client
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedName = localStorage.getItem("gv_display_name");
      const savedDept = localStorage.getItem("gv_department");
      const savedOrg = localStorage.getItem("gv_organization");
      const savedMap = localStorage.getItem("gv_default_basemap");
      const savedU = localStorage.getItem("gv_units");

      if (savedName) setDisplayName(savedName);
      if (savedDept) setDepartment(savedDept);
      if (savedOrg) setOrganization(savedOrg);
      if (savedMap) setDefaultBasemap(savedMap);
      if (savedU) setUnits(savedU);
    }
  }, []);

  async function testConnection() {
    setApiStatus("testing");
    setApiMsg("");
    setResponseTime(null);
    const start = performance.now();

    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      const elapsed = Math.round(performance.now() - start);
      setResponseTime(elapsed);

      if (res.ok) {
        const json = await res.json();
        setApiStatus("ok");
        setApiMsg(`${json?.service || "GeoVision AI Core"} — Status: ${json?.status || "Online"} (${elapsed}ms)`);
      } else {
        // Fallback probe to root
        const rootRes = await fetch(`${API_BASE_URL}/`);
        if (rootRes.ok) {
          setApiStatus("ok");
          setApiMsg(`Backend API connected successfully (${elapsed}ms)`);
        } else {
          setApiStatus("error");
          setApiMsg(`HTTP ${res.status} — ${res.statusText}`);
        }
      }
    } catch (err) {
      setApiStatus("error");
      setApiMsg(err instanceof Error ? err.message : "Connection failed");
    }
  }

  function handleSaveProfile() {
    if (typeof window !== "undefined") {
      localStorage.setItem("gv_display_name", displayName);
      localStorage.setItem("gv_department", department);
      localStorage.setItem("gv_organization", organization);
    }
    setSavedProfile(true);
    setTimeout(() => setSavedProfile(false), 2500);
  }

  function handleSaveMapPrefs() {
    if (typeof window !== "undefined") {
      localStorage.setItem("gv_default_basemap", defaultBasemap);
      localStorage.setItem("gv_units", units);
    }
    setSavedMapPrefs(true);
    setTimeout(() => setSavedMapPrefs(false), 2500);
  }

  function handleClearCache() {
    if (typeof window !== "undefined") {
      if (confirm("Reset local cache and purge temporary stored session tokens?")) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        alert("Cache cleared successfully.");
      }
    }
  }

  const initials = displayName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "SK";

  return (
    <AppShell>
      <PageHeader
        title="Settings & System Preferences"
        subtitle="Manage administrator profile, GIS display parameters, and backend services"
      />

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="w-full sm:w-auto p-1 bg-muted/50 rounded-xl border border-border/70">
          <TabsTrigger value="profile" className="gap-1.5 text-xs font-semibold cursor-pointer">
            <User size={13} /> Profile
          </TabsTrigger>
          <TabsTrigger value="gis" className="gap-1.5 text-xs font-semibold cursor-pointer">
            <MapIcon size={13} /> GIS & Map
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-1.5 text-xs font-semibold cursor-pointer">
            <Palette size={13} /> Appearance
          </TabsTrigger>
          <TabsTrigger value="api" className="gap-1.5 text-xs font-semibold cursor-pointer">
            <Key size={13} /> API & Engine
          </TabsTrigger>
          <TabsTrigger value="about" className="gap-1.5 text-xs font-semibold cursor-pointer">
            <Info size={13} /> About
          </TabsTrigger>
        </TabsList>

        {/* ── 1. Profile ── */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="rounded-2xl border-border/70 bg-card/80 backdrop-blur-md shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Administrator Profile</CardTitle>
              <CardDescription className="text-xs">
                Manage your credentials, departmental assignment, and display identity.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Badge Avatar */}
              <div className="flex items-center gap-4 p-4 rounded-2xl border border-border/50 bg-muted/20">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-emerald-500 text-xl font-bold font-mono text-white shadow-md shadow-primary/20">
                  {initials}
                </div>
                <div>
                  <p className="font-bold text-base text-foreground">{displayName}</p>
                  <p className="text-xs text-muted-foreground">{department} · {organization}</p>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-bold">
                      Verified Official
                    </Badge>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      Admin Role
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Edit Form */}
              <div className="grid gap-4 max-w-xl sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-foreground">Full Display Name</label>
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your full name"
                    className="text-xs bg-muted/30 border-border/70 h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Department</label>
                  <Input
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Information Technology"
                    className="text-xs bg-muted/30 border-border/70 h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">State / Organization</label>
                  <Input
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="Government of Himachal Pradesh"
                    className="text-xs bg-muted/30 border-border/70 h-9"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-foreground">Official Email</label>
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@hp.gov.in"
                    className="text-xs bg-muted/30 border-border/70 h-9 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button onClick={handleSaveProfile} className="gap-2 text-xs font-semibold cursor-pointer">
                  {savedProfile ? (
                    <>
                      <CheckCircle2 size={14} className="text-emerald-400" />
                      <span>Profile Saved!</span>
                    </>
                  ) : (
                    <span>Save Profile Changes</span>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── 2. GIS & Map Preferences ── */}
        <TabsContent value="gis" className="space-y-6">
          <Card className="rounded-2xl border-border/70 bg-card/80 backdrop-blur-md shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">GIS & Map Parameters</CardTitle>
              <CardDescription className="text-xs">
                Configure default spatial coordinate systems, basemap defaults, and measurement units.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-5 max-w-xl sm:grid-cols-2">
                {/* Default Basemap */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Default Basemap</label>
                  <select
                    value={defaultBasemap}
                    onChange={(e) => setDefaultBasemap(e.target.value)}
                    className="w-full rounded-xl border border-border/70 bg-muted/40 px-3 py-2 text-xs text-foreground outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="osm">OpenStreetMap Standard</option>
                    <option value="satellite">ESRI Satellite Hybrid</option>
                    <option value="carto-light">CartoDB Positron (Clean Light)</option>
                    <option value="carto-dark">CartoDB Dark Matter (Night View)</option>
                    <option value="topo">OpenTopoMap (Terrain Contours)</option>
                  </select>
                </div>

                {/* Measurement Units */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Measurement Units</label>
                  <select
                    value={units}
                    onChange={(e) => setUnits(e.target.value)}
                    className="w-full rounded-xl border border-border/70 bg-muted/40 px-3 py-2 text-xs text-foreground outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="metric">Metric (km, ha, meters, km²)</option>
                    <option value="imperial">Imperial (miles, acres, feet)</option>
                  </select>
                </div>

                {/* Spatial Reference System */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-foreground">Default Map Coordinate Reference</label>
                  <Input
                    value="EPSG:4326 — WGS 84 (Geographic Lat/Long)"
                    disabled
                    className="text-xs bg-muted/20 border-border/70 font-mono text-muted-foreground"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Native Coordinate Reference System for Himachal Pradesh Spatial Data Infrastructure.
                  </p>
                </div>

                {/* Map Center Coordinate Preset */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-foreground">Default Geographic Center</label>
                  <Input
                    value="Latitude: 31.1048° N, Longitude: 77.1734° E (Shimla, HP)"
                    disabled
                    className="text-xs bg-muted/20 border-border/70 font-mono text-muted-foreground"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button onClick={handleSaveMapPrefs} className="gap-2 text-xs font-semibold cursor-pointer">
                  {savedMapPrefs ? (
                    <>
                      <CheckCircle2 size={14} className="text-emerald-400" />
                      <span>Preferences Saved!</span>
                    </>
                  ) : (
                    <span>Save GIS Preferences</span>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── 3. Appearance ── */}
        <TabsContent value="appearance" className="space-y-6">
          <Card className="rounded-2xl border-border/70 bg-card/80 backdrop-blur-md shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Theme & UI Appearance</CardTitle>
              <CardDescription className="text-xs">
                Select your preferred color mode and visual theme.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4 max-w-md">
                <ThemeOption
                  value="light"
                  current={theme}
                  icon={<Sun size={19} />}
                  label="Light Mode"
                  onClick={() => setTheme("light")}
                />
                <ThemeOption
                  value="dark"
                  current={theme}
                  icon={<Moon size={19} />}
                  label="Dark Mode"
                  onClick={() => setTheme("dark")}
                />
                <ThemeOption
                  value="system"
                  current={theme}
                  icon={<Monitor size={19} />}
                  label="System Sync"
                  onClick={() => setTheme("system")}
                />
              </div>

              <div className="rounded-xl border border-border/50 bg-muted/20 p-4 text-xs text-muted-foreground max-w-md space-y-1.5">
                <p className="font-semibold text-foreground flex items-center gap-1.5">
                  <Sparkles size={13} className="text-primary" />
                  <span>Modern OKLCH Glassmorphism</span>
                </p>
                <p className="leading-relaxed">
                  Perceptually uniform color tokens tailored for high-contrast GIS satellite visibility and map reading.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── 4. API & Backend Engine ── */}
        <TabsContent value="api" className="space-y-6">
          <Card className="rounded-2xl border-border/70 bg-card/80 backdrop-blur-md shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Backend & Spatial Engine Diagnostics</CardTitle>
              <CardDescription className="text-xs">
                Verify live API connectivity, PostGIS engine status, and REST service health.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-1.5 max-w-lg">
                <label className="text-xs font-semibold text-foreground">Backend Endpoint Base URL</label>
                <Input
                  value={API_BASE_URL}
                  disabled
                  className="bg-muted/30 font-mono text-xs border-border/70"
                />
              </div>

              {/* Probe Button & Live Feedback */}
              <div className="flex items-center gap-3 flex-wrap">
                <Button
                  variant="outline"
                  onClick={testConnection}
                  disabled={apiStatus === "testing"}
                  className="gap-2 text-xs font-semibold cursor-pointer border-border/70 hover:bg-muted"
                >
                  {apiStatus === "testing" ? (
                    <>
                      <Loader2 size={13} className="animate-spin text-primary" />
                      <span>Probing Server…</span>
                    </>
                  ) : (
                    <>
                      <Zap size={13} className="text-amber-500" />
                      <span>Test Server Connection</span>
                    </>
                  )}
                </Button>

                {apiStatus === "ok" && (
                  <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    <span>{apiMsg}</span>
                  </div>
                )}

                {apiStatus === "error" && (
                  <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-3.5 py-1.5 text-xs font-medium text-destructive">
                    <XCircle size={14} className="text-destructive" />
                    <span>{apiMsg}</span>
                  </div>
                )}
              </div>

              {/* Service Dictionary */}
              <div className="rounded-xl border border-border/50 bg-muted/20 p-4 max-w-lg space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Active REST Endpoints
                </p>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {[
                    { path: "/projects", desc: "Project organization" },
                    { path: "/datasets", desc: "Dataset ingestion & SHP parser" },
                    { path: "/layers", desc: "GIS layer catalogue" },
                    { path: "/assets", desc: "Vector features & geometry" },
                    { path: "/analysis", desc: "PostGIS spatial algorithms" },
                    { path: "/analytics", desc: "Data telemetry & telemetry graphs" },
                    { path: "/ai", desc: "Autonomous AI quality audit" },
                    { path: "/health", desc: "Engine heartbeat & status" },
                  ].map(({ path, desc }) => (
                    <div key={path} className="flex items-center justify-between text-[11px] font-mono">
                      <span className="bg-muted px-1.5 py-0.5 rounded text-foreground font-medium">
                        {path}
                      </span>
                      <span className="text-muted-foreground font-sans">{desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Maintenance Tools */}
              <div className="pt-2 border-t flex items-center justify-between max-w-lg">
                <div>
                  <p className="text-xs font-semibold text-foreground">Purge Local Session & Cache</p>
                  <p className="text-[11px] text-muted-foreground">Clears cached tokens and local preferences</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearCache}
                  className="gap-1.5 text-xs text-destructive hover:bg-destructive/10 cursor-pointer border-destructive/30"
                >
                  <RotateCcw size={12} />
                  <span>Reset Cache</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── 5. About ── */}
        <TabsContent value="about" className="space-y-6">
          <Card className="rounded-2xl border-border/70 bg-card/80 backdrop-blur-md shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">About GeoVision AI</CardTitle>
              <CardDescription className="text-xs">
                Government of Himachal Pradesh Spatial Data Platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Brand Banner */}
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-600 via-primary to-emerald-500 text-white shadow-md shadow-primary/20">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">GeoVision AI Platform</h3>
                  <p className="text-xs text-muted-foreground">Version 1.0.0 (Production Release)</p>
                  <div className="mt-1.5 flex gap-1.5">
                    <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20 font-bold">
                      HP State SDI
                    </Badge>
                    <Badge className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-bold">
                      PostGIS Enabled
                    </Badge>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
                GeoVision AI is a state-of-the-art spatial intelligence command center designed for the 
                Department of Digital Technologies and Governance, Government of Himachal Pradesh. It empowers 
                decision makers with autonomous vector analytics, boundary breakdown metrics, and real-time GIS mapping.
              </p>

              {/* Technology Stack Grid */}
              <div>
                <p className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                  <Cpu size={13} className="text-primary" />
                  <span>Platform Architecture</span>
                </p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 max-w-3xl">
                  {TECH_STACK.map(({ label, items }) => (
                    <div key={label} className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1.5">
                      <p className="text-[10px] font-bold text-primary uppercase tracking-wider">{label}</p>
                      {items.map((item) => (
                        <p key={item} className="text-xs font-medium text-foreground">{item}</p>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t text-xs text-muted-foreground">
                <Globe size={13} className="text-primary" />
                <span>
                  © 2026 GeoVision AI · Department of Information Technology, Government of Himachal Pradesh
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
