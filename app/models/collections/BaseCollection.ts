import _ from 'lodash'

export abstract class BaseCollection<T extends { getId(): number; getUuid(): string }> {
  protected items: T[]

  constructor(items: T[] | BaseCollection<T> = []) {
    if (items instanceof BaseCollection) {
      this.items = items.getAll()
    } else {
      this.items = items
    }
  }

  add(item: T): void {
    this.items.push(item)
  }

  getAll(): T[] {
    return this.items
  }

  findById(id: number): T | undefined {
    return _.find(this.items, item => item.getId() === id)
  }

  findByUuid(uuid: string): T | undefined {
    return _.find(this.items, item => item.getUuid() === uuid)
  }

  getFirst(): T | undefined {
    return _.head(this.items)
  }

  getCount(): number {
    return this.items.length
  }

  isEmpty(): boolean {
    return _.isEmpty(this.items)
  }

  findBy(predicate: ((item: T) => boolean) | Partial<T>): T | undefined {
    return _.find(this.items, predicate)
  }

  findWhere(path: string, value: any): T | undefined {
    return _.find(this.items, item => _.get(item, path) === value)
  }

  filterBy(predicate: ((item: T) => boolean) | Partial<T>): this {
    return new (this.constructor as any)(_.filter(this.items, predicate))
  }

  filterWhere(path: string, value: any): this {
    return new (this.constructor as any)(_.filter(this.items, item => _.get(item, path) === value))
  }

  where(key: string, value: any): this {
    return new (this.constructor as any)(_.filter(this.items, item => _.get(item, key) === value))
  }

  pluck<K>(path: string): K[] {
    return _.map(this.items, item => _.get(item, path))
  }

  compareByExtractedValues<K>(item1: T, item2: T, extractFn: (item: T) => K[]): boolean {
    const values1 = extractFn(item1).sort()
    const values2 = extractFn(item2).sort()
    return JSON.stringify(values1) === JSON.stringify(values2)
  }

  findSimilarByExtraction<K>(
    targetItem: T, 
    extractFn: (item: T) => K[], 
    additionalFilter?: (item: T) => boolean
  ): T[] {
    const targetValues = extractFn(targetItem).sort()
    const targetKey = JSON.stringify(targetValues)
    
    return this.items.filter(item => {
      if (item === targetItem) return false
      
      const itemValues = extractFn(item).sort()
      const itemKey = JSON.stringify(itemValues)
      
      const hasSameExtraction = itemKey === targetKey
      const passesAdditionalFilter = additionalFilter ? additionalFilter(item) : true
      
      return hasSameExtraction && passesAdditionalFilter
    })
  }

  findSimilarByMultipleExtractions<K>(
    targetItem: T,
    extractionFns: Array<(item: T) => K[]>,
    additionalFilter?: (item: T) => boolean
  ): T[] {
    const targetKeys = extractionFns.map(fn => {
      const values = fn(targetItem).sort()
      return JSON.stringify(values)
    })

    return this.items.filter(item => {
      if (item === targetItem) return false

      const itemKeys = extractionFns.map(fn => {
        const values = fn(item).sort()
        return JSON.stringify(values)
      })

      const allExtractionsSame = targetKeys.every((key, index) => key === itemKeys[index])
      const passesAdditionalFilter = additionalFilter ? additionalFilter(item) : true

      return allExtractionsSame && passesAdditionalFilter
    })
  }

  findOppositeByBooleanProperty<K>(
    targetId: number | string,
    extractionFns: Array<(item: T) => K[]>,
    booleanPropertyFn: (item: T) => boolean,
    getIdFn: (item: T) => number | string = (item) => (item as any).getId()
  ): this {
    const targetItem = this.items.find(item => getIdFn(item) === targetId)
    if (!targetItem) return new (this.constructor as any)([])

    const targetBooleanValue = booleanPropertyFn(targetItem)
    const oppositeBooleanValue = !targetBooleanValue

    const candidates = this.findSimilarByMultipleExtractions(
      targetItem,
      extractionFns,
      (candidate) => booleanPropertyFn(candidate) === oppositeBooleanValue
    )

    return new (this.constructor as any)(candidates)
  }
}