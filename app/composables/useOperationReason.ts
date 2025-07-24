import { useApi } from "~/composables/useApi"
import { OperationReasonAdapter } from "~/models/adapters/OperationReasonAdapter"
import { OperationReasonCollection } from "~/models/collections/OperationReasonCollection"

export const useOperationReason = () => {
    const fetchTransferOperationReasons = async () => {
        const api = useApi();
        const response = await api.get('/operations/reasons/transfer');
        const transformed = OperationReasonAdapter.transformMany(response.data)
        return new OperationReasonCollection(transformed)
    }
    const fetchSupplyOperationReasons = async () => {
        const api = useApi();
        const response = await api.get('/operations/reasons/supply');
        const transformed = OperationReasonAdapter.transformMany(response.data)
        return new OperationReasonCollection(transformed)
    }
    const fetchWriteOffOperationReasons = async () => {
        const api = useApi();
        const response = await api.get('/operations/reasons/write-off');
        const transformed = OperationReasonAdapter.transformMany(response.data)
        return new OperationReasonCollection(transformed)
    }
    return {
        fetchTransferOperationReasons,
        fetchSupplyOperationReasons,
        fetchWriteOffOperationReasons
    }
}