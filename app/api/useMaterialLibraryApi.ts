import {useApi} from '~/composables/useApi'
import {useIndexedDB} from '~/composables/useIndexedDB'
import type {ApiOptions} from '~/types/api'
import {CACHE_TTL} from '~/constants/cache'

export const useMaterialLibraryApi = () => {
    const {setCache, getCache, isSupported} = useIndexedDB()

    const fetchMaterialStandardsFromServer = async (options: ApiOptions = {}) => {
        const cacheKey = 'materialStandards'
        
        if (!options.forceRefresh && isSupported()) {
            const cached = await getCache(cacheKey)
            if (cached) {
                return cached
            }
        }

        const api = useApi()
        const response = await api.get('/library/materials/standards')
        
        if (isSupported()) {
            await setCache(cacheKey, response.data, {ttl: CACHE_TTL})
        }
        
        return response.data
    }

    const fetchMaterialTypesFromServer = async (options: ApiOptions = {}) => {
        const cacheKey = 'materialTypes'
        
        if (!options.forceRefresh && isSupported()) {
            const cached = await getCache(cacheKey)
            if (cached) {
                return cached
            }
        }

        const api = useApi()
        const response = await api.get('/library/materials/types')
        
        if (isSupported()) {
            await setCache(cacheKey, response.data, {ttl: CACHE_TTL})
        }
        
        return response.data
    }

    const fetchMaterialBrandsFromServer = async (options: ApiOptions = {}) => {
        const cacheKey = 'materialBrands'
        
        if (!options.forceRefresh && isSupported()) {
            const cached = await getCache(cacheKey)
            if (cached) {
                return cached
            }
        }

        const api = useApi()
        const response = await api.get('/library/materials/brands')
        
        if (isSupported()) {
            await setCache(cacheKey, response.data, {ttl: CACHE_TTL})
        }
        
        return response.data
    }

    const fetchMaterialUnitsFromServer = async (options: ApiOptions = {}) => {
        const cacheKey = 'materialUnits'
        
        if (!options.forceRefresh && isSupported()) {
            const cached = await getCache(cacheKey)
            if (cached) {
                return cached
            }
        }

        const api = useApi()
        const response = await api.get('/library/materials/units')
        
        if (isSupported()) {
            await setCache(cacheKey, response.data, {ttl: CACHE_TTL})
        }
        
        return response.data
    }

    const fetchMaterialPropertiesFromServer = async (options: ApiOptions = {}) => {
        const cacheKey = 'materialProperties'
        
        if (!options.forceRefresh && isSupported()) {
            const cached = await getCache(cacheKey)
            if (cached) {
                return cached
            }
        }

        const api = useApi()
        const response = await api.get('/library/materials/properties')
        
        if (isSupported()) {
            await setCache(cacheKey, response.data, {ttl: CACHE_TTL})
        }
        
        return response.data
    }

    const createMaterialTypeOnServer = async (data: any) => {
        const api = useApi()
        const requestData = {
            ...data,
        }

        const response = await api.post('/library/materials/types', requestData)
        return response.data
    }

    const updateMaterialTypeOnServer = async (id: number, data: any) => {
        const api = useApi()
        const requestData = {
            ...data
        }

        const response = await api.put(`/library/materials/types/${id}`, requestData)
        return response.data
    }

    const createMaterialPropertyOnServer = async (data: any) => {
        const api = useApi()
        const response = await api.post('/library/materials/properties', data)
        return response.data
    }

    const updateMaterialPropertyOnServer = async (id: number, data: any) => {
        const api = useApi()
        const response = await api.put(`/library/materials/properties/${id}`, data)
        return response.data
    }

    return {
        fetchMaterialStandardsFromServer,
        fetchMaterialTypesFromServer,
        fetchMaterialBrandsFromServer,
        fetchMaterialUnitsFromServer,
        fetchMaterialPropertiesFromServer,
        createMaterialTypeOnServer,
        updateMaterialTypeOnServer,
        createMaterialPropertyOnServer,
        updateMaterialPropertyOnServer
    }
}