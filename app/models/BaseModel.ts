import { v4 as uuidv4 } from 'uuid'

export abstract class BaseModel {
  public id: number
  public uuid: string

  constructor(data: any) {
    this.id = data.id
    this.uuid = data.uuid || uuidv4()
  }

  getId(): number {
    return this.id
  }

  getUuid(): string {
    return this.uuid
  }
}