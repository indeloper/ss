import {MaterialCollection} from "~/models/collections/MaterialCollection";
import type {Material} from "~/models/Material";
import {useMaterialSupply} from "~/composables/useMaterialSupply";

export const useMaterialTransformationStore = defineStore('materialTransformation', () => {
    const resultMaterials = ref<MaterialCollection>(new MaterialCollection())
    const selectedMaterials = ref<MaterialCollection>(new MaterialCollection())
    const toProjectObjectId = ref<number | null>(useProjectObjectsStore().selectedProjectObjectId)
    const toResponsibleUserId = ref<number | null>(useSanctum().user.value?.id)
    const comment = ref<string | null>(null)
    const departureAt = ref<number | null>(Date.now())
    const type = ref<number>(1)
    const usedMaterials = ref<MaterialCollection>(new MaterialCollection())

    const clearMaterials = () => {
        resultMaterials.value = new MaterialCollection()
        selectedMaterials.value = new MaterialCollection()
        usedMaterials.value = new MaterialCollection()
    }

    const resetForm = () => {
        clearMaterials()
        toProjectObjectId.value = useProjectObjectsStore().selectedProjectObjectId
        toResponsibleUserId.value = useSanctum().user.value?.id
        comment.value = null
        departureAt.value = Date.now()
    }

    const submit = async () => {

        const submitData = {
            to_project_object_id: toProjectObjectId.value,
            to_responsible_user_id: toResponsibleUserId.value,
            departure_at: new Date(departureAt.value!).toISOString(),
            transformation_type_id: type.value,
            comment: comment.value || '',
            materials_after_transform: resultMaterials.value.getAll().map((material: Material) => ({
                id: material.material_standard.id,
                amount: material.amount,
                quantity: material.quantity,
            })),
            materials_to_transform: usedMaterials.value.getAll().map((material: Material) => {
                const used = material.cloneWithUsedAmounts()
                return {
                    id: used.id,
                    amount: used.amount,
                    quantity: used.quantity,
                }
            }),
            materials_remains: []
        }

        try {
            const result = await useMaterialTransformation().store(submitData);
            return { success: true, data: result };
        } catch (error: any) {
            console.error('Ошибка при отправке данных изготовления:', error);
            return {
                success: false,
                error: error?.response?.data || error?.message || 'Произошла неизвестная ошибка'
            };
        }
    }

    return {
        type,
        resultMaterials,
        selectedMaterials,
        clearMaterials,
        toProjectObjectId,
        toResponsibleUserId,
        comment,
        departureAt,
        submit,
        resetForm,
        usedMaterials
    }
})