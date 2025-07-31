import {useSanctumFetch} from '#imports'
import {useNaiveUI} from "~/composables/useNaiveUI";

export const useApi = () => {
    const get = async (route: string, options = {}) => {
         const loadingBar  = useLoadingBarSafe()

        loadingBar.start()
        const r = await useSanctumFetch(route, {method: 'GET', ...options})
        loadingBar.finish()

        return r
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