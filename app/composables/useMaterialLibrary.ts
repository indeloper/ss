import {useMaterialLibraryApi} from '~/api/useMaterialLibraryApi'
import {MaterialStandardAdapter} from '~/models/adapters/MaterialStandardAdapter'
import {MaterialTypeAdapter} from '~/models/adapters/MaterialTypeAdapter'
import {MaterialBrandAdapter} from '~/models/adapters/MaterialBrandAdapter'
import {MaterialUnitAdapter} from '~/models/adapters/MaterialUnitAdapter'
import {MaterialPropertyAdapter} from '~/models/adapters/MaterialPropertyAdapter'
import {MaterialStandardCollection} from '~/models/collections/MaterialStandardCollection'
import {MaterialTypeCollection} from '~/models/collections/MaterialTypeCollection'
import {MaterialBrandCollection} from '~/models/collections/MaterialBrandCollection'
import {MaterialUnitCollection} from '~/models/collections/MaterialUnitCollection'
import {MaterialPropertyCollection} from '~/models/collections/MaterialPropertyCollection'
import type {ApiOptions} from '~/types/api'

export const useMaterialLibrary = () => {
    const {
        fetchMaterialStandardsFromServer,
        fetchMaterialTypesFromServer,
        fetchMaterialBrandsFromServer,
        fetchMaterialUnitsFromServer,
        fetchMaterialPropertiesFromServer,
        createMaterialTypeOnServer,
        updateMaterialTypeOnServer
    } = useMaterialLibraryApi()

    const fetchAllMaterialStandardsLibrary = async (options: ApiOptions = {}) => {
        const data = await fetchMaterialStandardsFromServer(options)
        return new MaterialStandardCollection(MaterialStandardAdapter.transformMany(data))
    }

    const fetchAllMaterialTypesLibrary = async (options: ApiOptions = {}) => {
        const data = await fetchMaterialTypesFromServer(options)
        return new MaterialTypeCollection(MaterialTypeAdapter.transformMany(data))
    }

    const fetchAllMaterialBrandsLibrary = async (options: ApiOptions = {}) => {
        const data = await fetchMaterialBrandsFromServer(options)
        return new MaterialBrandCollection(MaterialBrandAdapter.transformMany(data))
    }

    const fetchAllMaterialUnitsLibrary = async (options: ApiOptions = {}) => {
        const data = await fetchMaterialUnitsFromServer(options)
        return new MaterialUnitCollection(MaterialUnitAdapter.transformMany(data))
    }

    const fetchAllMaterialPropertiesLibrary = async (options: ApiOptions = {}) => {
        const data = await fetchMaterialPropertiesFromServer(options)
        return new MaterialPropertyCollection(MaterialPropertyAdapter.transformMany(data))
    }

    const createMaterialType = async (data: any) => {
        const response = await createMaterialTypeOnServer(data)
        // return fetchAllMaterialTypesLibrary({forceRefresh: true})
    }

    const updateMaterialType = async (id: number, data: any) => {
        const response = await updateMaterialTypeOnServer(id, data)
        // return fetchAllMaterialTypesLibrary({forceRefresh: true})
    }

    return {
        fetchAllMaterialStandardsLibrary,
        fetchAllMaterialTypesLibrary,
        fetchAllMaterialBrandsLibrary,
        fetchAllMaterialUnitsLibrary,
        fetchAllMaterialPropertiesLibrary,
        createMaterialType,
        updateMaterialType
    }
}