import { useQuery } from '@tanstack/react-query';
import { getBakraMembersThegoatBakraGet } from '@/client';

export const useBakraUser = () => {
    return useQuery({
        queryKey: ['bakraUser'],
        queryFn: async () => { const response = await getBakraMembersThegoatBakraGet(); return response.data }
    })
}