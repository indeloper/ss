import { ProjectObject } from '../ProjectObject'
import type { TransformedProjectObject } from '../interfaces'
import { BaseCollection } from './BaseCollection'

export class ProjectObjectCollection extends BaseCollection<ProjectObject> {
  constructor(objects: TransformedProjectObject[] | ProjectObjectCollection = []) {
    if (objects instanceof ProjectObjectCollection) {
      super(objects)
    } else {
      super(objects.map(data => new ProjectObject(data)))
    }
  }

  // Найти объект по uuid
  override findByUuid(uuid: string): ProjectObject | undefined {
    return this.items.find(obj => obj.getUuid() === uuid)
  }

  // Получить объекты с пользователями
  getObjectsWithUsers(): ProjectObject[] {
    return this.items.filter(obj => obj.hasUsers())
  }

  // Фильтровать по имени объекта
  filterByName(name: string): ProjectObject[] {
    return this.items.filter(obj => 
      obj.short_name.toLowerCase().includes(name.toLowerCase())
    )
  }
} 