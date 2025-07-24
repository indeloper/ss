import { useApi } from "~/composables/useApi"
import { ContractorAdapter } from "~/models/adapters/ContractorAdapter"
import { ContractorCollection } from "~/models/collections/ContractorCollection"

export const useContractor = () => {
    const fetchContractors = async () => {
        const response = await useApi().get('/contractors/list')

        const transformed = ContractorAdapter.transformMany(JSON.parse(response))
        return new ContractorCollection(transformed)
    }

    return {
        fetchContractors
    }
}