import type {Material} from "~/models/Material";
import type {MaterialCollection} from "~/models/collections/MaterialCollection";

export interface CutParams {
    quantity: number,
    amount: number,
    cutType: 'standard' | 'equal'
}

export const useMaterialTransformation = (materials: MaterialCollection, selectedMaterials: MaterialCollection) => {

    const {cutMaterial} = useMaterialCut()
    const message = useMessage()

    const filteredMaterials = computed(() => {

        return materials
            .when(
                selectedMaterials.isEmpty(),
                materialCollection => materialCollection.filterAvailableToJoinTransformation()
            ).when(
                !selectedMaterials.isEmpty(),
                materialCollection => {
                    const firstSelectedMaterial = selectedMaterials.getFirst()
                    return materialCollection.filterAvailableToJoinToMaterial(firstSelectedMaterial)
                }
            )
    })

    const processCutMaterial = (
        cutParams: {
            material: Material,
            params: CutParams,
            sourceCollection: MaterialCollection,
            resultCollection: MaterialCollection,
            remainderCollection?: MaterialCollection,
        }
    ) => {
        const sourceCollection = cutParams.sourceCollection
        const resultCollection = cutParams.resultCollection
        const remainderCollection = cutParams.remainderCollection || sourceCollection

        const result = cutMaterial(cutParams.material, cutParams.params.quantity, cutParams.params.amount, cutParams.params.cutType)

        if (!result) {
            message.error('Произошла ошибка. Не удалось разделить материал.')
            return
        }

        resultCollection.add(result.result)

        if (result.remainder && result.remainder.length > 0) {
            result.remainder.forEach((remainder) => {
                remainderCollection.add(remainder)
            })
        }

        if (result.unusedPart) {
            sourceCollection.replaceByUuid(cutParams.material.uuid, result.unusedPart)
        }
    }

    const cutMaterialOnePart = (
        material: Material,
        sourceCollection: MaterialCollection,
        resultCollection: MaterialCollection
    ) => {
        processCutMaterial({
            material,
            params: {
                quantity: material.quantity,
                amount: 1,
                cutType: 'standard'
            },
            sourceCollection,
            resultCollection
        })
    }

    const cutMaterialFull = (
        material: Material,
        sourceCollection: MaterialCollection,
        resultCollection: MaterialCollection
    ) => {
        processCutMaterial({
            material,
            params: {
                quantity: material.quantity,
                amount: material.amount,
                cutType: 'standard'
            },
            sourceCollection,
            resultCollection
        })
    }

    const cutMaterialWithParams = (
        material: Material,
        params: CutParams,
        sourceCollection: MaterialCollection,
        resultCollection: MaterialCollection
    ) => {
        processCutMaterial({
            material,
            params,
            sourceCollection,
            resultCollection
        })
    }

    return {
        filteredMaterials,
        processCutMaterial,
        cutMaterialOnePart,
        cutMaterialFull,
        cutMaterialWithParams
    }
}