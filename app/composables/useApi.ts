import {useSanctumFetch} from '#imports'

export const useApi = () => {
    const get = async (route: string, options = {}) => {
        return await useSanctumFetch(route, {method: 'GET', ...options})
    }

    const post = async (route: string, body?: any, options: any = {}) => {
        return await useSanctumFetch(route, {method: 'POST', body, ...options})
    }

    const put = async (route: string, body: any, options = {}) => {
        return await useSanctumFetch(route, {method: 'PUT', body, ...options})
    }

    const destroy = async (route: string, options = {}) => {
        return await useSanctumFetch(route, {method: 'DELETE', ...options})
    }

    return {
        get,
        post,
        put,
        destroy
    }
}