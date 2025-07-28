import type {BaseTransformationConfig} from "~/configurations/transformation/BaseTransformationConfig";
import {MaterialTypes} from "~/enumerates/MaterialTypes";

export const CUT_TRANSFORMATION_CONFIG: BaseTransformationConfig = {
    allowedMaterialTypesIds: [
        MaterialTypes.PILE,
        MaterialTypes.ANGULAR_ELEMENT,
        MaterialTypes.SQUARE_PIPE,
    ]
}