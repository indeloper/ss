export const useNaiveUI = () => {
    const nuxtApp = useNuxtApp()

    const loadingBar = {
        start: () => {
            if (process.client && nuxtApp.$naiveLoadingBar) {
                nuxtApp.$naiveLoadingBar.start()
            }
        },
        finish: () => {
            if (process.client && nuxtApp.$naiveLoadingBar) {
                nuxtApp.$naiveLoadingBar.finish()
            }
        },
        error: () => {
            if (process.client && nuxtApp.$naiveLoadingBar) {
                nuxtApp.$naiveLoadingBar.error()
            }
        }
    }

    return {
        loadingBar,
        message: nuxtApp.$naiveMessage,
        notification: nuxtApp.$naiveNotification,
        dialog: nuxtApp.$naiveDialog
    }
}