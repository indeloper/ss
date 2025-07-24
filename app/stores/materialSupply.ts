import {MaterialCollection} from "~/models/collections/MaterialCollection";
import type {Material} from "~/models/Material";
import {useMaterialSupply} from "~/composables/useMaterialSupply";
import {useMessage} from 'naive-ui';

export const useMaterialSupplyStore = defineStore('materialSupply', () => {
    const materials = ref<MaterialCollection>(new MaterialCollection())
    const departureAt = ref<number | null>(Date.now())
    const operationReasonId = ref<number | null>(null)
    const toProjectObjectId = ref<number | null>(useProjectObjectsStore().selectedProjectObjectId)
    const toResponsibleUserId = ref<number | null>(useSanctum().user.value?.id)
    const contractorId = ref<number | null>(null)
    const files = ref<File[]>([])
    const ttn = ref<string | null>(null)
    const comment = ref<string | null>(null)

    const submit = async () => {
        const formData = new FormData();
        formData.append('to_project_object_id', String(toProjectObjectId.value));
        formData.append('to_responsible_user_id', String(toResponsibleUserId.value));
        formData.append('departure_at', new Date(departureAt.value!).toISOString());
        formData.append('ttn', ttn.value!);
        formData.append('operation_reason_id', String(operationReasonId.value));
        formData.append('comment', comment.value || '');
        formData.append('contractor_id', String(contractorId.value));

        // Добавляем материалы как массив через FormData
        materials.value.getAll().forEach((material: Material, index: number) => {
            formData.append(`materials[${index}][amount]`, String(material.amount));
            formData.append(`materials[${index}][quantity]`, String(material.quantity));
            formData.append(`materials[${index}][id]`, String(material.material_standard.id));
        });

        // files.value.forEach((file) => {
        //     formData.append('files[]', file);
        // });

        try {
            const result = await useMaterialSupply().store(formData);
            return { success: true, data: result };
        } catch (error: any) {
            console.error('Ошибка при отправке поставки:', error);
            return { 
                success: false, 
                error: error?.response?.data || error?.message || 'Произошла неизвестная ошибка' 
            };
        }
    }

    const resetForm = () => {
        materials.value = new MaterialCollection();
        departureAt.value = Date.now();
        operationReasonId.value = null;
        contractorId.value = null;
        files.value = [];
        ttn.value = null;
        comment.value = null;
    }

    return {
        materials,
        departureAt,
        operationReasonId,
        toProjectObjectId,
        toResponsibleUserId,
        contractorId,
        files,
        ttn,
        comment,
        submit,
        resetForm,
    }
})