import {Material} from "~/models/Material";
import {MaterialCollection} from "~/models/collections/MaterialCollection";
import {watchArray} from "@vueuse/core";
import {MaterialTypes} from "~/enumerates/MaterialTypes";

export interface CutParams {
    quantity: number,
    amount: number,
    cutType: 'standard' | 'equal'
}

export const useMaterialTransformation = (materials: MaterialCollection, selectedMaterials: MaterialCollection) => {

    const {cutMaterial, undoCutOperation} = useMaterialCut()
    const message = useMessage()
    const materialLibraryStore = useMaterialLibraryStore()
    const {standards} = storeToRefs(materialLibraryStore)

    const previewResult = ref<Material | null>(null)
    const resultMaterials = ref<MaterialCollection>(new MaterialCollection())

    const sheets = computed(() => materials.filterByMaterialTypeIds([MaterialTypes.HOT_ROLLED_SHEET]))

    const filteredMaterials = computed(() => {

        return materials
            .when(
                selectedMaterials.filterNotJoinedTo().isEmpty(),
                materialCollection => materialCollection.filterAvailableToJoinTransformation()
            ).when(
                !selectedMaterials.filterNotJoinedTo().isEmpty(),
                materialCollection => {
                    const firstSelectedMaterial = selectedMaterials.getFirst()
                    return materialCollection.filterAvailableToJoinToMaterial(firstSelectedMaterial)
                }
            )
    })

    const filteredSelectedMaterials = computed(() => {
        return selectedMaterials.filterNotJoinedTo()
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

    const restoreMaterial = (material: Material) => {
        const selectedResults = selectedMaterials.filterAllByCutFrom(material.uuid)

        selectedResults.getAll().forEach(derivedMaterial => {
            undoCutMaterial(derivedMaterial)
        })

        const materialResults = materials.filterAllByCutFrom(material.uuid)

        materialResults.getAll().forEach(derivedMaterial => {
            undoCutMaterial(derivedMaterial)
        })
    }

    const undoCutMaterial = (material: Material) => {
        undoCutOperation(material, materials, selectedMaterials)
    }

    const confirmJoinResult = () => {
        // Проверяем, что есть превью результата
        if (!previewResult.value) {
            message.error('Нет результата для подтверждения')
            return false
        }

        // Получаем только непривязанные материалы
        const notJoinedMaterials = selectedMaterials.filterNotJoinedTo()

        // Проверяем, что выбрано минимум 2 материала
        if (notJoinedMaterials.getCount() < 2) {
            message.error('Для стыковки необходимо выбрать минимум 2 материала')
            return false
        }

        try {
            // Добавляем результат в коллекцию результатов
            const resultMaterial = previewResult.value
            resultMaterials.value.add(resultMaterial)

            // Обновляем поле join_to у всех непривязанных материалов
            const notJoinedMaterialsList = notJoinedMaterials.getAll()
            notJoinedMaterialsList.forEach(material => {
                const updatedMaterial = material.cloneWithNewParams(
                    material.quantity,
                    material.amount,
                    material.cut_operation_uuid,
                    true
                )
                updatedMaterial.join_to = resultMaterial.uuid
                selectedMaterials.replaceByUuid(material.uuid, updatedMaterial)
            })

            // Сбрасываем превью
            previewResult.value = null

            message.success(`Создан результат стыковки из ${notJoinedMaterialsList.length} материалов`)
            return true

        } catch (error) {
            console.error('Ошибка при подтверждении результата стыковки:', error)
            message.error('Произошла ошибка при создании результата стыковки')
            return false
        }
    }

    const canMaterialBeJoined = (material: Material): boolean => {
        try {
            // Создаем временную коллекцию с новым материалом
            const tempCollection = selectedMaterials.filterNotJoinedTo().clone()
            tempCollection.add(material)

            // Проверяем, что есть первый материал и его стандарт
            const firstMaterial = tempCollection.getFirst()
            if (!firstMaterial || !firstMaterial.material_standard) {
                message.error('Не удалось определить стандарт материала')
                return false
            }

            // Получаем противоположные стандарты для стыковки
            const oppositeStandards = standards.value.filterJoinOpposite(firstMaterial.material_standard.id)

            // Проверяем, что найдены противоположные стандарты
            if (oppositeStandards.isEmpty()) {
                message.error('Для данного материала нет стыкованного варианта')
                return false
            }

            return true

        } catch (error) {
            console.error('Ошибка при проверке возможности стыковки:', error)
            message.error('Произошла ошибка при проверке возможности стыковки')
            return false
        }
    }

    const editJoinResult = (resultMaterial: Material) => {
        try {
            // Удаляем результат из коллекции результатов
            resultMaterials.value.removeByUuid(resultMaterial.uuid)

            // СНАЧАЛА удаляем из selectedMaterials все материалы без join_to (непривязанные в средней колонке)
            // чтобы избежать смешения разных марок материалов
            const materialsToRemove = selectedMaterials.filterNotJoinedTo().getAll()
            materialsToRemove.forEach(material => {
                undoCutMaterial(material)
            })

            // ПОТОМ находим все материалы, привязанные к этому результату
            const joinedMaterials = selectedMaterials.getAll().filter(material =>
                material.join_to === resultMaterial.uuid
            )

            // Обнуляем join_to у всех привязанных материалов (НЕ удаляем их)
            joinedMaterials.forEach(material => {
                const updatedMaterial = material.cloneWithNewParams(
                    material.quantity,
                    material.amount,
                    material.cut_operation_uuid,
                    true
                )
                updatedMaterial.join_to = undefined
                selectedMaterials.replaceByUuid(material.uuid, updatedMaterial)
            })

            message.success(`Результат стыковки отменен. Материалы возвращены для редактирования`)

        } catch (error) {
            console.error('Ошибка при отмене результата стыковки:', error)
            message.error('Произошла ошибка при отмене результата стыковки')
        }
    }

    const clearUnjoined = () => {
        try {
            // Получаем все материалы без join_to
            const materialsToRemove = selectedMaterials.filterNotJoinedTo().getAll()

            if (materialsToRemove.length === 0) {
                message.info('Нет материалов для очистки')
                return
            }

            // Удаляем каждый материал через undoCutMaterial
            materialsToRemove.forEach(material => {
                undoCutMaterial(material)
            })

            message.success(`Очищено ${materialsToRemove.length} материалов`)

        } catch (error) {
            console.error('Ошибка при очистке материалов:', error)
            message.error('Произошла ошибка при очистке материалов')
        }
    }

    const deleteJoinResult = (resultMaterial: Material) => {
        try {
            // Удаляем результат из коллекции результатов
            resultMaterials.value.removeByUuid(resultMaterial.uuid)

            // Находим все материалы, привязанные к этому результату
            const joinedMaterials = selectedMaterials.getAll().filter(material =>
                material.join_to === resultMaterial.uuid
            )

            // Удаляем каждый привязанный материал через undoCutMaterial
            joinedMaterials.forEach(material => {
                undoCutMaterial(material)
            })

            message.success(`Результат стыковки удален. Удалено ${joinedMaterials.length} материалов`)

        } catch (error) {
            console.error('Ошибка при удалении результата стыковки:', error)
            message.error('Произошла ошибка при удалении результата стыковки')
        }
    }

    watch(
        () => selectedMaterials,
        (materials) => {
            // Сбрасываем превью если нет выбранных материалов
            if (!materials || materials.filterNotJoinedTo().getCount() === 0) {
                previewResult.value = null
                return
            }

            try {
                const firstMaterial = selectedMaterials.filterNotJoinedTo().getFirst()

                // Проверяем, что есть первый материал и его стандарт
                if (!firstMaterial || !firstMaterial.material_standard) {
                    previewResult.value = null
                    return
                }

                // Получаем противоположные стандарты для стыковки
                const oppositeStandards = standards.value.filterJoinOpposite(firstMaterial.material_standard.id)

                // Проверяем, что найдены противоположные стандарты
                if (!oppositeStandards || oppositeStandards.isEmpty()) {
                    console.warn('Не найдены противоположные стандарты для стыковки')
                    previewResult.value = null
                    return
                }

                const oppositeStandard = oppositeStandards.getFirst()
                if (!oppositeStandard) {
                    previewResult.value = null
                    return
                }

                // Вычисляем параметры результирующего материала
                const totalQuantity = selectedMaterials.filterNotJoinedTo().getTotalAmountQuantity()
                const totalWeight = selectedMaterials.filterNotJoinedTo().getTotalWeight()

                // Создаем превью результирующего материала
                const resultMaterial = new Material({
                    id: null,
                    uuid: `result-${Date.now()}`,
                    material_standard: oppositeStandard.toTransformed(),
                    quantity: totalQuantity,
                    amount: 1,
                    locked: false,
                    lock_reason: null,
                    project_object_id: firstMaterial.project_object_id,
                    length_group_name: '',
                    length_group_min: 0,
                    length_group_max: 0,
                    old_material_standard_id: oppositeStandard.old_standard_id || null
                })

                previewResult.value = resultMaterial

            } catch (error) {
                console.error('Ошибка при создании превью результата:', error)
                previewResult.value = null
            }
        },
        {deep: true}
    )

    return {
        sheets,
        undoCutMaterial,
        restoreMaterial,
        filteredMaterials,
        filteredSelectedMaterials,
        previewResult,
        resultMaterials,
        processCutMaterial,
        cutMaterialOnePart,
        cutMaterialFull,
        cutMaterialWithParams,
        confirmJoinResult,
        canMaterialBeJoined,
        editJoinResult,
        deleteJoinResult,
        clearUnjoined
    }
}