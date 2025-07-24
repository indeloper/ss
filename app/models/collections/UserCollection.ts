import { User } from '../User'
import type { TransformedUser } from '../interfaces'
import { BaseCollection } from './BaseCollection'

export class UserCollection extends BaseCollection<User> {
  constructor(users: TransformedUser[] | UserCollection = []) {
    if (users instanceof UserCollection) {
      super(users)
    } else {
      super(users.map(data => new User(data)))
    }
  }

  // Получить массив имен пользователей
  getUserNames(): string[] {
    return this.items.map(user => user.user_full_name)
  }
}