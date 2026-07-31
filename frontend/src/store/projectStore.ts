import { create } from "zustand";


interface MapState {

    map: any | null;

    setMap: (map:any)=>void;

}


export const useMapStore = create<MapState>((set)=>({

    map:null,


    setMap:(map)=>set({

        map

    })

}));