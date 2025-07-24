import type { Material } from "~/models/Material"
import { MaterialCollection } from "~/models/collections/MaterialCollection"

/**
 * Composable для работы с трансформациями материалов
 * Содержит переиспользуемую логику обработки результатов операций
 */
export const useMaterialTransformation = () => {

  const store = async (data: any) => {
    await useApi().post('/operations/transformation', data);
  }

  /**
   * Обрабатывает результат резки материала
   * Добавляет результат и остатки в коллекцию результатов,
   * заменяет или удаляет оригинальный материал
   */
  const processCutResult = (
    result: {
      material: Material,
      cutParams: {
        quantity: number,
        amount: number,
        cutType: 'standard' | 'equal'
      },
      cutResult: {
        result: Material,
        remainder: Material[],
        unusedPart: Material | null
      }
    },
    sourceCollection: MaterialCollection,
    resultCollection: MaterialCollection,
    zeroOut: boolean = true
  ) => {
    resultCollection.add(result.cutResult.result)
    
    if (result.cutResult.remainder.length > 0) {
      result.cutResult.remainder.forEach((remainder) => {
        resultCollection.add(remainder)
      })
    }

    if (result.cutResult.unusedPart) {
      sourceCollection.replaceByUuid(result.material.uuid, result.cutResult.unusedPart)
    } else {
      if (zeroOut) {
        // Обнуляем материал вместо удаления
        const zeroedMaterial = result.material.material_standard.material_type.fixed_quantity
          ? result.material.cloneWithNewParams(result.material.quantity, 0, undefined, true)
          : result.material.cloneWithNewParams(0, result.material.amount, undefined, true)
        
        sourceCollection.replaceByUuid(result.material.uuid, zeroedMaterial)
      } else {
        // Удаляем оригинальный материал
        sourceCollection.removeByUuid(result.material.uuid)
      }
    }
  }

  /**
   * Находит оригинальный материал по cut_from
   * Ищет в нескольких коллекциях
   */
  const findOriginalMaterial = (
    cutFromUuid: string,
    ...collections: MaterialCollection[]
  ): Material | null => {
    for (const collection of collections) {
      const material = collection.findByUuid(cutFromUuid)
      if (material) {
        return material
      }
    }
    return null
  }

  /**
   * Находит все материалы с одинаковым cut_operation_uuid
   * Ищет в нескольких коллекциях
   */
  const findMaterialsWithOperationUuid = (
    operationUuid: string,
    ...collections: MaterialCollection[]
  ): Material[] => {
    const results: Material[] = []
    
    for (const collection of collections) {
      collection.getAll().forEach(material => {
        if (material.cut_operation_uuid === operationUuid) {
          results.push(material)
        }
      })
    }
    
    return results
  }

  return {
    store,
    processCutResult,
    findOriginalMaterial,
    findMaterialsWithOperationUuid
  }
}
