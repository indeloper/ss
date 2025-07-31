import { ref } from 'vue'
import { NButton } from 'naive-ui'
import { useNotification } from 'naive-ui'
import { h } from 'vue'

interface NotificationPresetOptions {
    title: string
    content: string
    type?: 'info' | 'success' | 'warning' | 'error'
    duration?: number
    storageKey?: string
}

export const useNotificationPreset = () => {
    const notification = useNotification()

    const showNotificationPreset = (options: NotificationPresetOptions) => {
        const {
            title,
            content,
            type = 'info',
            duration = 4500,
            storageKey
        } = options

        // Если ключ не указан, показываем обычное уведомление
        if (!storageKey) {
            notification[type]({
                title,
                content,
                duration
            })
            return
        }

        // Получаем текущий счетчик из localStorage
        const currentCount = parseInt(localStorage.getItem(storageKey) || '0')
        const newCount = currentCount + 1
        
        // Увеличиваем счетчик
        localStorage.setItem(storageKey, newCount.toString())

        // Проверяем, нужно ли показывать уведомление
        const dontShowKey = `${storageKey}-dont-show`
        const dontShow = localStorage.getItem(dontShowKey) === 'true'
        
        if (dontShow) {
            // Если пользователь отключил показ, не показываем уведомление
            return
        }

        // Показываем уведомление с кнопкой "не показывать больше" после 3 показов
        const showDontShowButton = newCount >= 3

        if (showDontShowButton) {
            const n = notification[type]({
                title,
                content,
                action: () =>
                    h('div', { style: { display: 'flex', gap: '8px', marginTop: '8px' } }, [
                        h(NButton, {
                            size: 'small',
                            type: 'primary',
                            ghost: true,
                            onClick: () => {
                                localStorage.setItem(dontShowKey, 'true')
                                n.destroy()
                            }
                        }, {
                            default: () => 'Не показывать больше'
                        }),
                        h(NButton, {
                            size: 'small',
                            onClick: () => {
                                n.destroy()
                            }
                        }, {
                            default: () => 'Закрыть'
                        })
                    ]),
                duration: 0, // Не закрывается автоматически
                closable: true
            })
        } else {
            notification[type]({
                title,
                content,
                duration
            })
        }
    }

    // Предустановленные уведомления
    const showMaterialLengthWarning = () => {
        showNotificationPreset({
            title: 'Информация',
            content: 'Для изготовления углового шпунта необходимо использовать материалы одинаковой длины (±10см). Предварительно проведите операцию стыковки или резки',
            type: 'warning',
            duration: 6000,
            storageKey: 'material-length-warning'
        })
    }

    const showMaterialCompleteWarning = () => {
        showNotificationPreset({
            title: 'Предупреждение',
            content: 'Материал укомплектован, уберите шпунт чтобы добавить угловой элемент',
            type: 'warning',
            storageKey: 'material-complete-warning'
        })
    }

    const showCutOperationSuccess = () => {
        showNotificationPreset({
            title: 'Успешно',
            content: 'Операция разделения материала выполнена успешно',
            type: 'success',
            storageKey: 'cut-operation-success'
        })
    }

    const showJoinOperationSuccess = () => {
        showNotificationPreset({
            title: 'Успешно',
            content: 'Операция стыковки материалов выполнена успешно',
            type: 'success',
            storageKey: 'join-operation-success'
        })
    }

    return {
        showNotificationPreset,
        showMaterialLengthWarning,
        showMaterialCompleteWarning,
        showCutOperationSuccess,
        showJoinOperationSuccess
    }
}