import type {MaterialCollection} from "~/models/collections/MaterialCollection";
import {Material} from "~/models/Material";
import {useMaterialCut} from "~/composables/useMaterialCut";
import type {CutParams} from "~/composables/useMaterialCut";
import {useMaterialTransformationStore} from "~/stores/materialTransformation";
import {useMaterialLibraryStore} from "~/stores/materialLibrary";
import type {MaterialStandardCollection} from "~/models/collections/MaterialStandardCollection";
import type {UnwrapRef} from "vue";
import {useMaterialSelection} from "~/composables/useMaterialSelection";
import _ from "lodash";
import {MaterialTypes} from "~/enumerates/MaterialTypes";
import {CUT_TRANSFORMATION_CONFIG} from "~/configurations/transformation/CutTransformationConfig";
import {JOIN_TRANSFORMATION_CONFIG} from "~/configurations/transformation/JoinTransformationConfig";
import {ANGLE_TRANSFORMATION_CONFIG} from "~/configurations/transformation/AngleTransformationConfig";
import type {BaseTransformationConfig} from "~/configurations/transformation/BaseTransformationConfig";
import {TransformationTypes} from "~/enumerates/TransformationTypes";
import {NButton} from "naive-ui";
import {useConfirmationDialog} from "~/composables/useConfirmationDialog";
import {useConfirmableAction} from "~/composables/useConfirmableAction";

export const useMaterialTransformation = (
    type: number,
    materials: MaterialCollection
) => {

    const message = useMessage()
    const notification = useNotification()
    const {showConfirmationDialog} = useConfirmationDialog()
    const {confirmableAction} = useConfirmableAction()

    const materialTransformationStore = useMaterialTransformationStore()
    const {resultMaterials, selectedMaterials} = materialTransformationStore

    const materialLibraryStore = useMaterialLibraryStore()

    const {cutMaterial} = useMaterialCut()

    const {
        selectJoinedMaterial,
        selectAngleMaterial,
    } = useMaterialSelection()

    const showSourceMaterialCutFormModal = ref(false)
    const showSelectedMaterialCutFormModal = ref(false)
    const showResultMaterialSettingsModal = ref(false)

    const selectedSourceMaterial = ref<Material | null>(null)
    const selectedSelectedMaterial = ref<Material | null>(null)
    const selectedResultMaterial = ref<Material | null>(null)

    const config = {
        1: CUT_TRANSFORMATION_CONFIG,
        2: JOIN_TRANSFORMATION_CONFIG,
        3: ANGLE_TRANSFORMATION_CONFIG,
        default: CUT_TRANSFORMATION_CONFIG
    }[type]

    //TODO: заменить хардкод на константы
    const filteredMaterials = computed(() => {

        if (type === 1) {
            return materials.filterAvailableForCut()
        } else if (type === 2) {
            return materials.filterAvailableForJoin(selectedMaterials.getFirst()?.cut_from ?? undefined)
        } else if (type === 3) {
            return materials.filterAvailableForAngle(
                selectedMaterials.filterPiles().getFirst()?.cut_from ?? undefined,
                selectedMaterials.filterAngularElements().getFirst()?.cut_from ?? undefined,
            )
        } else if (type === 4) {
            return materials.filterAvailableForWedge()
        } else if (type === 5) {
            return materials.filterAvailableForBeam()
        } else if (type === 6) {
            return materials.filterAvailableForAngleSplit()
        } else if (type === 7) {
            return materials.filterAvailableForBeamSplit()
        } else if (type === 8) {
            return materials.filterAvailableForBeam()
        } else if (type === 9) {
            return materials.filterAvailableForSupport()
        }
    })

    const previewResultMaterial = computed(() => {


        if (type === 2) {
            const firstMaterial = selectedMaterials.getFirst()
            if (!firstMaterial) return null

            if ((selectedMaterials.getFirst()?.isJoined && firstMaterial.isPile) || firstMaterial.isBeam || firstMaterial.isStraightSeamPipe) {

                const joinedMaterial = _.cloneDeep(firstMaterial)
                joinedMaterial.quantity = selectedMaterials.getTotalAmountQuantity()
                joinedMaterial.amount = 1

                return joinedMaterial
            } else {

                const joinedMaterial = selectJoinedMaterial(firstMaterial)

                if (!joinedMaterial) return null

                joinedMaterial.quantity = selectedMaterials.getTotalAmountQuantity()
                joinedMaterial.amount = 1

                return joinedMaterial


            }
        } else if (type === 3) {

            const angleMaterial = selectAngleMaterial(
                selectedMaterials.filterPiles()?.getFirst() ?? undefined,
                selectedMaterials.filterAngularElements().getFirst() ?? undefined
            )

            if (!angleMaterial) return null

            angleMaterial.quantity = selectedMaterials.filterPiles()?.getFirst().quantity
            angleMaterial.amount = 1

            return angleMaterial

        } else {
            return null
        }
    })

    const materialCutFormModeIsSplit = computed(() => [2].includes(type))

    const sourceMaterialContextMenuItems = computed(() => {
        return [
            {
                label: 'Разделить',
                key: 'cut',
                disabled: (item: Material) => item.isZeroed,
                action: (item: Material) => sourceMaterialClick(item.uuid)
            },
            {
                label: 'Восстановить',
                key: 'restore',
                disabled: (item: Material) => !item.isChanged,
                action: (item: Material) => restoreSourceMaterial(item)
            }
        ]
    })

    const selectedMaterialContextMenuItems = computed(() => {
        return [
            {
                label: 'Разделить',
                key: 'cut',
                action: (item: Material) => sourceMaterialClick(item.uuid)
            },
            {
                label: 'Удалить',
                key: 'remove',
                disabled: (item: Material) => !item.cut_operation_uuid,
                action: (item: Material) => removeSelectedMaterial(item)
            }
        ]
    })

    const previewResultMaterialContextMenuItems = computed(() => {
        return [
            {
                label: 'Отменить',
                key: 'cancel',
                action: (item: Material) => removeAllSelectedMaterials()
            }
        ]
    })

    //main material methods
    const sourceMaterialClick = (materialUuid: string) => {

        const material = materials.findByUuidOrFail(materialUuid)

        if (!allowActionsWithSourceMaterial(material)) {
            return false
        }

        selectedSourceMaterial.value = material

        handleShowSourceMaterialCutForm()
    }

    const sourceMaterialDoubleClick = (materialUuid: string) => {

        if (type === 1) return

        const material = materials.findByUuidOrFail(materialUuid)

        if (!allowActionsWithSourceMaterial(material)) {
            return false
        }

        selectedSourceMaterial.value = material

        submitSourceMaterialCut({
            quantity: material.quantity,
            amount: 1,
            cutType: 'standard'
        })
    }

    const submitSourceMaterialCut = (cutParams: CutParams) => {

        if (!selectedSourceMaterial.value) {
            message.error('Не удалось определить выбранный материал')
            return
        }

        if (type === 2 && !selectedSourceMaterial.value.isJoined && selectedSourceMaterial.value.isPile) {
            if (!selectJoinedMaterial(selectedSourceMaterial.value)) {
                message.error('У материала нет стыкованного варианта')
                return
            }
        } else if (type === 3) {

            if (selectedSourceMaterial.value.isPile) {
                if (!selectAngleMaterial(selectedSourceMaterial.value)) {
                    message.error('В системе нет такого материала с угловым вариантом.')
                    return
                }
            } else {
                if (!selectAngleMaterial(selectedMaterials.filterPiles()?.getFirst() ?? undefined, selectedSourceMaterial.value)) {
                    message.error('В системе нет варианта выбранного материала с таким замком.')
                    return
                }
            }
        }

        try {

            const result = cutMaterial(
                selectedSourceMaterial.value as Material,
                cutParams.quantity,
                cutParams.amount,
                cutParams.cutType
            )

            if (result) {
                processCutSourceMaterial(result)
            } else {
                console.error('Произошла ошибка. Не удалось разделить материал.')
            }

        } catch (e: any) {
            message.error(e.message)
            console.error(e)
        }
    }

    const restoreSourceMaterial = (material: Material, needConfirm: boolean = true) => {
        confirmableAction(
            {
                title: 'Подтверждение',
                content: 'Вы уверены, что хотите восстановить значения материала? Отделенные части материала будут удалены.',
            },
            () => {
                material.resetToInitialValues()
                selectedMaterials.removeByCutFrom(material.uuid)
            }
        )
        // useConfirmableAction()
        // showConfirmationDialog({
        //     title: 'Подтверждение',
        //     content: 'Вы уверены, что хотите восстановить значения материала? Отделенные части материала будут удалены.',
        //     onConfirm: () => {
        //         material.resetToInitialValues()
        //         selectedMaterials.removeByCutFrom(material.uuid)
        //     }
        // })
    }

    const removeAllSelectedMaterials = () => {
        // Создаем копию массива, чтобы избежать проблем при модификации коллекции во время итерации
        const materialsToRemove = [...selectedMaterials.getAll()]
        materialsToRemove.forEach((material: Material) => {
            console.log(material)
            removeSelectedMaterial(material, false)
        })
    }

    const removeSelectedMaterial = (material: Material, needConfirm: boolean = true) => {

        if (!material.cut_operation_uuid) {
            message.error('Не удалось определить операцию резки материала')
            return
        }

        if (needConfirm) {
            showConfirmationDialog({
                title: 'Подтверждение',
                content: 'Вы уверены, что хотите удалить отделенную часть материала. Вместе с ней будут удалены все части, образованные в процессе резки',
                storageKey: 'confirma-remove-transformation-seleted-material',
                onConfirm: () => {
                    if (!material.cut_operation_uuid || !material.cut_from) return

                    const originalMaterial = materials.findByUuidOrFail(material.cut_from)

                    const parts = selectedMaterials.filterByCutOperationUuid(material.cut_operation_uuid)

                    originalMaterial.resetByParts(parts.getAll())
                    selectedMaterials.removeByCutOperationUuid(material.cut_operation_uuid)
                }
            })
        } else {
            if (!material.cut_operation_uuid || !material.cut_from) return

            const originalMaterial = materials.findByUuidOrFail(material.cut_from)

            const parts = selectedMaterials.filterByCutOperationUuid(material.cut_operation_uuid)

            originalMaterial.resetByParts(parts.getAll())
            selectedMaterials.removeByCutOperationUuid(material.cut_operation_uuid)
        }

    }

    //selected materials methods
    const selectedMaterialClick = (materialUuid: string) => {

        if (type === 1) {
            resultMaterialClick(materialUuid)
            return
        }

        selectedSelectedMaterial.value = selectedMaterials.findByUuidOrFail(materialUuid)
        handleShowSelectedMaterialCutForm()
    }

    const selectedMaterialDoubleClick = (materialUuid: string) => {
        console.log(materialUuid)
    }

    const submitSelectedMaterialCut = (cutParams: CutParams) => {
        if (!selectedSelectedMaterial.value) {
            message.error('Не удалось определить выбранный материал')
            return
        }


        const result = cutMaterial(
            selectedSelectedMaterial.value as Material,
            cutParams.quantity,
            cutParams.amount,
            cutParams.cutType
        )

        if (result) {
            processCutSelectedMaterial(result)
        } else {
            console.error('Произошла ошибка. Не удалось разделить материал.')
        }
    }

    const resultMaterialClick = (resultUuid: string) => {

        if (type === 1) {
            const resultMaterial = selectedMaterials.findByUuidOrFail(resultUuid)
            selectedResultMaterial.value = resultMaterial
        }

        showResultMaterialSettingsModal.value = true
    }

    const previewResultMaterialClick = () => {
        console.log(previewResultMaterial.value)
    }

    //ui handlers
    const handleShowSourceMaterialCutForm = () => {
        showSourceMaterialCutFormModal.value = true
    }

    const handleShowSelectedMaterialCutForm = () => {
        showSelectedMaterialCutFormModal.value = true
    }

    //utils
    const processCutSourceMaterial = (result: CutMaterialResult) => {

        if (!selectedMaterials) {
            console.error('selectedMaterials.value is null')
            return
        }

        const {result: resultMaterial, remainder, unusedPart} = result


        if (resultMaterial) {
            selectedMaterials.add(resultMaterial)
        }

        if (remainder && remainder.length > 0 && selectedSourceMaterial.value) {

            if ([1].includes(type)) {
                selectedMaterials.addAfter(resultMaterial.uuid, result.remainder)
            } else {
                selectedMaterials.addAfter(selectedSourceMaterial.value.uuid, remainder)
            }
        }

        if (unusedPart && selectedSourceMaterial.value) {
            materials.replaceByUuid(selectedSourceMaterial.value?.uuid, unusedPart)
        }
    }

    const processCutSelectedMaterial = (result: CutMaterialResult) => {

        if (!selectedMaterials) {
            console.error('selectedMaterials.value is null')
            return
        }

        const {result: resultMaterial, remainder, unusedPart} = result


        if (resultMaterial) {
            selectedMaterials.add(resultMaterial)
        }

        if (remainder && remainder.length > 0 && selectedSelectedMaterial.value) {

            if ([1].includes(type)) {
                selectedMaterials.addAfter(resultMaterial.uuid, result.remainder)
            } else {
                selectedMaterials.addAfter(selectedSourceMaterial.value.uuid, remainder)
            }
        }

        if (unusedPart && selectedSourceMaterial.value) {
            if (!unusedPart.isZeroed) {
                selectedMaterials.replaceByUuid(selectedSelectedMaterial.value?.uuid, unusedPart)
            } else {
                selectedMaterials.removeByUuid(selectedSelectedMaterial.value?.uuid)
            }
        }
    }

    const allowActionsWithSourceMaterial = (material: Material) => {
        if (type === 3) {

            if (material.isAngularElement && selectedMaterials.filterPiles().getCount() === 2) {
                message.error('Материал укомплектован, уберите шпунт чтобы добавить угловой элемент')
                return false
            }

            if (material.isPile && selectedMaterials.filterPiles().getCount() === 1) {

                const range = [material.quantity - 0.1, material.quantity + 0.1]

                if (range[0] > selectedMaterials.filterPiles().getTotalAmountQuantity() || range[1] < selectedMaterials.filterPiles().getTotalAmountQuantity()) {
                    const n = notification.warning({
                        title: 'Информация',
                        content: 'Для изготовления углового шпунта необходимо использовать материалы одинаковой длины (±10см). Предварительно проведите операцию стыковки или резки',
                        action: () =>
                            h(
                                NButton,
                                {
                                    text: true,
                                    type: 'success',
                                    onClick: () => {
                                        n.destroy()
                                    }
                                },
                                {
                                    default: () => 'Понятно'
                                }
                            ),
                        onClose: () => {
                            message.warning('Подтвердите ознакомление с информацией')
                            return false
                        }
                    })
                    return false
                }
            }

            const pileQuantity = selectedMaterials.filterPiles().getTotalAmountQuantity()
            const angleQuantity = selectedMaterials.filterAngularElements().getTotalAmountQuantity()

            console.log(pileQuantity, angleQuantity)

            if (selectedMaterials.getCount() === 2) return false
        }

        return true
    }

    const allowToUse = (material: Material): boolean => {
        return false
    }


    return {
        filteredMaterials,
        selectedSourceMaterial,
        selectedResultMaterial,
        materialCutFormModeIsSplit,
        showSourceMaterialCutFormModal,
        showSelectedMaterialCutFormModal,
        showResultMaterialSettingsModal,
        resultMaterials,
        selectedMaterials,
        previewResultMaterial,
        selectedSelectedMaterial,

        submitSelectedMaterialCut,
        sourceMaterialClick,
        selectedMaterialClick,
        sourceMaterialDoubleClick,
        selectedMaterialDoubleClick,
        submitSourceMaterialCut,
        handleShowSourceMaterialCutForm,
        previewResultMaterialClick,

        allowToUse,

        sourceMaterialContextMenuItems,
        selectedMaterialContextMenuItems,
        previewResultMaterialContextMenuItems
    }
}