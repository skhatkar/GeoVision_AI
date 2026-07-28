import { GISLayer } from "@/types/layer";

export async function loadGeoJson(layer: GISLayer) {

    const response = await fetch(layer.url);

    return response.json();

}
