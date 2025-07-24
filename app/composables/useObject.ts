import {useApi} from "~/composables/useApi"
import {ProjectObjectCollection} from "~/models/collections/ProjectObjectCollection"
import {ProjectObjectAdapter} from "~/models/adapters/ProjectObjectAdapter"

export const useObject = () => {
    const fetchWith = async (): Promise<ProjectObjectCollection> => {
        const response = await useApi().get('/project-objects?filter[is_participates_in_material_accounting]=1')
        
        const transformedData = ProjectObjectAdapter.transformMany(response.data)

        return new ProjectObjectCollection(transformedData)
    }

    return {
        fetchWith
    }
}