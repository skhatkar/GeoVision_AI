"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";

import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";

import { useDrawingStore } from "@/store/drawingStore";

export default function DrawingControls() {
  const map = useMap();

  const addDrawing = useDrawingStore((s) => s.addDrawing);
  const removeDrawing = useDrawingStore((s) => s.removeDrawing);

  useEffect(() => {
    // Hide Geoman toolbar (TopToolbar controls everything)
    map.pm.addControls({
      position: "topleft",

      drawMarker: false,
      drawPolyline: false,
      drawPolygon: false,
      drawRectangle: false,
      drawCircle: false,
      drawCircleMarker: false,
      drawText: false,

      editMode: false,
      dragMode: false,
      removalMode: false,
      rotateMode: false,
      cutPolygon: false,
    });

    const handleCreate = (e: any) => {
      addDrawing(e.layer);
    };

    const handleRemove = (e: any) => {
      removeDrawing(e.layer);
    };

    map.on("pm:create", handleCreate);
    map.on("pm:remove", handleRemove);

    return () => {
      map.off("pm:create", handleCreate);
      map.off("pm:remove", handleRemove);
    };
  }, [map, addDrawing, removeDrawing]);

  return null;
}