export const useObjectStore = defineStore('useObjectStore', () => {
    const objects = ref([])

    const loadObjects = async () => {
        await useObject().fetchWith().then((response: any) => {
            console.log(response)
        })
    }

    return {
        objects,
        loadObjects
    }
})
