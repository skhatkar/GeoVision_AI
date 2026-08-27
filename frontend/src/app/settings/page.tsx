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
  Brain,
  Zap,
  Sliders,
  RotateCcw,
  Sparkles,
  Map as MapIcon,
  ShieldCheck,
  Cpu,
  Eye,
  EyeOff,
  Lock,
  AlertCircle,
  Save,
} from "lucide-react";
import { useTheme } from "next-themes";
import { API_BASE_URL, api } from "@/api/client";
import { useAuthStore } from "@/store/authStore";
import { toast } from "@/components/ui/toast";

// ─── Theme Option Card ────────────────────────────────────────────────────────
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

// ─── Tech Stack ───────────────────────────────────────────────────────────────
const TECH_STACK = [
  { label: "Frontend", items: ["Next.js 15", "React 19", "TypeScript", "Tailwind CSS v4"] },
  { label: "Mapping & GIS", items: ["Leaflet + React-Leaflet", "Turf.js", "Leaflet-Geoman", "WGS 84 (EPSG:4326)"] },
  { label: "Backend Core", items: ["FastAPI", "SQLAlchemy 2", "GeoAlchemy2", "PostGIS 3.4"] },
  { label: "Data Pipeline", items: ["GeoPandas", "Shapely", "PyProj", "GDAL / OGR"] },
  { label: "State Management", items: ["Zustand Store", "React Hooks"] },
  { label: "Security & Auth", items: ["JWT Bearer (python-jose)", "bcrypt", "Role-Based Access"] },
];

// ─── Password Strength ────────────────────────────────────────────────────────
function getPasswordStrength(pwd: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  if (score <= 1) return { score, label: "Weak", color: "bg-destructive" };
  if (score <= 2) return { score, label: "Fair", color: "bg-amber-500" };
  if (score <= 3) return { score, label: "Good", color: "bg-yellow-400" };
  if (score <= 4) return { score, label: "Strong", color: "bg-emerald-400" };
  return { score, label: "Very Strong", color: "bg-emerald-500" };
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user, setUser } = useAuthStore();

  // Profile state — initialised from real auth user
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

  // Map preferences (localStorage)
  const [defaultBasemap, setDefaultBasemap] = useState("osm");
  const [units, setUnits] = useState("metric");
  const [savedMapPrefs, setSavedMapPrefs] = useState(false);

  // Password change
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);

  // API diagnostics
  const [apiStatus, setApiStatus] = useState<"idle" | "testing" | "ok" | "error">("idle");
  const [apiMsg, setApiMsg] = useState("");

  // Seed form from real user on mount
  useEffect(() => {
    if (user) {
      setFullName(user.full_name ?? "");
      setEmail(user.email ?? "");
    }
    if (typeof window !== "undefined") {
      const savedMap = localStorage.getItem("gv_default_basemap");
      const savedU = localStorage.getItem("gv_units");
      if (savedMap) setDefaultBasemap(savedMap);
      if (savedU) setUnits(savedU);
    }
  }, [user]);

  // ── Profile Save ────────────────────────────────────────────────────────────
  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      toast({ type: "error", title: "Validation Error", description: "Name and email are required." });
      return;
    }
    setProfileLoading(true);
    try {
      const updated = await api<typeof user>("/auth/me", {
        method: "PATCH",
        body: JSON.stringify({ full_name: fullName.trim(), email: email.trim() }),
      });
      if (updated && setUser) {
        setUser(updated as Parameters<typeof setUser>[0]);
        localStorage.setItem("auth_user", JSON.stringify(updated));
      }
      toast({ type: "success", title: "Profile Updated", description: "Your display name and email have been saved." });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update profile";
      toast({ type: "error", title: "Update Failed", description: msg });
    } finally {
      setProfileLoading(false);
    }
  }

  // ── Password Change ─────────────────────────────────────────────────────────
  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwdError(null);

    if (!currentPwd || !newPwd || !confirmPwd) {
      setPwdError("All password fields are required.");
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdError("New passwords do not match.");
      return;
    }
    if (newPwd.length < 8) {
      setPwdError("New password must be at least 8 characters.");
      return;
    }

    setPwdLoading(true);
    try {
      await api("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ current_password: currentPwd, new_password: newPwd }),
      });
      toast({ type: "success", title: "Password Changed", description: "Your password has been updated successfully." });
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to change password";
      setPwdError(msg.replace("API Error: 400 Bad Request — ", "").replace(/^"|"$/g, ""));
    } finally {
      setPwdLoading(false);
    }
  }

  // ── Map Prefs Save ──────────────────────────────────────────────────────────
  function handleSaveMapPrefs() {
    if (typeof window !== "undefined") {
      localStorage.setItem("gv_default_basemap", defaultBasemap);
      localStorage.setItem("gv_units", units);
    }
    setSavedMapPrefs(true);
    toast({ type: "success", title: "Map Preferences Saved" });
    setTimeout(() => setSavedMapPrefs(false), 2500);
  }

  // ── API Test ────────────────────────────────────────────────────────────────
  async function testConnection() {
    setApiStatus("testing");
    setApiMsg("");
    const start = performance.now();
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      const elapsed = Math.round(performance.now() - start);
      if (res.ok) {
        const json = await res.json();
        setApiStatus("ok");
        setApiMsg(`${json?.service || "GeoVision AI Core"} · ${json?.status || "Online"} (${elapsed}ms)`);
      } else {
        setApiStatus("error");
        setApiMsg(`HTTP ${res.status} — ${res.statusText}`);
      }
    } catch (err) {
      setApiStatus("error");
      setApiMsg(err instanceof Error ? err.message : "Connection failed");
    }
  }

  // ── Cache Clear ─────────────────────────────────────────────────────────────
  function handleClearCache() {
    if (typeof window !== "undefined") {
      if (confirm("Reset local cache and purge temporary stored session tokens?")) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("auth_user");
        localStorage.removeItem("gv_default_basemap");
        localStorage.removeItem("gv_units");
        toast({ type: "info", title: "Cache Cleared", description: "Local preferences and tokens removed." });
      }
    }
  }

  const displayName = user?.full_name || user?.username || "Official";
  const roleName = user?.role?.name || "Official";
  const departmentName = user?.department?.name || "HP State Govt";

  const initials = displayName
    .split(" ")
    .slice(0, 2)
    .map((w: string) => w[0])
    .join("")
    .toUpperCase() || "SK";

  const pwdStrength = getPasswordStrength(newPwd);

  return (
    <AppShell>
      <PageHeader
        title="Settings & System Preferences"
        subtitle="Manage your profile, GIS display parameters, and backend services"
      />

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="w-full sm:w-auto p-1 bg-muted/50 rounded-xl border border-border/70">
          <TabsTrigger value="profile" className="gap-1.5 text-xs font-semibold cursor-pointer">
            <User size={13} /> Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5 text-xs font-semibold cursor-pointer">
            <Lock size={13} /> Security
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
              <CardTitle className="text-base font-bold">Your Profile</CardTitle>
              <CardDescription className="text-xs">
                Update your display name and official email. Changes are saved to the backend.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-5">
                {/* Avatar */}
                <div className="flex items-center gap-4 p-4 rounded-2xl border border-border/50 bg-muted/20">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-emerald-500 text-xl font-bold font-mono text-white shadow-md shadow-primary/20">
                    {initials}
                  </div>
                  <div>
                    <p className="font-bold text-base text-foreground">{displayName}</p>
                    <p className="text-xs text-muted-foreground">{departmentName}</p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-bold">
                        Verified Official
                      </Badge>
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {roleName}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid gap-4 max-w-xl sm:grid-cols-2">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-foreground">Full Name</label>
                    <Input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Sunaina Khatkar"
                      className="text-xs bg-muted/30 border-border/70 h-9"
                      required
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-foreground">Official Email</label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@hp.gov.in"
                      className="text-xs bg-muted/30 border-border/70 h-9 font-mono"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Department</label>
                    <Input
                      value={departmentName}
                      disabled
                      className="text-xs bg-muted/20 border-border/70 h-9 text-muted-foreground"
                    />
                    <p className="text-[10px] text-muted-foreground">Contact admin to change department.</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Role</label>
                    <Input
                      value={roleName}
                      disabled
                      className="text-xs bg-muted/20 border-border/70 h-9 text-muted-foreground"
                    />
                    <p className="text-[10px] text-muted-foreground">Assigned by administrator.</p>
                  </div>
                </div>

                <Button type="submit" disabled={profileLoading} className="gap-2 text-xs font-semibold cursor-pointer">
                  {profileLoading ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Save size={13} />
                      Save Profile
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── 2. Security / Password Change ── */}
        <TabsContent value="security" className="space-y-6">
          <Card className="rounded-2xl border-border/70 bg-card/80 backdrop-blur-md shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <ShieldCheck size={16} className="text-primary" />
                Change Password
              </CardTitle>
              <CardDescription className="text-xs">
                Update your account password. Use a strong combination of letters, numbers, and symbols.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                {/* Current Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Current Password</label>
                  <div className="relative">
                    <Input
                      type={showCurrentPwd ? "text" : "password"}
                      value={currentPwd}
                      onChange={(e) => setCurrentPwd(e.target.value)}
                      placeholder="••••••••"
                      className="text-xs pr-10 font-mono bg-muted/30 border-border/70 h-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      {showCurrentPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">New Password</label>
                  <div className="relative">
                    <Input
                      type={showNewPwd ? "text" : "password"}
                      value={newPwd}
                      onChange={(e) => setNewPwd(e.target.value)}
                      placeholder="••••••••"
                      className="text-xs pr-10 font-mono bg-muted/30 border-border/70 h-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPwd(!showNewPwd)}
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      {showNewPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>

                  {/* Password Strength Bar */}
                  {newPwd && (
                    <div className="space-y-1">
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={i}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                              i < pwdStrength.score ? pwdStrength.color : "bg-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <p className={`text-[10px] font-semibold ${
                        pwdStrength.score <= 1 ? "text-destructive" :
                        pwdStrength.score <= 2 ? "text-amber-500" :
                        pwdStrength.score <= 3 ? "text-yellow-500" :
                        "text-emerald-500"
                      }`}>
                        {pwdStrength.label}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm New Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Confirm New Password</label>
                  <Input
                    type="password"
                    value={confirmPwd}
                    onChange={(e) => setConfirmPwd(e.target.value)}
                    placeholder="••••••••"
                    className={`text-xs font-mono bg-muted/30 border-border/70 h-9 ${
                      confirmPwd && confirmPwd !== newPwd ? "border-destructive/60" : ""
                    }`}
                  />
                  {confirmPwd && confirmPwd !== newPwd && (
                    <p className="text-[10px] text-destructive flex items-center gap-1">
                      <AlertCircle size={11} /> Passwords do not match
                    </p>
                  )}
                </div>

                {/* Error */}
                {pwdError && (
                  <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                    <AlertCircle size={13} className="mt-0.5 shrink-0" />
                    <span>{pwdError}</span>
                  </div>
                )}

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={pwdLoading || (!!confirmPwd && confirmPwd !== newPwd)}
                  className="gap-2 text-xs font-semibold cursor-pointer"
                >
                  {pwdLoading ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      Updating…
                    </>
                  ) : (
                    <>
                      <Lock size={13} />
                      Update Password
                    </>
                  )}
                </Button>
              </form>

              {/* Security Tips */}
              <div className="mt-6 rounded-xl border border-border/50 bg-muted/20 p-4 max-w-md space-y-2">
                <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-primary" />
                  Security Tips
                </p>
                <ul className="space-y-1 text-[11px] text-muted-foreground list-disc list-inside">
                  <li>Use at least 12 characters with uppercase, numbers and symbols</li>
                  <li>Never share your password with colleagues</li>
                  <li>Change your password every 90 days</li>
                  <li>Do not reuse passwords from other services</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── 3. GIS & Map Preferences ── */}
        <TabsContent value="gis" className="space-y-6">
          <Card className="rounded-2xl border-border/70 bg-card/80 backdrop-blur-md shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">GIS & Map Parameters</CardTitle>
              <CardDescription className="text-xs">
                Configure default basemap, measurement units, and coordinate references.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-5 max-w-xl sm:grid-cols-2">
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

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-foreground">Coordinate Reference System</label>
                  <Input
                    value="EPSG:4326 — WGS 84 (Geographic Lat/Long)"
                    disabled
                    className="text-xs bg-muted/20 border-border/70 font-mono text-muted-foreground"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Native CRS for HP Spatial Data Infrastructure.
                  </p>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-foreground">Default Map Center</label>
                  <Input
                    value="Lat: 31.1048° N, Lon: 77.1734° E (Shimla, HP)"
                    disabled
                    className="text-xs bg-muted/20 border-border/70 font-mono text-muted-foreground"
                  />
                </div>
              </div>

              <Button
                onClick={handleSaveMapPrefs}
                className="gap-2 text-xs font-semibold cursor-pointer"
              >
                {savedMapPrefs ? (
                  <>
                    <CheckCircle2 size={13} className="text-emerald-400" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Sliders size={13} />
                    Save Map Preferences
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── 4. Appearance ── */}
        <TabsContent value="appearance" className="space-y-6">
          <Card className="rounded-2xl border-border/70 bg-card/80 backdrop-blur-md shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Theme & UI Appearance</CardTitle>
              <CardDescription className="text-xs">
                Select your preferred color mode. Changes apply instantly across the platform.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4 max-w-md">
                <ThemeOption value="light" current={theme} icon={<Sun size={19} />} label="Light Mode" onClick={() => setTheme("light")} />
                <ThemeOption value="dark" current={theme} icon={<Moon size={19} />} label="Dark Mode" onClick={() => setTheme("dark")} />
                <ThemeOption value="system" current={theme} icon={<Monitor size={19} />} label="System Sync" onClick={() => setTheme("system")} />
              </div>

              <div className="rounded-xl border border-border/50 bg-muted/20 p-4 text-xs text-muted-foreground max-w-md space-y-1.5">
                <p className="font-semibold text-foreground flex items-center gap-1.5">
                  <Sparkles size={13} className="text-primary" />
                  OKLCH Glassmorphism Theme
                </p>
                <p className="leading-relaxed">
                  Perceptually uniform color tokens tailored for high-contrast GIS satellite visibility and map reading.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── 5. API & Backend Engine ── */}
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
                      Probing Server…
                    </>
                  ) : (
                    <>
                      <Zap size={13} className="text-amber-500" />
                      Test Server Connection
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

              {/* Endpoint Map */}
              <div className="rounded-xl border border-border/50 bg-muted/20 p-4 max-w-lg space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active REST Endpoints</p>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {[
                    { path: "/projects", desc: "Project organization" },
                    { path: "/datasets", desc: "Dataset ingestion & SHP parser" },
                    { path: "/layers", desc: "GIS layer catalogue" },
                    { path: "/assets", desc: "Vector features & geometry" },
                    { path: "/analysis", desc: "PostGIS spatial algorithms" },
                    { path: "/analytics", desc: "Data telemetry graphs" },
                    { path: "/ai", desc: "Autonomous AI quality audit" },
                    { path: "/auth/me", desc: "User session identity" },
                    { path: "/health", desc: "Engine heartbeat & status" },
                  ].map(({ path, desc }) => (
                    <div key={path} className="flex items-center justify-between text-[11px] font-mono">
                      <span className="bg-muted px-1.5 py-0.5 rounded text-foreground font-medium">{path}</span>
                      <span className="text-muted-foreground font-sans">{desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cache Purge */}
              <div className="pt-2 border-t flex items-center justify-between max-w-lg">
                <div>
                  <p className="text-xs font-semibold text-foreground">Purge Local Session & Cache</p>
                  <p className="text-[11px] text-muted-foreground">Clears tokens and local preferences</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearCache}
                  className="gap-1.5 text-xs text-destructive hover:bg-destructive/10 cursor-pointer border-destructive/30"
                >
                  <RotateCcw size={12} />
                  Reset Cache
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── 6. About ── */}
        <TabsContent value="about" className="space-y-6">
          <Card className="rounded-2xl border-border/70 bg-card/80 backdrop-blur-md shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">About GeoVision AI</CardTitle>
              <CardDescription className="text-xs">Government of Himachal Pradesh Spatial Data Platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-600 via-primary to-emerald-500 text-white shadow-md shadow-primary/20">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">GeoVision AI Platform</h3>
                  <p className="text-xs text-muted-foreground">Version 1.0.0 (Production Release)</p>
                  <div className="mt-1.5 flex gap-1.5">
                    <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20 font-bold">HP State SDI</Badge>
                    <Badge className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-bold">PostGIS Enabled</Badge>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
                GeoVision AI is a state-of-the-art spatial intelligence command center designed for the
                Department of Digital Technologies and Governance, Government of Himachal Pradesh.
              </p>

              <div>
                <p className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                  <Cpu size={13} className="text-primary" />
                  Platform Architecture
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
                <span>© 2026 GeoVision AI · Department of Information Technology, Government of Himachal Pradesh</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
