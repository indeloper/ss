import { UserCollection } from './collections/UserCollection'
import type { TransformedProjectObject } from './interfaces'
import { BaseModel } from './BaseModel'

export class ProjectObject extends BaseModel {
  public short_name: string
  public location: string
  public users: UserCollection

  constructor(data: TransformedProjectObject) {
    super(data)
    this.short_name = data.short_name
    this.location = data.location
    this.users = new UserCollection(data.users)
  }

  getDisplayName(): string {
    return this.short_name
  }

  override getId(): number {
    return this.id
  }

  getShortName(): string {
    return this.short_name
  }

  getLocation(): string {
    return this.location
  }

  getUsers(): UserCollection {
    return this.users
  }

  getUserCount(): number {
    return this.users.getCount()
  }

  hasUsers(): boolean {
    return !this.users.isEmpty()
  }
} 