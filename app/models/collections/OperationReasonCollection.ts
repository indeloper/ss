import { OperationReason } from '../OperationReason'
import type {TransformedOperationReason} from '../interfaces'
import {BaseCollection} from "~/models/collections/BaseCollection";

export class OperationReasonCollection extends BaseCollection<OperationReason>{

  constructor(reasons: TransformedOperationReason[] = []) {
    super(reasons.map(reasonData => new OperationReason(reasonData)))
  }
} 