import type { Material } from '~/models/Material'

export interface MaterialFilters {
  searchText: string
  typeFilter: string[]
  brandFilter: string[]
  propertyFilter: string[]
  quantityFrom: number | null
  quantityTo: number | null
  amountFrom: number | null
  amountTo: number | null
  weightFrom: number | null
  weightTo: number | null
}

export interface SortState {
  columnKey: string | null
  order: 'ascend' | 'descend' | false
}

export const useMaterialFilter = () => {
  const filters = reactive<MaterialFilters>({
    searchText: '',
    typeFilter: [],
    brandFilter: [],
    propertyFilter: [],
    quantityFrom: null,
    quantityTo: null,
    amountFrom: null,
    amountTo: null,
    weightFrom: null,
    weightTo: null
  })

  const sortState = ref<SortState>({
    columnKey: null,
    order: false
  })

  const getMaterialTypes = (materials: Material[] | null): string[] => {
    if (!materials) return []
    const types = new Set<string>()
    materials.forEach(material => {
      const typeName = material.material_standard?.material_type?.name
      if (typeName) types.add(typeName)
    })
    return Array.from(types).sort()
  }

  const getMaterialBrands = (materials: Material[] | null): string[] => {
    if (!materials) return []
    const brands = new Set<string>()
    materials.forEach(material => {
      material.material_standard?.material_brands?.getAll().forEach((brand: any) => {
        if (brand.name) brands.add(brand.name)
      })
    })
    return Array.from(brands).sort()
  }

  const getMaterialProperties = (materials: Material[] | null): string[] => {
    if (!materials) return []
    const properties = new Set<string>()
    materials.forEach(material => {
      material.material_standard?.material_properties?.getAll().forEach((prop: any) => {
        if (prop.name) properties.add(prop.name)
      })
    })
    return Array.from(properties).sort()
  }

  const filterMaterials = (materials: Material[] | null): Material[] => {
    if (!materials) return []

    let filtered = [...materials]

    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase()
      filtered = filtered.filter(material => {
        const typeName = material.material_standard?.material_type?.name?.toLowerCase() || ''
        const brandNames = material.material_standard?.material_brands?.getAll().map((b: any) => b.name).join(' ').toLowerCase() || ''
        const propertyNames = material.material_standard?.material_properties?.getAll().map((p: any) => p.name).join(' ').toLowerCase() || ''
        
        return typeName.includes(searchLower) || 
               brandNames.includes(searchLower) || 
               propertyNames.includes(searchLower)
      })
    }

    if (filters.typeFilter.length > 0) {
      filtered = filtered.filter(material => {
        const typeName = material.material_standard?.material_type?.name
        return typeName && filters.typeFilter.includes(typeName)
      })
    }

    if (filters.brandFilter.length > 0) {
      filtered = filtered.filter(material => {
        const brands = material.material_standard?.material_brands?.getAll().map((b: any) => b.name) || []
        return brands.some(b => filters.brandFilter.includes(b))
      })
    }

    if (filters.propertyFilter.length > 0) {
      filtered = filtered.filter(material => {
        const propsArr = material.material_standard?.material_properties?.getAll().map((p: any) => p.name) || []
        return propsArr.some(p => filters.propertyFilter.includes(p))
      })
    }

    if (filters.quantityFrom !== null) {
      filtered = filtered.filter(m => m.quantity >= filters.quantityFrom!)
    }
    if (filters.quantityTo !== null) {
      filtered = filtered.filter(m => m.quantity <= filters.quantityTo!)
    }

    if (filters.amountFrom !== null) {
      filtered = filtered.filter(m => m.amount >= filters.amountFrom!)
    }
    if (filters.amountTo !== null) {
      filtered = filtered.filter(m => m.amount <= filters.amountTo!)
    }

    if (filters.weightFrom !== null) {
      filtered = filtered.filter(m => m.total_weight >= filters.weightFrom!)
    }
    if (filters.weightTo !== null) {
      filtered = filtered.filter(m => m.total_weight <= filters.weightTo!)
    }

    return filtered
  }

  const sortMaterials = (materials: Material[]): Material[] => {
    if (!sortState.value.columnKey || !sortState.value.order) {
      return materials
    }

    const key = sortState.value.columnKey
    const order = sortState.value.order
    
    return [...materials].sort((a: any, b: any) => {
      let result = 0
      
      if (key === 'quantity') {
        result = a.quantity - b.quantity
      } else if (key === 'amount') {
        result = a.amount - b.amount
      } else if (key === 'total_weight') {
        result = a.total_weight - b.total_weight
      } else if (key === 'material_standard.material_type.name') {
        const aName = a.material_standard?.material_type?.name || ''
        const bName = b.material_standard?.material_type?.name || ''
        result = aName.localeCompare(bName)
      } else if (key === 'material_standard.material_brands.name') {
        const aBrands = a.material_standard?.material_brands?.getAll().map((brand: any) => brand.name).join(', ') || ''
        const bBrands = b.material_standard?.material_brands?.getAll().map((brand: any) => brand.name).join(', ') || ''
        result = aBrands.localeCompare(bBrands)
      } else if (key === 'material_standard.material_properties.name') {
        const aProps = a.material_standard?.material_properties?.getAll().map((prop: any) => prop.name).join(', ') || ''
        const bProps = b.material_standard?.material_properties?.getAll().map((prop: any) => prop.name).join(', ') || ''
        result = aProps.localeCompare(bProps)
      }
      
      return order === 'descend' ? -result : result
    })
  }

  const groupMaterialsByType = (materials: Material[]) => {
    if (!materials.length) return []
    
    const groups: any = {}
    
    materials.forEach(material => {
      const typeName = material.material_standard?.material_type?.name || 'Без типа'
      if (!groups[typeName]) {
        groups[typeName] = {
          key: `group-${typeName}`,
          type: 'group',
          title: typeName,
          children: [],
          groupQuantity: 0,
          groupAmount: 0,
          groupWeight: 0
        }
      }
      
      groups[typeName].groupQuantity += material.quantity * material.amount
      groups[typeName].groupAmount += material.amount
      groups[typeName].groupWeight += material.total_weight
      
      groups[typeName].children.push(material)
    })
    
    return Object.values(groups) as any[]
  }

  const handleFiltersChange = (newFilters: any) => {
    filters.typeFilter = newFilters['material_standard.material_type.name'] || []
    filters.brandFilter = newFilters['material_standard.material_brands.name'] || []
    filters.propertyFilter = newFilters['material_standard.material_properties.name'] || []
  }

  const handleSorterChange = (sorter: any) => {
    if (sorter && sorter.columnKey) {
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

  const resetFilters = () => {
    filters.searchText = ''
    filters.typeFilter = []
    filters.brandFilter = []
    filters.propertyFilter = []
    filters.quantityFrom = null
    filters.quantityTo = null
    filters.amountFrom = null
    filters.amountTo = null
    filters.weightFrom = null
    filters.weightTo = null
    sortState.value = { columnKey: null, order: false }
  }

  return {
    filters: readonly(filters),
    sortState: readonly(sortState),
    getMaterialTypes,
    getMaterialBrands,
    getMaterialProperties,
    filterMaterials,
    sortMaterials,
    groupMaterialsByType,
    handleFiltersChange,
    handleSorterChange,
    resetFilters
  }
} 