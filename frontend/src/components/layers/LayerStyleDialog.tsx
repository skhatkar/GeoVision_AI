"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { GISLayer } from "@/types/layer";
import { useLayerStore } from "@/store/layerStore";
import {
  Palette,
  Check,
  RotateCcw,
  Sparkles,
  Circle,
  MapPin,
  Building2,
  Shield,
  Trees,
  GraduationCap,
  Star,
  AlertTriangle,
  Droplets,
  Flame,
  Cross,
  UploadCloud,
  X,
  Image as ImageIcon,
} from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  layer: GISLayer | null;
}

const PRESET_COLORS = [
  { name: "Sky Blue", value: "#2563EB" },
  { name: "Emerald Green", value: "#10B981" },
  { name: "Vibrant Violet", value: "#8B5CF6" },
  { name: "Amber Orange", value: "#F59E0B" },
  { name: "Crimson Red", value: "#EF4444" },
  { name: "Cyan Teal", value: "#06B6D4" },
  { name: "Indigo", value: "#6366F1" },
  { name: "Rose Pink", value: "#EC4899" },
  { name: "Teal Green", value: "#14B8A6" },
  { name: "Slate Grey", value: "#475569" },
  { name: "Gold Yellow", value: "#EAB308" },
  { name: "Dark Purple", value: "#581C87" },
];

const MARKER_ICONS = [
  { id: "circle", label: "Circle Dot", icon: Circle },
  { id: "pin", label: "Map Pin", icon: MapPin },
  { id: "hospital", label: "Hospital", icon: Cross },
  { id: "shield", label: "Police / Shield", icon: Shield },
  { id: "tree", label: "Forest / Tree", icon: Trees },
  { id: "school", label: "Education / School", icon: GraduationCap },
  { id: "building", label: "Govt / Building", icon: Building2 },
  { id: "star", label: "Landmark / Star", icon: Star },
  { id: "alert", label: "Hazard / Alert", icon: AlertTriangle },
  { id: "water", label: "Water / River", icon: Droplets },
  { id: "fire", label: "Emergency / Fire", icon: Flame },
];

export default function LayerStyleDialog({
  open,
  onClose,
  layer,
}: Props) {
  const updateLayerStyle = useLayerStore((s) => s.updateLayerStyle);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [color, setColor] = useState("#2563EB");
  const [fillColor, setFillColor] = useState("#2563EB");
  const [matchFill, setMatchFill] = useState(true);
  const [icon, setIcon] = useState("circle");
  const [customIcon, setCustomIcon] = useState<string | null>(null);
  const [weight, setWeight] = useState(2);
  const [pointSize, setPointSize] = useState(28);
  const [opacity, setOpacity] = useState(1);
  const [fillOpacity, setFillOpacity] = useState(0.25);
  const [activeIconTab, setActiveIconTab] = useState<"preset" | "upload">("preset");

  useEffect(() => {
    if (layer) {
      setColor(layer.color || "#2563EB");
      setFillColor(layer.fillColor || layer.color || "#2563EB");
      setMatchFill(!layer.fillColor || layer.fillColor === layer.color);
      setIcon(layer.icon || "circle");
      setCustomIcon(layer.customIcon || null);
      if (layer.customIcon) {
        setActiveIconTab("upload");
      }
      setWeight(layer.weight ?? 2);
      setPointSize(layer.pointSize ?? 28);
      setOpacity(layer.opacity ?? 1);
      setFillOpacity(layer.fillOpacity ?? 0.25);
    }
  }, [layer, open]);

  if (!layer) return null;

  const isPoint =
    (layer.geometryType || "").toLowerCase().includes("point");

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    if (matchFill) {
      setFillColor(newColor);
    }
    updateLayerStyle(layer.id, {
      color: newColor,
      fillColor: matchFill ? newColor : fillColor,
    });
  };

  const handleIconChange = (newIcon: string) => {
    setIcon(newIcon);
    setCustomIcon(null);
    updateLayerStyle(layer.id, { icon: newIcon, customIcon: undefined });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("Image is too large. Please select an icon under 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setCustomIcon(dataUrl);
      setIcon("custom");
      setActiveIconTab("upload");
      updateLayerStyle(layer.id, {
        customIcon: dataUrl,
        icon: "custom",
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCustomIcon = () => {
    setCustomIcon(null);
    setIcon("circle");
    updateLayerStyle(layer.id, {
      customIcon: undefined,
      icon: "circle",
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleWeightChange = (newWeight: number) => {
    setWeight(newWeight);
    updateLayerStyle(layer.id, { weight: newWeight });
  };

  const handlePointSizeChange = (newSize: number) => {
    setPointSize(newSize);
    updateLayerStyle(layer.id, { pointSize: newSize });
  };

  const handleOpacityChange = (newOpacity: number) => {
    setOpacity(newOpacity);
    updateLayerStyle(layer.id, { opacity: newOpacity });
  };

  const handleFillOpacityChange = (newFillOpacity: number) => {
    setFillOpacity(newFillOpacity);
    updateLayerStyle(layer.id, { fillOpacity: newFillOpacity });
  };

  const handleReset = () => {
    const defaultColor = "#2563EB";
    setColor(defaultColor);
    setFillColor(defaultColor);
    setMatchFill(true);
    setIcon("circle");
    setCustomIcon(null);
    setWeight(2);
    setPointSize(28);
    setOpacity(1);
    setFillOpacity(0.25);
    setActiveIconTab("preset");
    updateLayerStyle(layer.id, {
      color: defaultColor,
      fillColor: defaultColor,
      icon: "circle",
      customIcon: undefined,
      weight: 2,
      pointSize: 28,
      opacity: 1,
      fillOpacity: 0.25,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const SelectedIconComp =
    MARKER_ICONS.find((m) => m.id === icon)?.icon || Circle;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl overflow-y-auto max-h-[88vh] z-[9999]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-md transition-colors"
              style={{ backgroundColor: color }}
            >
              <Palette size={20} />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                Style Layer: {layer.name}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Customize colors, upload custom icons, and adjust transparency live on the map
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Live Preview Box */}
          <div className="rounded-xl border bg-gradient-to-b from-muted/50 to-muted/20 p-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
              <span className="font-semibold uppercase tracking-wider">Live Map Preview</span>
              <Badge variant="outline" className="text-[11px] font-mono">
                {layer.geometryType || "GIS Layer"}
              </Badge>
            </div>

            <div className="flex items-center justify-around py-3">
              {/* Point preview */}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className="flex items-center justify-center rounded-full border-2 border-white shadow-lg transition-all duration-200 overflow-hidden"
                  style={{
                    backgroundColor: customIcon ? "#ffffff" : color,
                    borderColor: customIcon ? color : "#ffffff",
                    width: `${pointSize}px`,
                    height: `${pointSize}px`,
                    opacity,
                    padding: customIcon ? "2px" : undefined,
                  }}
                >
                  {customIcon ? (
                    <img
                      src={customIcon}
                      alt="Custom Icon"
                      className="h-full w-full object-contain rounded-full"
                    />
                  ) : icon !== "circle" ? (
                    <SelectedIconComp
                      size={Math.max(12, Math.round(pointSize * 0.55))}
                      className="text-white"
                    />
                  ) : null}
                </div>
                <span className="text-[11px] text-muted-foreground font-medium">
                  {customIcon ? "Custom Image" : "Point Marker"}
                </span>
              </div>

              {/* Polygon / Boundary preview */}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className="h-12 w-20 rounded-lg shadow-sm transition-all duration-200"
                  style={{
                    borderColor: color,
                    borderWidth: `${weight}px`,
                    borderStyle: "solid",
                    backgroundColor: fillColor,
                    opacity: fillOpacity,
                  }}
                />
                <span className="text-[11px] text-muted-foreground font-medium">Polygon Fill</span>
              </div>

              {/* Line preview */}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className="w-16 rounded-full transition-all duration-200"
                  style={{
                    backgroundColor: color,
                    height: `${Math.max(2, weight * 1.5)}px`,
                    opacity,
                  }}
                />
                <span className="text-[11px] text-muted-foreground font-medium">Line Stroke</span>
              </div>
            </div>
          </div>

          {/* Color Palette Presets */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Color Palette
            </label>
            <div className="grid grid-cols-6 gap-2">
              {PRESET_COLORS.map((c) => {
                const isSelected = color.toLowerCase() === c.value.toLowerCase();
                return (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => handleColorChange(c.value)}
                    title={c.name}
                    className={`
                      group relative flex h-10 w-full items-center justify-center rounded-xl transition-all duration-150
                      hover:scale-105 hover:shadow-md cursor-pointer
                      ${isSelected ? "ring-2 ring-primary ring-offset-2 scale-105 shadow-md" : "border"}
                    `}
                    style={{ backgroundColor: c.value }}
                  >
                    {isSelected && (
                      <Check size={16} className="text-white drop-shadow" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom HEX picker input */}
            <div className="flex items-center gap-3 pt-1">
              <div className="relative flex items-center">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="h-9 w-12 cursor-pointer rounded-lg border bg-transparent p-0.5"
                />
              </div>
              <div className="flex-1">
                <Input
                  value={color.toUpperCase()}
                  onChange={(e) => handleColorChange(e.target.value)}
                  placeholder="#2563EB"
                  className="font-mono text-xs uppercase"
                  maxLength={7}
                />
              </div>
            </div>
          </div>

          {/* Marker Icon Section (Preset vs Upload) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Marker Symbol & Icon
              </label>

              {/* Tab Selector */}
              <div className="flex rounded-lg border bg-muted/40 p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveIconTab("preset")}
                  className={`rounded-md px-2.5 py-1 font-medium transition-all ${
                    activeIconTab === "preset"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Symbols
                </button>
                <button
                  type="button"
                  onClick={() => setActiveIconTab("upload")}
                  className={`flex items-center gap-1 rounded-md px-2.5 py-1 font-medium transition-all ${
                    activeIconTab === "upload"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <UploadCloud size={13} />
                  Upload Icon
                </button>
              </div>
            </div>

            {activeIconTab === "preset" ? (
              /* Preset Symbols Grid */
              <div className="grid grid-cols-4 gap-2">
                {MARKER_ICONS.map((m) => {
                  const IconComponent = m.icon;
                  const isSelected = !customIcon && icon === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleIconChange(m.id)}
                      className={`
                        flex flex-col items-center gap-1.5 rounded-xl border p-2.5 text-xs transition-all duration-150 cursor-pointer
                        hover:border-primary/50 hover:bg-muted/50
                        ${
                          isSelected
                            ? "border-primary bg-primary/10 font-semibold text-primary shadow-sm ring-1 ring-primary"
                            : "text-muted-foreground"
                        }
                      `}
                    >
                      <IconComponent
                        size={18}
                        style={{ color: isSelected ? color : undefined }}
                      />
                      <span className="truncate text-[11px]">{m.label}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              /* Upload Custom Icon Dropzone */
              <div className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/svg+xml,image/png,image/jpeg,image/webp,image/jpg"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {customIcon ? (
                  <div className="flex items-center justify-between rounded-xl border bg-muted/30 p-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-xl border-2 bg-white shadow-sm overflow-hidden p-1"
                        style={{ borderColor: color }}
                      >
                        <img
                          src={customIcon}
                          alt="Custom icon preview"
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">Custom Icon Active</p>
                        <p className="text-[11px] text-muted-foreground">
                          Custom marker image rendered with layer color border
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Replace
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={handleRemoveCustomIcon}
                        title="Remove custom icon"
                      >
                        <X size={15} />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/20 p-6 text-center transition-all hover:border-primary/50 hover:bg-muted/40 cursor-pointer"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary mb-2">
                      <UploadCloud size={22} />
                    </div>
                    <p className="text-xs font-semibold text-foreground">
                      Click to upload custom icon image
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Supports SVG, PNG, JPG, WebP (Transparent PNG / SVG recommended, max 2MB)
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Size & Weight Adjustments */}
          <div className="grid grid-cols-2 gap-4 pt-1">
            {/* Point / Marker Size */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-medium">Marker / Icon Size</span>
                <span className="font-mono text-muted-foreground">{pointSize}px</span>
              </div>
              <input
                type="range"
                min="12"
                max="56"
                step="2"
                value={pointSize}
                onChange={(e) => handlePointSizeChange(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
            </div>

            {/* Border Stroke Weight */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-medium">Border Stroke</span>
                <span className="font-mono text-muted-foreground">{weight}px</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={weight}
                onChange={(e) => handleWeightChange(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
            </div>
          </div>

          {/* Opacity Controls */}
          <div className="grid grid-cols-2 gap-4">
            {/* Stroke / Marker Opacity */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-medium">Layer Opacity</span>
                <span className="font-mono text-muted-foreground">
                  {Math.round(opacity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={opacity}
                onChange={(e) => handleOpacityChange(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
            </div>

            {/* Polygon Fill Opacity */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-medium">Fill Opacity</span>
                <span className="font-mono text-muted-foreground">
                  {Math.round(fillOpacity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={fillOpacity}
                onChange={(e) => handleFillOpacityChange(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="gap-1.5 text-xs mr-auto"
          >
            <RotateCcw size={13} />
            Reset Default
          </Button>

          <Button
            type="button"
            onClick={onClose}
            className="gap-1.5 text-xs font-semibold"
          >
            <Sparkles size={13} />
            Apply & Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
