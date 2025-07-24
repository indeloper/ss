import type { ApiContractor, TransformedContractor } from '../interfaces'

export class ContractorAdapter {
  static transform(apiContractor: ApiContractor): TransformedContractor {
    return {
      id: apiContractor.id,
      name: apiContractor.short_name
    }
  }

  static transformMany(apiContractors: ApiContractor[]): TransformedContractor[] {
    return apiContractors.map(contractor => this.transform(contractor))
  }
} 