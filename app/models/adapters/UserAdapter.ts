import type { ApiUser, TransformedUser } from '../interfaces'

export class UserAdapter {
  static transform(apiUser: ApiUser): TransformedUser {
    return {
      id: apiUser.id,
      uuid: (apiUser as any).uuid, // пробрасываем, если есть
      user_full_name: apiUser.user_full_name
    }
  }

  static transformMany(apiUsers: ApiUser[]): TransformedUser[] {
    return apiUsers.map(user => this.transform(user))
  }
} 