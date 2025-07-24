import { BaseCollection } from './BaseCollection'
import { Material } from '../Material'
import type { TransformedMaterial } from '../interfaces'
import type {MaterialStandard} from "~/models/MaterialStandard";

export class MaterialCollection extends BaseCollection<Material> {

  constructor(materials: TransformedMaterial[] | MaterialCollection = []) {
    if (materials instanceof MaterialCollection) {
      super(materials)
    } else {
      super(materials.map(materialData => new Material(materialData)))
    }
    
  }

  /**
   * Создает коллекцию из готовых объектов Material
   */
  static fromMaterials(materials: Material[]): MaterialCollection {
    const collection = new MaterialCollection([])
    collection.items = materials
    return collection
  }

  getLockedMaterials(): Material[] {
    return this.items.filter(material => material.isLocked())
  }

  getUnlockedMaterials(): Material[] {
    return this.items.filter(material => !material.isLocked())
  }

  filterByProjectObject(projectObjectId: number): Material[] {
    return this.items.filter(material => material.getProjectObjectId() === projectObjectId)
  }

  filterByMaterialStandard(materialStandardId: number): Material[] {
    return this.items.filter(material => 
      material.getMaterialStandard()?.getId() === materialStandardId
    )
  }

  filterAllByCutFrom(uuid: string): Material[] | [] {
    return this.items.filter(item => item.cut_from === uuid)
  }

  filterCutFormMaterial(material: Material): Material[] | [] {
    return this.filterAllByCutFrom(material.getUuid())
  }

  filterChanged(): MaterialCollection {
    const changedMaterials = this.items.filter(material => material.isChanged)
    console.log(changedMaterials)
    return MaterialCollection.fromMaterials(changedMaterials)
  }

  updateById(id: number, updater: (material: Material) => void): boolean {
    const material = this.items.find(m => m.getId() === id)
    if (material) {
      updater(material)
      return true
    }
    return false
  }

  updateByUuid(uuid: string, updater: (material: Material) => void): boolean {
    const material = this.items.find(m => m.getUuid() === uuid)
    if (material) {
      updater(material)
      return true
    }
    return false
  }

  removeById(id: number): boolean {
    const idx = this.items.findIndex(m => m.getId() === id)
    if (idx !== -1) {
      this.items.splice(idx, 1)
      return true
    }
    return false
  }

  removeByUuid(uuid: string): boolean {
    const idx = this.items.findIndex(m => m.getUuid() === uuid)
    if (idx !== -1) {
      this.items.splice(idx, 1)
      return true
    }
    return false
  }

  /**
   * Заменяет материал с указанным UUID новым материалом на том же месте
   * @param uuid - UUID материала для замены
   * @param newMaterial - новый материал
   * @returns true если замена прошла успешно, false если материал не найден
   */
  replaceByUuid(uuid: string, newMaterial: Material): boolean {
    const idx = this.items.findIndex(m => m.getUuid() === uuid)
    if (idx !== -1) {
      this.items[idx] = newMaterial
      return true
    }
    return false
  }

  allHavePositiveQuantityAndAmount(): boolean {
    return this.items.every(m => m.quantity > 0 && m.amount > 0)
  }

  getTotalWeight(): number {
    return parseFloat(Number(this.items.reduce((sum, material) => sum + (material.total_weight ?? 0), 0)).toFixed(2))
  }

  getTotalAmount(): number {
    return this.items.reduce((sum, material) => sum + (material.amount ?? 0), 0)
  }

  getTotalAmountQuantity(): number {
    return this.items.reduce((sum, material) => sum + ((material.quantity ?? 0) * (material.amount ?? 0)), 0)
  }

  getGroupedAmountQuantityByUnit(): { unit: string, total: number }[] {
    const groups: Record<string, number> = {};
    for (const material of this.items) {
      const unit = material.material_standard?.material_type?.material_unit?.getLabel?.() || material.material_standard?.material_type?.material_unit?.getName?.() || '—';
      const value = (material.quantity ?? 0) * (material.amount ?? 0);
      if (groups[unit]) {
        groups[unit] += value;
      } else {
        groups[unit] = value;
      }
    }
    return Object.entries(groups).map(([unit, total]) => ({ unit, total }));
  }

  getGroupedAmountQuantityByType(): { type: string, unit: string, total: number }[] {
    const groups: Record<string, { unit: string, total: number }> = {};
    for (const material of this.items) {
      const type = material.material_standard?.material_type?.getName?.() || '—';
      const unit = material.material_standard?.material_type?.material_unit?.getLabel?.() || material.material_standard?.material_type?.material_unit?.getName?.() || '—';
      const value = (material.quantity ?? 0) * (material.amount ?? 0);
      if (groups[type]) {
        groups[type].total += value;
      } else {
        groups[type] = { unit, total: value };
      }
    }
    return Object.entries(groups).map(([type, { unit, total }]) => ({ type, unit, total }));
  }

  createAndAddFromStandard(materialStandard: MaterialStandard): void {
    this.add(Material.createFromStandard(materialStandard))
  }

  /**
   * Создает глубокую копию коллекции материалов
   * Каждый материал клонируется с сохранением всех свойств
   * @returns новая коллекция с клонированными материалами
   */
  clone(): MaterialCollection {
    const clonedMaterials = this.items.map(material => {
      // Создаем копию материала с теми же параметрами
      return material.cloneWithNewParams(
        material.quantity, 
        material.amount, 
        material.cut_operation_uuid,
        true // keepOriginal = true, чтобы сохранить UUID и все метаданные
      )
    })
    
    // Создаем новую коллекцию из клонированных материалов
    const newCollection = new MaterialCollection([])
    clonedMaterials.forEach(material => newCollection.add(material))
    
    return newCollection
  }
}