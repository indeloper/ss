import { ref, computed } from 'vue'
import type { MaterialStandard } from '~/models/MaterialStandard'

export interface MaterialStandardFilters {
  searchText: string
  brandFilter: Set<string>
  propertyFilter: Set<string>
  typeFilter: Set<string>
}

export interface MaterialStandardSortState {
  columnKey: string | null
  order: 'ascend' | 'descend' | false
}

export function useMaterialStandardFilter() {
  const filters = ref<MaterialStandardFilters>({
    searchText: '',
    brandFilter: new Set(),
    propertyFilter: new Set(),
    typeFilter: new Set()
  })

  const sortState = ref<MaterialStandardSortState>({
    columnKey: null,
    order: false
  })

  const getMaterialTypes = (standards: MaterialStandard[]) => {
    const types = new Set<string>()
    standards.forEach(standard => {
      if (standard.material_type?.name) {
        types.add(standard.material_type.name)
      }
    })
    return Array.from(types).sort()
  }

  const getMaterialBrands = (standards: MaterialStandard[]) => {
    const brands = new Set<string>()
    standards.forEach(standard => {
      standard.material_brands?.getAll().forEach((brand: any) => {
        if (brand.name) brands.add(brand.name)
      })
    })
    return Array.from(brands).sort()
  }

  const getMaterialProperties = (standards: MaterialStandard[]) => {
    const properties = new Set<string>()
    standards.forEach(standard => {
      standard.material_properties?.getAll().forEach((prop: any) => {
        if (prop.name) properties.add(prop.name)
      })
    })
    return Array.from(properties).sort()
  }

  const filterStandards = (standards: MaterialStandard[]): MaterialStandard[] => {
    let filtered = [...standards]

    // Текстовый поиск
    if (filters.value.searchText.trim()) {
      const searchText = filters.value.searchText.toLowerCase().trim()
      filtered = filtered.filter(standard => {
        const typeName = standard.material_type?.name?.toLowerCase() || ''
        const typeDescription = standard.material_type?.description?.toLowerCase() || ''
        const standardName = standard.name?.toLowerCase() || ''
        const standardDescription = standard.description?.toLowerCase() || ''
        const brands = standard.material_brands?.getAll().map((b: any) => b.name?.toLowerCase() || '').join(' ')
        const brandWeights = standard.material_brands?.getAll().map((b: any) => b.weight?.toString().toLowerCase() || '').join(' ')
        const properties = standard.material_properties?.getAll().map((p: any) => p.name?.toLowerCase() || '').join(' ')
        const oldStandardId = standard.old_standard_id?.toString() || ''

        return typeName.includes(searchText) ||
               typeDescription.includes(searchText) ||
               standardName.includes(searchText) ||
               standardDescription.includes(searchText) ||
               brands.includes(searchText) ||
               brandWeights.includes(searchText) ||
               properties.includes(searchText) ||
               oldStandardId.includes(searchText)
      })
    }

    // Фильтр по типам
    if (filters.value.typeFilter.size > 0) {
      filtered = filtered.filter(standard => {
        return filters.value.typeFilter.has(standard.material_type?.name || '')
      })
    }

    // Фильтр по маркам
    if (filters.value.brandFilter.size > 0) {
      filtered = filtered.filter(standard => {
        const standardBrands = standard.material_brands?.getAll().map((b: any) => b.name) || []
        return standardBrands.some(brand => filters.value.brandFilter.has(brand))
      })
    }

    // Фильтр по свойствам
    if (filters.value.propertyFilter.size > 0) {
      filtered = filtered.filter(standard => {
        const standardProperties = standard.material_properties?.getAll().map((p: any) => p.name) || []
        return standardProperties.some(prop => filters.value.propertyFilter.has(prop))
      })
    }

    return filtered
  }

  const sortStandards = (standards: MaterialStandard[]): MaterialStandard[] => {
    if (!sortState.value.columnKey || !sortState.value.order) {
      return standards
    }

    const sorted = [...standards]
    const { columnKey, order } = sortState.value
    const multiplier = order === 'ascend' ? 1 : -1

    sorted.sort((a, b) => {
      let aValue: any = ''
      let bValue: any = ''

      switch (columnKey) {
        case 'material_type.name':
          aValue = a.material_type?.name || ''
          bValue = b.material_type?.name || ''
          break
        case 'name':
          aValue = a.name || ''
          bValue = b.name || ''
          break
        case 'description':
          aValue = a.description || ''
          bValue = b.description || ''
          break
        case 'material_brands':
          aValue = a.material_brands?.getAll().map((b: any) => b.name).join(', ') || ''
          bValue = b.material_brands?.getAll().map((b: any) => b.name).join(', ') || ''
          break
        case 'material_properties':
          aValue = a.material_properties?.getAll().map((p: any) => p.name).join(', ') || ''
          bValue = b.material_properties?.getAll().map((p: any) => p.name).join(', ') || ''
          break
        case 'total_weight':
          aValue = a.material_brands?.getAll().reduce((sum: number, b: any) => sum + (Number(b.weight) || 0), 0) || 0
          bValue = b.material_brands?.getAll().reduce((sum: number, b: any) => sum + (Number(b.weight) || 0), 0) || 0
          break
        default:
          return 0
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue) * multiplier
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return (aValue - bValue) * multiplier
      }

      return 0
    })

    return sorted
  }

  const groupStandardsByType = (standards: MaterialStandard[]): any[] => {
    const groups = new Map<string, MaterialStandard[]>()
    
    standards.forEach(standard => {
      const typeName = standard.material_type?.name || 'Без типа'
      if (!groups.has(typeName)) {
        groups.set(typeName, [])
      }
      groups.get(typeName)!.push(standard)
    })

    const result: any[] = []
    
    groups.forEach((groupStandards, typeName) => {
      const groupTotalWeight = groupStandards.reduce((sum, standard) => {
        return sum + (standard.material_brands?.getAll().reduce((brandSum: number, brand: any) => 
          brandSum + (Number(brand.weight) || 0), 0) || 0)
      }, 0)

      result.push({
        type: 'group',
        title: typeName,
        key: typeName,
        uuid: `group-${typeName}`,
        children: groupStandards,
        groupWeight: groupTotalWeight,
        groupCount: groupStandards.length
      })
    })

    return result
  }

  const handleFiltersChange = (newFilters: any) => {
    Object.keys(newFilters).forEach(key => {
      if (newFilters[key] !== null) {
        const filterSet = new Set(newFilters[key])
        switch (key) {
          case 'material_type.name':
            filters.value.typeFilter = filterSet
            break
          case 'material_standard.material_brands.name':
            filters.value.brandFilter = filterSet
            break
          case 'material_standard.material_properties.name':
            filters.value.propertyFilter = filterSet
            break
        }
      }
    })
  }

  const handleSorterChange = (sorter: any) => {
    if (sorter) {
      sortState.value = {
        columnKey: sorter.columnKey,
        order: sorter.order
      }
    } else {
      sortState.value = {
        columnKey: null,
        order: false
      }
    }
  }

  return {
    filters,
    sortState,
    getMaterialTypes,
    getMaterialBrands,
    getMaterialProperties,
    filterStandards,
    sortStandards,
    groupStandardsByType,
    handleFiltersChange,
    handleSorterChange
  }
}
