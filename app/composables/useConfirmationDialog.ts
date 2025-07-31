import { ref } from 'vue'
import { NCheckbox } from 'naive-ui'

export interface ConfirmationDialogOptions {
    title: string
    content: string
    positiveText?: string
    negativeText?: string
    onConfirm: () => void
    storageKey?: string
}

export const useConfirmationDialog = () => {
    const dialog = useDialog()

    const showConfirmationDialog = (options: ConfirmationDialogOptions) => {
        const {
            title,
            content,
            positiveText = 'Подтвердить',
            negativeText = 'Отмена',
            onConfirm,
            storageKey
        } = options

        if (!storageKey) {
            dialog.warning({
                title,
                content,
                positiveText,
                negativeText,
                draggable: true,
                onPositiveClick: onConfirm
            })
            return
        }

        const currentCount = parseInt(localStorage.getItem(storageKey) || '0')
        const newCount = currentCount + 1
        
        localStorage.setItem(storageKey, newCount.toString())

        const dontShowKey = `${storageKey}-dont-show`
        const dontShow = localStorage.getItem(dontShowKey) === 'true'
        
        if (dontShow) {
            onConfirm()
            return
        }

        const showCheckbox = newCount >= 3
        const dontShowAgain = ref(false)

        const dialogContent = showCheckbox 
            ? h('div', [
                h('p', { style: { marginBottom: '12px' } }, content),
                h(NCheckbox, {
                    'onUpdate:checked': (value: boolean) => {
                        dontShowAgain.value = value
                    },
                    'modelValue:checked': (value: boolean) => {
                        dontShowAgain.value = value
                    }
                }, {
                    default: () => 'Не показывать больше'
                })
            ])
            : content

        dialog.warning({
            title,
            content: () => dialogContent,
            positiveText,
            negativeText,
            draggable: true,
            onPositiveClick: () => {
                if (showCheckbox && dontShowAgain.value) {
                    localStorage.setItem(dontShowKey, 'true')
                }
                onConfirm()
            }
        })
    }

    return {
        showConfirmationDialog
    }
}
