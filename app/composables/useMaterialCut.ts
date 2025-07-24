import {Material} from '~/models/Material'
import type {MaterialCollection} from '~/models/collections/MaterialCollection'

export interface CutMaterialResult {
    result: Material;
    remainder: Material[];
    unusedPart: Material | null;
}

export type CutType = 'standard' | 'equal';

export const useMaterialCut = () => {

    const cutOnePart = (
        material: Material,
    ): CutMaterialResult | void => {
        return cutMaterial(material, material.quantity, 1, 'standard');
    };

    const cutMaterial = (
        material: Material,
        cutVolume: number,
        cutQuantity: number,
        cutType: CutType = 'standard'
    ): CutMaterialResult | void => {
        if (!isValidCut(material, cutVolume, cutQuantity, cutType)) {
            console.error('Запрашиваемое количество для резки недопустимо');
            return;
        }

        if (cutType === 'standard') {
            return standardCut(material, cutVolume, cutQuantity);
        } else {
            return equalCut(material, cutVolume, cutQuantity);
        }
    };

    const standardCut = (
        material: Material,
        cutVolume: number,
        cutQuantity: number
    ): CutMaterialResult => {
        const hasFixedVolume = getHasFixedVolume(material);

        // Генерируем единый UUID для всей операции резки
        const operationUuid = material.cut_operation_uuid || crypto.randomUUID();

        const result = material.cloneWithNewParams(cutVolume, cutQuantity, operationUuid);

        let remainder: Material[] = [];
        let unusedPart = null;

        if (hasFixedVolume) {
            const partsFromOneUnit = Math.floor(material.quantity / cutVolume);
            const unitsNeeded = Math.ceil(cutQuantity / partsFromOneUnit);

            if (partsFromOneUnit > 0) {
                const fullUnits = Math.floor(cutQuantity / partsFromOneUnit);
                const remainingParts = cutQuantity % partsFromOneUnit;

                if (fullUnits > 0) {
                    const remainderFromFullUnits = material.quantity - (partsFromOneUnit * cutVolume);
                    if (remainderFromFullUnits > 1e-9) {
                        remainder.push(material.cloneWithNewParams(remainderFromFullUnits, fullUnits, operationUuid));
                    }
                }

                if (remainingParts > 0) {
                    const remainderFromPartialUnit = material.quantity - (remainingParts * cutVolume);
                    if (remainderFromPartialUnit > 1e-9) {
                        remainder.push(material.cloneWithNewParams(remainderFromPartialUnit, 1, operationUuid));
                    }
                }
            }

            if (unitsNeeded < material.amount) {
                unusedPart = material.cloneWithNewParams(material.quantity, material.amount - unitsNeeded, operationUuid, true);
            }
        } else {
            remainder = [];
            const totalCutVolume = cutVolume * cutQuantity;
            const remainingMaterialQuantity = material.quantity * material.amount - totalCutVolume;

            if (remainingMaterialQuantity > 1e-9 && material.amount > 0) {
                unusedPart = material.cloneWithNewParams(remainingMaterialQuantity / material.amount, material.amount, operationUuid, true);
            } else {
                unusedPart = material.cloneWithNewParams(0, 0, operationUuid, true);
            }
        }

        return {
            result,
            remainder,
            unusedPart
        };
    };

    const equalCut = (
        material: Material,
        cutVolume: number,
        cutQuantity: number
    ): CutMaterialResult => {
        // Генерируем единый UUID для всей операции резки
        const operationUuid = material.cut_operation_uuid || crypto.randomUUID();

        const result = material.cloneWithNewParams(cutVolume, cutQuantity, operationUuid);

        let remainder: Material[] = [];
        let unusedPart = null;

        const remainderVolume = material.quantity - cutVolume;
        if (remainderVolume > 1e-9) {
            remainder.push(material.cloneWithNewParams(remainderVolume, cutQuantity, operationUuid));
        }

        if (cutQuantity < material.amount) {
            unusedPart = material.cloneWithNewParams(material.quantity, material.amount - cutQuantity, operationUuid, true);
        }

        return {
            result,
            remainder,
            unusedPart
        };
    };

    const isValidCut = (
        material: Material,
        cutVolume: number,
        cutQuantity: number,
        cutType: CutType
    ): boolean => {
        if (cutVolume < 1e-9 || cutQuantity <= 0) {
            return false;
        }

        const hasFixedVolume = getHasFixedVolume(material);

        if (!hasFixedVolume && cutType === 'equal') {
            console.warn('Равноценная резка не применима для материалов без фиксированного объема.');
            return false;
        }

        if (hasFixedVolume) {
            if (cutVolume > material.quantity + 1e-9) {
                return false;
            }

            if (cutType === 'standard') {
                const partsFromOneUnit = Math.floor(material.quantity / cutVolume + 1e-9);
                if (partsFromOneUnit === 0 && material.quantity > 1e-9 && cutVolume > 1e-9) {
                    return false;
                }
                const maxPossibleCutQuantity = partsFromOneUnit * material.amount;
                return cutQuantity <= maxPossibleCutQuantity;
            } else {
                return cutQuantity <= material.amount;
            }
        }

        const totalVolumeToCut = cutVolume * cutQuantity;
        const totalAvailableVolume = material.quantity * material.amount;
        return totalVolumeToCut <= totalAvailableVolume + 1e-9;
    };

    const getHasFixedVolume = (material: Material): boolean => {
        return material.material_standard.material_type.fixed_quantity
    }

    /**
     * Вычисляет максимальное количество единиц для заданного объема и типа резки
     * @param material - исходный материал
     * @param cutVolume - объем для резки
     * @param cutType - тип резки
     * @returns максимальное количество единиц
     */
    const getMaxPossibleAmount = (material: Material, cutVolume: number, cutType: CutType): number => {
        if (!material) {
            return 1
        }

        const matQuantity = material.quantity  // объем исходного материала
        const matAmount = material.amount      // количество единиц исходного материала
        const hasFixedVolume = getHasFixedVolume(material)

        if (!hasFixedVolume && cutType === 'equal') {
            return 0
        }

        if (cutType === 'equal') {
            if (cutVolume < 1e-9 || cutVolume > matQuantity + 1e-9) {
                return 0
            }
            return matAmount
        } else { // standard cut
            if (!hasFixedVolume) {
                if (cutVolume < 1e-9) return 0
                const totalVolume = matQuantity * matAmount
                return totalVolume > 1e-9 ? Math.floor(totalVolume / cutVolume + 1e-9) : 0
            }

            if (cutVolume < 1e-9 || cutVolume > matQuantity + 1e-9) {
                return 0
            }
            const piecesFromOneOriginal = Math.floor(matQuantity / cutVolume + 1e-9)
            if (piecesFromOneOriginal === 0) {
                return 0
            }
            return piecesFromOneOriginal * matAmount
        }
    }

    const undoCut = (
        originalMaterial: Material,
        cutResults: Material[]
    ): { materialUuid: string; newAmount: number; newQuantity: number } => {
        let totalAmount = 0;
        let totalQuantity = 0;

        cutResults.forEach(cutPiece => {
            totalAmount += cutPiece.amount;
            totalQuantity += cutPiece.quantity * cutPiece.amount;
        });

        let newAmount = originalMaterial.amount;
        let newQuantity = originalMaterial.quantity;

        const hasFixedVolume = getHasFixedVolume(originalMaterial);

        if (hasFixedVolume) {
            if (originalMaterial.quantity > 0) {
                const equivalentUnits = totalQuantity / originalMaterial.quantity;
                newAmount = originalMaterial.amount + equivalentUnits;
            } else {
                newAmount = originalMaterial.amount + totalAmount;
            }
        } else {
            const addedQuantity = totalQuantity / (originalMaterial.amount || 1);
            newQuantity = originalMaterial.quantity + addedQuantity;

            if (newQuantity > 0 && originalMaterial.amount === 0) {
                newAmount = 1;
            }
        }

        return {
            materialUuid: originalMaterial.uuid,
            newAmount,
            newQuantity
        };
    };

    /**
     * Отменяет операцию резки материала
     * Удаляет все результаты операции из коллекций и восстанавливает оригинальный материал
     */
    const undoCutOperation = (
        material: Material,
        sourceCollection: MaterialCollection,
        resultCollection: MaterialCollection
    ): boolean => {
        // Проверяем, что материал является результатом резки
        if (!material.cut_from || !material.cut_operation_uuid) {
            return false
        }

        // Находим оригинальный материал
        let originalMaterial = sourceCollection.findByUuid(material.cut_from)
        if (!originalMaterial) {
            originalMaterial = resultCollection.findByUuid(material.cut_from)
        }

        if (!originalMaterial) {
            return false
        }

        // Находим все материалы операции резки
        const allCutResults: Material[] = []

        // Ищем в результатах
        resultCollection.getAll().forEach(mat => {
            if (mat.cut_operation_uuid === material.cut_operation_uuid) {
                allCutResults.push(mat)
            }
        })

        // Ищем в исходных материалах (неиспользованные части)
        sourceCollection.getAll().forEach(mat => {
            if (mat.cut_operation_uuid === material.cut_operation_uuid) {
                allCutResults.push(mat)
            }
        })

        try {
            // Вычисляем параметры восстановления
            const undoResult = undoCut(originalMaterial, allCutResults)

            // Удаляем все результаты операции из коллекций
            allCutResults.forEach(cutMaterial => {
                if (cutMaterial.cut_operation_uuid === material.cut_operation_uuid) {
                    resultCollection.removeByUuid(cutMaterial.uuid)
                    sourceCollection.removeByUuid(cutMaterial.uuid)
                }
            })

            // Создаем восстановленный материал
            const restoredMaterial = originalMaterial.cloneWithNewParams(
                undoResult.newQuantity,
                undoResult.newAmount,
                undefined, // не передаем cutOperationUuid
                true // keepOriginal = true
            )

            // Восстанавливаем оригинальные метаданные
            restoredMaterial.cut_from = originalMaterial.cut_from
            restoredMaterial.cut_operation_uuid = originalMaterial.cut_operation_uuid

            // Заменяем материал в исходной коллекции
            sourceCollection.replaceByUuid(originalMaterial.uuid, restoredMaterial)

            return true
        } catch (error) {
            console.error('Ошибка при отмене операции резки:', error)
            return false
        }
    };

    /**
     * Восстанавливает материал к исходным параметрам
     * Удаляет все отделенные части (по cut_from) и восстанавливает оригинальные quantity/amount
     */
    const restoreMaterial = (
        material: Material,
        sourceCollection: MaterialCollection,
        resultCollection: MaterialCollection
    ): boolean => {
        if (!material.isChanged) {
            return false
        }

        const derivedMaterials: Material[] = [
            ...resultCollection.filterCutFormMaterial(material),
            ...sourceCollection.filterCutFormMaterial(material)
        ]

        try {
            derivedMaterials.forEach(derivedMaterial => {
                resultCollection.removeByUuid(derivedMaterial.uuid)
                sourceCollection.removeByUuid(derivedMaterial.uuid)
            })

            // Создаем восстановленный материал с исходными параметрами
            const restoredMaterial = material.cloneWithNewParams(
                material.initial_quantity,
                material.initial_amount,
                undefined, // не передаем cutOperationUuid
                true // keepOriginal = true
            )

            // Очищаем метаданные резки (восстанавливаем к исходному состоянию)
            restoredMaterial.cut_from = undefined
            restoredMaterial.cut_operation_uuid = undefined

            // Заменяем материал в исходной коллекции
            sourceCollection.replaceByUuid(material.uuid, restoredMaterial)

            return true
        } catch (error) {
            console.error('Ошибка при восстановлении материала:', error)
            return false
        }
    }

    return {
        cutMaterial,
        isValidCut,
        getMaxPossibleAmount,
        undoCut,
        undoCutOperation,
        restoreMaterial
    }
}