import { BaseCollection } from '../collections/BaseCollection'
import { BaseModel } from '../BaseModel'

export const useCollectionFilter = <T extends BaseModel>() => {

    const normalizeToArray = <U>(value: U | U[]): U[] => {
        return Array.isArray(value) ? value : [value]
    }

    const filterByIds = <C extends BaseCollection<T>>(
        collection: C, 
        ids: number | number[], 
        getIdFn: (item: T) => number | undefined
    ): C => {
        const idsArray = normalizeToArray(ids)
        if (idsArray.length === 0) return collection
        
        return collection.filterBy((item: T) => {
            const itemId = getIdFn(item)
            return itemId !== undefined && idsArray.includes(itemId)
        }) as C
    }

    const filterByCollectionIds = <C extends BaseCollection<T>>(
        collection: C,
        ids: number | number[],
        getCollectionFn: (item: T) => { getAll(): { getId(): number }[] } | undefined
    ): C => {
        const idsArray = normalizeToArray(ids)
        if (idsArray.length === 0) return collection
        
        return collection.filterBy((item: T) => {
            const itemCollection = getCollectionFn(item)
            return itemCollection?.getAll().some(subItem => idsArray.includes(subItem.getId())) ?? false
        }) as C
    }

    const filterByEveryCollectionIds = <C extends BaseCollection<T>>(
        collection: C,
        ids: number | number[],
        getCollectionFn: (item: T) => { getAll(): { getId(): number }[] } | undefined
    ): C => {
        const idsArray = normalizeToArray(ids)
        if (idsArray.length === 0) return collection
        
        return collection.filterBy((item: T) => {
            const itemCollection = getCollectionFn(item)
            const itemIds = itemCollection?.getAll().map(subItem => subItem.getId()) ?? []
            
            // Проверяем точное совпадение: одинаковая длина и все элементы совпадают
            return itemIds.length === idsArray.length && 
                   idsArray.every(id => itemIds.includes(id)) &&
                   itemIds.every(id => idsArray.includes(id))
        }) as C
    }

    const filterByProperty = <C extends BaseCollection<T>>(
        collection: C,
        predicate: (item: T) => boolean
    ): C => {
        return collection.filterBy(predicate) as C
    }

    const filterByStringProperty = <C extends BaseCollection<T>>(
        collection: C,
        getValue: (item: T) => string | undefined,
        searchValue: string,
        options: { caseSensitive?: boolean } = { caseSensitive: false }
    ): C => {
        const normalizedSearch = options.caseSensitive ? searchValue : searchValue.toLowerCase()
        
        return collection.filterBy((item: T) => {
            const value = getValue(item)
            if (!value) return false
            
            const normalizedValue = options.caseSensitive ? value : value.toLowerCase()
            return normalizedValue.includes(normalizedSearch)
        }) as C
    }

    const filterByNumericRange = <C extends BaseCollection<T>>(
        collection: C,
        getValue: (item: T) => number | undefined,
        min?: number,
        max?: number
    ): C => {
        return collection.filterBy((item: T) => {
            const value = getValue(item)
            if (value === undefined) return false
            
            if (min !== undefined && value < min) return false
            return !(max !== undefined && value > max);

        }) as C
    }

    const filterByBooleanProperty = <C extends BaseCollection<T>>(
        collection: C,
        getValue: (item: T) => boolean | undefined,
        expectedValue: boolean
    ): C => {
        return collection.filterBy((item: T) => getValue(item) === expectedValue) as C
    }

    const excludeByIds = <C extends BaseCollection<T>>(
        collection: C,
        ids: number | number[],
        getIdFn: (item: T) => number | undefined
    ): C => {
        const idsArray = normalizeToArray(ids)
        if (idsArray.length === 0) return collection
        
        return collection.filterBy((item: T) => {
            const itemId = getIdFn(item)
            return itemId === undefined || !idsArray.includes(itemId)
        }) as C
    }

    return {
        normalizeToArray,
        filterByIds,
        filterByCollectionIds,
        filterByEveryCollectionIds,
        filterByProperty,
        filterByStringProperty,
        filterByNumericRange,
        filterByBooleanProperty,
        excludeByIds
    }
}