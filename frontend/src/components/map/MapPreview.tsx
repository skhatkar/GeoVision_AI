"use client";

import "leaflet/dist/leaflet.css";

import {
  MapContainer,
  TileLayer,
  ZoomControl,
  ScaleControl,
  useMap
} from "react-leaflet";

import { BASEMAPS } from "@/constants/basemaps";
import { useMapStore } from "@/store/mapStore";
import { useLayerStore } from "@/store/layerStore";

import GeoJsonLayer from "./GeoJsonLayer";



function MapInstance() {

  const map = useMap();

  const setMap = useMapStore(
    (state) => state.setMap
  );


  setMap(map);


  return null;
}



export default function MapPreview() {


  const basemap = useMapStore(
    (state) => state.basemap
  );


  const layers = useLayerStore(
    (state) => state.layers
  );


  const currentBasemap =
    BASEMAPS[basemap] ?? BASEMAPS["osm"];



  return (

    <MapContainer

      center={[31.1048, 77.1734]}

      zoom={8}

      minZoom={6}

      maxZoom={18}

      zoomControl={false}

      className="h-full w-full"

    >


      {/* Save Leaflet map instance */}

      <MapInstance />



      {/* Basemap */}

      <TileLayer

        attribution={
          currentBasemap.name
        }

        url={
          currentBasemap.url
        }

      />



      {/* GIS Layers */}

      {[...layers]

        .filter(
          (layer)=>layer.visible
        )

        .reverse()

        .map((layer)=>(

          <GeoJsonLayer

            key={layer.id}

            layer={layer}

          />

        ))}



      {/* Controls */}

      <ZoomControl position="topright" />

      <ScaleControl position="bottomleft" />


    </MapContainer>

  );
}