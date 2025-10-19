import { useQuery } from '@tanstack/react-query';
import { getBakraMembersThegoatBakraGet } from '@/client';

export const useBakraUser = () => {
    return useQuery({
        queryKey: ['bakraUser'],
        queryFn: async () => { const response = await getBakraMembersThegoatBakraGet(); return response.data },
        staleTime: 0, // Data is immediately stale
        cacheTime: 0, // Don't cache the data
        refetchOnWindowFocus: true, // Refetch when window/tab gains focus
        refetchOnMount: true, // Always refetch on mount
    })
}