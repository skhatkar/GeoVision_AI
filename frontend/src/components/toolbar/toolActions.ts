import { useMapStore } from "@/store/mapStore";


export function zoomIn(){

    console.log("zoomIn function called");


    const map = useMapStore.getState().map;


    console.log("MAP =", map);


    if(!map){

        console.log("No map instance");

        return;

    }


    map.zoomIn();

}



export function zoomOut(){

    console.log("zoomOut function called");


    const map = useMapStore.getState().map;


    console.log("MAP =", map);


    if(!map){

        console.log("No map instance");

        return;

    }


    map.zoomOut();

}



export function goHome(){

    console.log("Home function called");


    const map = useMapStore.getState().map;


    console.log("MAP =", map);


    if(!map){

        return;

    }


    map.setView(
        [31.1048,77.1734],
        8
    );

}