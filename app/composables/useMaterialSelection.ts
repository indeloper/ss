import {Material} from "~/models/Material";
import {useMaterialLibraryStore} from "~/stores/materialLibrary";

export const useMaterialSelection = () => {

    const selectJoinedMaterial = (material: Material) => {

        const materialLibraryStore = useMaterialLibraryStore()

        if (!materialLibraryStore.standards) return null

        const joinedStandard = materialLibraryStore.standards.findJoinedOpposite(material.material_standard.id)
        if (!joinedStandard) return null


        return Material.createFromStandard(joinedStandard)
    }

    const selectAngleMaterial = (pileMaterial: Material, angularMaterial?: Material) => {

        const materialLibraryStore = useMaterialLibraryStore()

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