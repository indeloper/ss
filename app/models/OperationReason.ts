import type { TransformedOperationReason } from './interfaces'
import { BaseModel } from './BaseModel'

export class OperationReason extends BaseModel {
  public name: string

  constructor(data: TransformedOperationReason) {
    super(data)
    this.name = data.name
  }

  getDisplayName(): string {
    return this.name
  }
} 