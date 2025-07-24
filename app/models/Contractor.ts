import type { TransformedContractor } from './interfaces'
import { BaseModel } from './BaseModel'

export class Contractor extends BaseModel {
  public name: string

  constructor(data: TransformedContractor) {
    super(data)
    this.name = data.name
  }

  getDisplayName(): string {
    return this.name
  }
} 