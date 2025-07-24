import type { ApiOperationReason, TransformedOperationReason } from '../interfaces'

export class OperationReasonAdapter {
  static transform(apiReason: ApiOperationReason): TransformedOperationReason {
    return {
      id: apiReason.id,
      name: apiReason.attributes.name
    }
  }

  static transformMany(apiReasons: ApiOperationReason[]): TransformedOperationReason[] {
    return apiReasons.map(reason => this.transform(reason))
  }
} 