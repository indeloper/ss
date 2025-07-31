import type {BaseTransformationConfig} from "~/configurations/transformation/BaseTransformationConfig";
import {MaterialTypes} from "~/enumerates/MaterialTypes";
import type {MaterialCollection} from "~/models/collections/MaterialCollection";

export const CUT_TRANSFORMATION_CONFIG: BaseTransformationConfig = {
    filterMaterials: (materials: MaterialCollection): MaterialCollection => materials.filterAvailableForCut()
}