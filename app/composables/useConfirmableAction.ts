import {type ConfirmationDialogOptions, useConfirmationDialog} from "~/composables/useConfirmationDialog";

const {showConfirmationDialog} = useConfirmationDialog()

export const useConfirmableAction = () => {
    const confirmableAction = (options: ConfirmationDialogOptions, action: () => void) => {
        showConfirmationDialog({
            ...options,
            onConfirm: action
        })
    }

    return {
        confirmableAction
    }
}