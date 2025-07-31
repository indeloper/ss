import { createDiscreteApi } from 'naive-ui'

let discreteApi: ReturnType<typeof createDiscreteApi> | null = null

export const getNaiveApi = () => {
    if (process.client && !discreteApi) {
        discreteApi = createDiscreteApi(['loadingBar', 'message', 'notification', 'dialog'])
    }
    return discreteApi
}

export const useLoadingBarSafe = () => {
    const start = () => {
        if (process.client) {
            const api = getNaiveApi()
            api?.loadingBar.start()
        }
    }

    const finish = () => {
        if (process.client) {
            const api = getNaiveApi()
            api?.loadingBar.finish()
        }
    }

    const error = () => {
        if (process.client) {
            const api = getNaiveApi()
            api?.loadingBar.error()
        }
    }

    return {
        start,
        finish,
        error
    }
}