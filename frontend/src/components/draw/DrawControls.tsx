"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";

import L from "leaflet";
import "leaflet-draw";

import { useDrawStore } from "@/store/drawStore";

export default function DrawControls() {

    const map=useMap();

    const setDrawnItems=useDrawStore(
        s=>s.setDrawnItems
    );

    useEffect(()=>{

        const drawnItems=new L.FeatureGroup();

        map.addLayer(drawnItems);

        setDrawnItems(drawnItems);

        const drawControl=new L.Control.Draw({

            edit:{

                featureGroup:drawnItems

            },

            draw:{

                polygon:true,

                polyline:true,

                rectangle:true,

                circle:true,

                marker:true,

                circlemarker:false

            }

        });

        map.addControl(drawControl);

        map.on(L.Draw.Event.CREATED,(e:any)=>{

            drawnItems.addLayer(e.layer);

        });

        return ()=>{

            map.removeControl(drawControl);

        };

    },[]);

    return null;

}