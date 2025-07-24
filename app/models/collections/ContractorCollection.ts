import { BaseCollection } from './BaseCollection'
import { Contractor } from '../Contractor'
import type { ContractorData } from '../interfaces'

export class ContractorCollection extends BaseCollection<Contractor> {

  constructor(contractors: ContractorData[] | ContractorCollection = []) {
    if (contractors instanceof ContractorCollection) {
      super(contractors)
    } else {
      super(contractors.map(contractorData => new Contractor(contractorData)))
    }
  }
}