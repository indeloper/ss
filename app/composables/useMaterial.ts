import { useApi } from "~/composables/useApi"
import { MaterialCollection } from "~/models/collections/MaterialCollection"
import { MaterialAdapter } from "~/models/adapters/MaterialAdapter"
import type { ApiMaterial } from "~/models/interfaces"

export const useMaterial = () => {
    const fetchMaterialsByProjectObjectId = async (projectObjectId: number): Promise<{ active: MaterialCollection, reserve: MaterialCollection }> => {
        const response = await useApi().get(`/project-objects/${projectObjectId}/full-materials-with-reserve`)

        const activeMaterials = MaterialAdapter.transformMany(response.data.materials || [])
        const reserveMaterials = MaterialAdapter.transformMany(response.data.reserve || [])

        const activeCollection = new MaterialCollection(activeMaterials)
        const reserveCollection = new MaterialCollection(reserveMaterials)

        return {
            active: activeCollection,
            reserve: reserveCollection
        }
    }

    return {
        fetchMaterialsByProjectObjectId
    }
}