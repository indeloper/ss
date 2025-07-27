import type {Material} from "~/models/Material"
import {MaterialCollection} from "~/models/collections/MaterialCollection"

export const useMaterialTransformationOld = (materials: MaterialCollection) => {

    const {cutOnePart, cutAll} = useMaterialCut()

    const store = async (data: any) => {
        await useApi().post('/operations/transformation', data);
    }

    const filteredMaterials = computed<MaterialCollection>(() => {
        return materials.filterAvailableToJoinTransformation()
    })

    const processCutOnePartResult = (
        material: Material,
        sourceCollection: MaterialCollection,
        resultCollection: MaterialCollection,
        zeroOut: boolean = true
    ) => {

        const result = cutOnePart(material)

        if (!result) return

        processCutResult({
                material,
                cutParams: {
                    quantity: material.quantity,
                    amount: material.amount,
                    cutType: 'standard'
                },
                cutResult: {
                    result: result.result,
                    remainder: result.remainder,
                    unusedPart: result.unusedPart
                }
            },
            sourceCollection,
            resultCollection,
            zeroOut
        )
    }

    const processCutAllResult = (
        material: Material,
        sourceCollection: MaterialCollection,
        resultCollection: MaterialCollection,
        zeroOut: boolean = true
    ) => {

        const result = cutAll(material)

        if (!result) return

        processCutResult({
                material,
                cutParams: {
                    quantity: material.quantity,
                    amount: material.amount,
                    cutType: 'standard'
                },
                cutResult: {
                    result: result.result,
                    remainder: result.remainder,
                    unusedPart: result.unusedPart
                }
            },
            sourceCollection,
            resultCollection,
            zeroOut
        )
    }

    const processCutResult = (
        result: {
            material: Material,
            cutParams: {
                quantity: number,
                amount: number,
                cutType: 'standard' | 'equal'
            },
            cutResult: {
                result: Material,
                remainder: Material[],
                unusedPart: Material | null
            }
        },
        sourceCollection: MaterialCollection,
        resultCollection: MaterialCollection,
        remainderCollection: MaterialCollection = resultCollection,
        zeroOut: boolean = true
    ) => {
        resultCollection.add(result.cutResult.result)

        if (result.cutResult.remainder.length > 0) {
            result.cutResult.remainder.forEach((remainder) => {
                remainderCollection.add(remainder)
            })
        }

        if (result.cutResult.unusedPart) {
            sourceCollection.replaceByUuid(result.material.uuid, result.cutResult.unusedPart)
        } else {
            if (zeroOut) {
                const zeroedMaterial = result.material.material_standard.material_type.fixed_quantity
                    ? result.material.cloneWithNewParams(result.material.quantity, 0, undefined, true)
                    : result.material.cloneWithNewParams(0, result.material.amount, undefined, true)

                sourceCollection.replaceByUuid(result.material.uuid, zeroedMaterial)
            } else {
                sourceCollection.removeByUuid(result.material.uuid)
            }
        }
    }

    const findOriginalMaterial = (
        cutFromUuid: string,
        ...collections: MaterialCollection[]
    ): Material | null => {
        for (const collection of collections) {
            const material = collection.findByUuid(cutFromUuid)
            if (material) {
                return material
            }
        }
        return null
    }

    const findMaterialsWithOperationUuid = (
        operationUuid: string,
        ...collections: MaterialCollection[]
    ): Material[] => {
        const results: Material[] = []

        for (const collection of collections) {
            collection.getAll().forEach(material => {
                if (material.cut_operation_uuid === operationUuid) {
                    results.push(material)
                }
            })
        }

        return results
    }

    return {
        filteredMaterials,
        store,
        processCutAllResult,
        processCutOnePartResult,
        processCutResult,
        findOriginalMaterial,
        findMaterialsWithOperationUuid
    }
}
