import { createDiscreteApi } from 'naive-ui'

export default defineNuxtPlugin(() => {
    let discreteApi: ReturnType<typeof createDiscreteApi> | null = null

    const getDiscreteApi = () => {
        if (!discreteApi && process.client) {
            try {
                discreteApi = createDiscreteApi([
                    'loadingBar',
                    'message',
                    'notification',
                    'dialog'
                ])
            } catch (error) {
                console.warn('Failed to initialize Naive UI discrete API:', error)
                return null
            }
        }
        return discreteApi
    }

    return {
        provide: {
            naiveLoadingBar: {
                start: () => getDiscreteApi()?.loadingBar?.start(),
                finish: () => getDiscreteApi()?.loadingBar?.finish(),
                error: () => getDiscreteApi()?.loadingBar?.error()
            },
            naiveMessage: {
                info: (content: string) => getDiscreteApi()?.message?.info(content),
                success: (content: string) => getDiscreteApi()?.message?.success(content),
                warning: (content: string) => getDiscreteApi()?.message?.warning(content),
                error: (content: string) => getDiscreteApi()?.message?.error(content)
            },
            naiveNotification: {
                info: (options: any) => getDiscreteApi()?.notification?.info(options),
                success: (options: any) => getDiscreteApi()?.notification?.success(options),
                warning: (options: any) => getDiscreteApi()?.notification?.warning(options),
                error: (options: any) => getDiscreteApi()?.notification?.error(options)
            },
            naiveDialog: {
                info: (options: any) => getDiscreteApi()?.dialog?.info(options),
                success: (options: any) => getDiscreteApi()?.dialog?.success(options),
                warning: (options: any) => getDiscreteApi()?.dialog?.warning(options),
                error: (options: any) => getDiscreteApi()?.dialog?.error(options)
            }
        }
    }
})