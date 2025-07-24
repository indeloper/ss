export const useMaterialSupply = () => {
    const store = async (data: any) => {
        await useApi().post('/operations/supply', data);
    }
    return { store }
}