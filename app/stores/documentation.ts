export const useDocumentationStore = defineStore('documentation', () => {
    const showDocumentation = ref(false)
    const documentationKey = ref<string | null>(null)

    const show = (key: string) => {
        documentationKey.value = key
        showDocumentation.value = true
    }

    const close = () => {
        documentationKey.value = null
        showDocumentation.value = false
    }

    return {
        showDocumentation,
        documentationKey,
        show,
        close
    }
})