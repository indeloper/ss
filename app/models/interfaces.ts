// Интерфейсы для API ответов
export interface ApiUser {
  type: string
  id: number
  attributes: {
    last_name: string
    first_name: string
    patronymic: string
    user_full_name: string
    is_project_manager: boolean
    is_pto: boolean
    is_fore_man_group: boolean
  }
  links: {
    'user-card': string
  }
  last_name: string
  first_name: string
  patronymic: string
  user_full_name: string
  user_card_route: string
}

export interface ApiProjectObject {
  type: string
  id: number
  attributes: {
    timesheet_id: number | null
    '1c_uuid': string | null
    bitrix_id: number | null
    location: string
    name: string
    short_name: string
    material_accounting_type: number
  }
  links: {
    materials: string
  }
  relationships: {
    stores: any[]
    responsible: ApiUser[]
    responsibleUsers: ApiUser[]
    responsiblesPto: any[]
    responsiblesForemen: any[]
  }
}

export interface ApiMaterialType {
  type: string
  id: number
  attributes: {
    name: string
    description: string
    accounting_type: number
    unit_id?: number
    fixed_quantity?: boolean
    instruction?: string | null
  }
  relationships?: {
    material_unit?: ApiMaterialUnit
  }
}

export interface ApiMaterialUnit {
  id: number
  type: string
  attributes: {
    label: string
    name: string
    description: string | null
  }
  relationships: []
}

export interface ApiMaterialBrand {
  id: number
  type: string
  attributes: {
    name: string
    description: string | null
    weight: string
  }
  relationships: {
    material_type: ApiMaterialType
  }
}

export interface ApiStandard {
  type: string
  id: number
  attributes: {
    name: string
    weight: number
  }
  relationships: {
    material_type: ApiMaterialType
    properties: any[]
  }
}

export interface ApiMaterialProperty {
  id: number
  type: string
  attributes: {
    name: string
    description: string | null
    weight_factor: number
  }
  relationships: []
}

export interface ApiMaterialStandard {
  id: number
  type: string
  attributes: {
    name: string
    description: string
    old_standard_id: number
  }
  relationships: {
    material_type: ApiMaterialType
    material_brands: ApiMaterialBrand[]
    properties: ApiMaterialProperty[]
  }
}

export interface ApiMaterial {
  type: string
  id: number
  attributes: {
    amount: number
    quantity: number
    locked: boolean
    lock_reason: string | null
    project_object_id: number
    length_group_name: string
    length_group_min: number
    length_group_max: number
  }
  relationships: {
    store: any | null
    standard: ApiStandard | null
    new_standard: ApiMaterialStandard | null
    comment: any | null
    operations: any[]
  }
}

export interface ApiContractor {
  id: number
  short_name: string
  types?: string
  additional_types?: string[]
}

// Интерфейсы для трансформированных данных
export interface TransformedUser {
  id: number
  uuid?: string
  user_full_name: string
}

export interface TransformedProjectObject {
  id: number
  uuid?: string
  short_name: string
  location: string
  users: TransformedUser[]
}

export interface TransformedMaterialType {
  id: number
  uuid?: string
  name: string
  description: string
  accounting_type: number
  unit_id?: number
  fixed_quantity?: boolean
  instruction?: string | null
  material_unit?: TransformedMaterialUnit
}

export interface TransformedMaterialUnit {
  id: number
  uuid?: string
  label: string
  name: string
  description: string | null
}

export interface TransformedMaterialBrand {
  id: number
  uuid?: string
  name: string
  description: string | null
  weight: string
  material_type: TransformedMaterialType
}

export interface TransformedStandard {
  id: number
  uuid?: string
  name: string
  weight: number
  material_type: TransformedMaterialType
}

export interface TransformedMaterialProperty {
  id: number
  uuid?: string
  name: string
  description: string | null
  weight_factor: number
}

export interface TransformedMaterialStandard {
  id: number
  uuid?: string
  name: string
  description: string
  old_standard_id: number
  material_type: TransformedMaterialType
  material_brands: TransformedMaterialBrand[]
  material_properties: TransformedMaterialProperty[]
}

export interface TransformedMaterial {
  id: number
  uuid?: string
  amount: number
  quantity: number
  locked: boolean
  lock_reason: string | null
  project_object_id?: number
  length_group_name: string
  length_group_min: number
  length_group_max: number
  old_material_standard_id: number | null
  material_standard: TransformedMaterialStandard
}

export interface TransformedContractor {
  id: number
  name: string
}

export interface ApiOperationReason {
  id: number
  type: string
  attributes: {
    name: string
  }
}

export interface TransformedOperationReason {
  id: number
  name: string
} 