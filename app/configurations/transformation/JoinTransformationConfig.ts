import type {BaseTransformationConfig} from "~/configurations/transformation/BaseTransformationConfig";
import {MaterialTypes} from "~/enumerates/MaterialTypes";
import {MaterialProperties} from "~/enumerates/MaterialProperties";
import type {MaterialCollection} from "~/models/collections/MaterialCollection";
import type {Material} from "~/models/Material";
import _ from "lodash";
import {useMaterialSelection} from "~/composables/useMaterialSelection";

const notification = useNotification()
const {selectJoinedMaterial} = useMaterialSelection()

export const JOIN_TRANSFORMATION_CONFIG: BaseTransformationConfig = {
    filterMaterials: (materials: MaterialCollection, selectedMaterials?: MaterialCollection): MaterialCollection => {
        if (!selectedMaterials) {
            notification.error({
                title: 'Ошибка',
                content: 'Не удалось определить выбранный материал'
            })
            return materials
        }

        return materials.filterAvailableForJoin(selectedMaterials.getFirst()?.cut_from ?? undefined)
    },
    preview: (materials: MaterialCollection, selectedMaterials: MaterialCollection): Material | undefined => {
        if (selectedMaterials.isEmpty()) return undefined

        const firstMaterial = selectedMaterials.getFirst()
        if (!firstMaterial) return undefined

        if ((selectedMaterials.getFirst()?.isJoined && firstMaterial.isPile) || firstMaterial.isBeam || firstMaterial.isStraightSeamPipe) {

            const joinedMaterial = _.cloneDeep(firstMaterial)
            joinedMaterial.quantity = selectedMaterials.getTotalAmountQuantity()
            joinedMaterial.amount = 1

            return joinedMaterial
        } else {

            const joinedMaterial = selectJoinedMaterial(firstMaterial)

            if (!joinedMaterial) return undefined

            joinedMaterial.quantity = selectedMaterials.getTotalAmountQuantity()
            joinedMaterial.amount = 1

            return joinedMaterial


        }
    }


};