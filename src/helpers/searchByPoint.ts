import { queryTriply, queryResourcesDescriptions } from "./sparql";
import { getDataByQuery} from "../bgt";

export async function getFromCoordinates(lat : string, lng: string, zoomlevel: number ) {
  let precisie = "20";
  if (zoomlevel < 10){
    precisie = "20"
  }else if(zoomlevel > 9 && zoomlevel < 15){
    precisie = "70"
  }else if (zoomlevel > 14){
    precisie = "100"
  }

  const results = await queryTriply(getDataByQuery(lat, lng, precisie));

  return await queryResourcesDescriptions(lat, lng, results.results.bindings.map(b => b.registratie.value));
}
