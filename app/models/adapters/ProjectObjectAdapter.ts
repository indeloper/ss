import { UserAdapter } from './UserAdapter'
import type { ApiProjectObject, TransformedProjectObject } from '../interfaces'

export class ProjectObjectAdapter {
  static transform(apiProjectObject: ApiProjectObject): TransformedProjectObject {
    // Трансформируем пользователей из relationships.responsibleUsers
    const users = UserAdapter.transformMany(apiProjectObject.relationships.responsibleUsers)

    return {
      id: apiProjectObject.id,
      short_name: apiProjectObject.attributes.short_name,
      location: apiProjectObject.attributes.location,
      users: users
    }
  }

  static transformMany(apiProjectObjects: ApiProjectObject[]): TransformedProjectObject[] {
    return apiProjectObjects.map(obj => this.transform(obj))
  }
} 