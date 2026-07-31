import { create } from "zustand";


interface MapState {

  map: any | null;

  setMap: (map:any)=>void;

  basemap: string;

  setBasemap:(basemap:string)=>void;

}


export const useMapStore = create<MapState>((set)=>({

  map:null,

  setMap:(map)=>set({
    map
  }),


  basemap:"osm",

  setBasemap:(basemap)=>set({
    basemap
  })

}));