import type {MaterialCollection} from "~/models/collections/MaterialCollection";
import type {Material} from "~/models/Material";

export interface BaseTransformationConfig {
    filterMaterials: (materials: MaterialCollection, selectedMaterials?: MaterialCollection) => MaterialCollection,
    preview: (materials: MaterialCollection, selectedMaterials: MaterialCollection) => Material | undefined
}