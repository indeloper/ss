import {Material} from "~/models/Material";
import {useMaterialLibraryStore} from "~/stores/materialLibrary";

export const useMaterialSelection = () => {

    const materialLibraryStore = useMaterialLibraryStore()

    const selectJoinedMaterial = (material: Material) => {
        if (!materialLibraryStore.standards) return null

        const joinedStandard = materialLibraryStore.standards.findJoinedOpposite(material.material_standard.id)
        if (!joinedStandard) return null


        return Material.createFromStandard(joinedStandard)
    }

    const selectAngleMaterial = (pileMaterial: Material, angularMaterial?: Material) => {
        if (!materialLibraryStore.standards) return null

        if (!pileMaterial) return undefined

        const angleStandard = materialLibraryStore
            .standards
            .findAngleOpposite(
                pileMaterial.material_standard.id,
                angularMaterial?.material_standard.id ?? undefined
            )

        if (!angleStandard) return null

        return Material.createFromStandard(angleStandard)
    }


    return {
        selectJoinedMaterial,
        selectAngleMaterial,
    }
}