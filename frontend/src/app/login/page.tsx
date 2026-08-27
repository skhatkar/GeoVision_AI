"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Globe2,
  Eye,
  EyeOff,
  Layers,
  Brain,
  Shield,
  MapPin,
  Lock,
  User,
  UserPlus,
  Zap,
  CheckCircle2,
  Crown,
  TreePine,
  Microscope,
  Loader2,
  AlertCircle,
  ArrowRight,
  Database,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/authStore";
import { register as apiRegister } from "@/api/authApi";

export default function LoginPage() {
  const router = useRouter();
  const { user, login, loginAsRole, isAuthenticated, initAuth } = useAuthStore();

  const [activeTab, setActiveTab] = useState<"signin" | "roles" | "register">("signin");

  // Sign In Form State
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Register Form State
  const [regFullName, setRegFullName] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regDept, setRegDept] = useState("1"); // 1 = IT
  const [regRole, setRegRole] = useState("2"); // 2 = GIS Analyst
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("Please enter your username and password.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      await login(username.trim(), password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Invalid credentials. Please verify your username and password.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRole = async (role: "admin" | "analyst" | "officer") => {
    setLoading(true);
    setError(null);
    try {
      await loginAsRole(role);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Demo login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFullName || !regUsername || !regEmail || !regPassword) {
      setError("Please complete all registration fields.");
      return;
    }
    setLoading(true);
    setError(null);
    setRegSuccess(null);

    try {
      await apiRegister({
        full_name: regFullName,
        username: regUsername.trim().toLowerCase(),
        email: regEmail.trim(),
        password: regPassword,
        department_id: Number(regDept),
        role_id: Number(regRole),
      });

      setRegSuccess("Officer account registered successfully! Logging you in…");
      setTimeout(async () => {
        await login(regUsername.trim().toLowerCase(), regPassword);
        router.push("/dashboard");
      }, 1000);
    } catch (err: any) {
      setError(err?.message || "Registration failed. Username or email may already exist.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      {/* ── Left Branding Hero (Full-Height 50% Panel) ── */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-slate-950 p-12 xl:p-16 lg:flex border-r border-border/40 text-white">
        {/* Subtle Ambient Glows */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full opacity-25"
            style={{ background: "radial-gradient(circle, #2563eb, transparent 70%)" }}
          />
          <div
            className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, #059669, transparent 70%)" }}
          />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
              backgroundSize: "48px 48px",
            }}
          />
        </div>

        {/* Top Branding Header */}
        <div className="relative z-10 flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-600 via-primary to-emerald-500 shadow-md shadow-primary/20">
            <Globe2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-white tracking-tight">GeoVision AI</span>
              <span className="rounded-md bg-sky-500/20 px-2 py-0.5 text-[10px] font-bold font-mono text-sky-400 uppercase tracking-wider border border-sky-500/30">
                HP State SDI
              </span>
            </div>
            <p className="text-xs text-slate-400">Government of Himachal Pradesh</p>
          </div>
        </div>

        {/* Central Hero Content */}
        <div className="relative z-10 space-y-8 max-w-xl my-auto py-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>Department of Digital Technologies & Governance</span>
            </div>

            <h1 className="text-4xl xl:text-5xl font-extrabold leading-tight text-white tracking-tight">
              Spatial Intelligence & <br />
              <span className="bg-gradient-to-r from-sky-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                GIS Command Center
              </span>
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed max-w-lg">
              Unified state geospatial repository for multi-departmental asset mapping, boundary containment analytics, and autonomous PostGIS intelligence.
            </p>
          </div>

          {/* 4 Feature Highlights */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2.5 text-sky-400 font-semibold text-xs">
                <Layers size={16} />
                <span className="text-white">Multi-Layer SDI</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                Seamless vector layers and departmental datasets.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2.5 text-emerald-400 font-semibold text-xs">
                <Database size={16} />
                <span className="text-white">PostGIS Engine</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                Geodesic buffering, intersect & boundary breakdown.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2.5 text-amber-400 font-semibold text-xs">
                <Brain size={16} />
                <span className="text-white">Spatial Copilot</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                Natural language query & instant AOI risk audits.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2.5 text-violet-400 font-semibold text-xs">
                <Shield size={16} />
                <span className="text-white">Role Security</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                Departmental isolation and official credentials.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-white/10">
          <span>© 2026 GeoVision AI · All Rights Reserved</span>
          <span>Version 1.0.0</span>
        </div>
      </div>

      {/* ── Right Form Column (Full-Height 50% Panel, Spacious Form) ── */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center items-center p-6 sm:p-12 xl:p-16 overflow-y-auto">
        {/* Mobile Header Logo */}
        <div className="mb-8 flex items-center gap-3 lg:hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-md">
            <Globe2 size={20} />
          </div>
          <div>
            <p className="text-lg font-bold">GeoVision AI</p>
            <p className="text-xs text-muted-foreground">HP State GIS Platform</p>
          </div>
        </div>

        <div className="w-full max-w-md space-y-6">
          {/* Section Title */}
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
              Welcome back
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to your official GeoVision account or select a demo role.
            </p>
          </div>

          {/* Active Session Notification */}
          {isAuthenticated && user && (
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-primary/30 bg-primary/10 text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="truncate">
                  Logged in as <b className="text-foreground">{user.full_name || user.username}</b> ({user.role?.name || "Official"})
                </span>
              </div>
              <Link
                href="/dashboard"
                className="font-bold text-primary hover:underline shrink-0 ml-2 flex items-center gap-1"
              >
                <span>Dashboard</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          )}

          {/* ── Segmented Tab Switcher ── */}
          <div className="grid grid-cols-3 p-1 rounded-xl bg-muted border border-border text-xs font-semibold">
            <button
              type="button"
              onClick={() => { setActiveTab("signin"); setError(null); }}
              className={`py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "signin"
                  ? "bg-card text-foreground shadow-sm font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Lock size={13} />
              <span>Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab("roles"); setError(null); }}
              className={`py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "roles"
                  ? "bg-card text-foreground shadow-sm font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Zap size={13} className="text-amber-500" />
              <span>Demo Roles</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab("register"); setError(null); }}
              className={`py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "register"
                  ? "bg-card text-foreground shadow-sm font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <UserPlus size={13} />
              <span>Register</span>
            </button>
          </div>

          {/* ── TAB 1: Standard Sign In Form ── */}
          {activeTab === "signin" && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Username or Official Email
                </label>
                <Input
                  type="text"
                  placeholder="admin or officer@hp.gov.in"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-11 text-xs"
                  autoComplete="username"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 pr-10 text-xs font-mono"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                  <AlertCircle size={14} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="h-11 w-full text-xs font-semibold cursor-pointer shadow-md shadow-primary/20 mt-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" />
                    Authenticating…
                  </span>
                ) : (
                  "Sign In to Command Center"
                )}
              </Button>
            </form>
          )}

          {/* ── TAB 2: Demo Role Switcher ── */}
          {activeTab === "roles" && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Select an authorized persona below to log in and inspect permissions instantly:
              </p>

              {/* Persona 1: Admin */}
              <button
                type="button"
                onClick={() => handleQuickRole("admin")}
                disabled={loading}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-border bg-card hover:border-primary/60 hover:bg-muted/40 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 group-hover:scale-105 transition-transform">
                    <Crown size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">State SuperAdmin</span>
                      <Badge variant="outline" className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 border-amber-500/30 px-1.5 py-0">
                        Admin
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">Sunaina Khatkar · IT Department</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
                  Login →
                </span>
              </button>

              {/* Persona 2: Analyst */}
              <button
                type="button"
                onClick={() => handleQuickRole("analyst")}
                disabled={loading}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-border bg-card hover:border-primary/60 hover:bg-muted/40 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500 group-hover:scale-105 transition-transform">
                    <Microscope size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">GIS Spatial Analyst</span>
                      <Badge variant="outline" className="text-[10px] font-semibold text-sky-600 dark:text-sky-400 border-sky-500/30 px-1.5 py-0">
                        Analytics
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">Dr. Vikram Sharma · Spatial Modeling</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
                  Login →
                </span>
              </button>

              {/* Persona 3: Officer */}
              <button
                type="button"
                onClick={() => handleQuickRole("officer")}
                disabled={loading}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-border bg-card hover:border-primary/60 hover:bg-muted/40 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 group-hover:scale-105 transition-transform">
                    <TreePine size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">Department Field Lead</span>
                      <Badge variant="outline" className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 border-emerald-500/30 px-1.5 py-0">
                        Field Ops
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">Rajesh Thakur (DFO) · Forest & Wildlife</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
                  Login →
                </span>
              </button>

              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                  <AlertCircle size={14} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          )}

          {/* ── TAB 3: Register Officer Form ── */}
          {activeTab === "register" && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Officer Full Name</label>
                <Input
                  type="text"
                  placeholder="e.g. Officer Anita Verma"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  className="h-10 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Username</label>
                  <Input
                    type="text"
                    placeholder="averma"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    className="h-10 text-xs font-mono"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Password</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="h-10 text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Official Email</label>
                <Input
                  type="email"
                  placeholder="anita.verma@hp.gov.in"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="h-10 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Department</label>
                  <select
                    value={regDept}
                    onChange={(e) => setRegDept(e.target.value)}
                    className="w-full h-10 rounded-xl border border-border bg-card px-3 text-xs text-foreground outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="1">IT & Digital</option>
                    <option value="2">Forest & Ecology</option>
                    <option value="3">Police & Home</option>
                    <option value="4">Health & Family</option>
                    <option value="5">Revenue & Land</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Assigned Role</label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value)}
                    className="w-full h-10 rounded-xl border border-border bg-card px-3 text-xs text-foreground outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="2">GIS Analyst</option>
                    <option value="3">Department Officer</option>
                    <option value="1">Admin</option>
                  </select>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                  <AlertCircle size={14} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {regSuccess && (
                <div className="flex items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
                  <span>{regSuccess}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="h-10 w-full text-xs font-semibold cursor-pointer shadow-sm mt-1"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" />
                    Creating Account…
                  </span>
                ) : (
                  "Complete Registration"
                )}
              </Button>
            </form>
          )}

          {/* Footer Security Tag */}
          <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Shield size={13} className="text-emerald-500" />
              <span>HP State SDI · JWT 256-bit</span>
            </span>
            <span>Government Protected</span>
          </div>
        </div>
      </div>
    </div>
  );
}
