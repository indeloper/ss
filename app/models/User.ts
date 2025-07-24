import type { TransformedUser } from './interfaces'
import { BaseModel } from './BaseModel'

export class User extends BaseModel {
  public user_full_name: string

  constructor(data: TransformedUser) {
    super(data)
    this.user_full_name = data.user_full_name
  }

  // Методы для работы с пользователем
  getDisplayName(): string {
    return this.user_full_name
  }
} 