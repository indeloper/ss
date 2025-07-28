import type {BaseTransformationConfig} from "~/configurations/transformation/BaseTransformationConfig";
import {MaterialTypes} from "~/enumerates/MaterialTypes";
import {MaterialProperties} from "~/enumerates/MaterialProperties";

export const JOIN_TRANSFORMATION_CONFIG: BaseTransformationConfig = {
    allowedMaterialTypesIds: [
        MaterialTypes.PILE,
        MaterialTypes.STRAIGHT_SEAM_PIPE,
        MaterialTypes.I_BEAM,
    ],
    allowedMaterialPropertiesIds: [
        MaterialProperties.JOINED,
    ]
};