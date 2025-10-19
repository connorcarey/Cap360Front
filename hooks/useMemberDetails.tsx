import { useQuery } from "@tanstack/react-query"
import { getMemberMembersMemberIdGet, getIndebtedToMembersMemberIdGetIndebtedToGet } from "@/client"

// Custom hook to fetch member details by ID
export const useMemberDetails = (memberId?: string) => {
    return useQuery({
        queryKey: ['member-details', memberId],
        queryFn: async () => {
            if (!memberId) return null
            const response = await getMemberMembersMemberIdGet({ 
                path: { member_id: memberId } 
            })
            return response.data
        },
        enabled: !!memberId,
        staleTime: 0, // Data is immediately stale
        cacheTime: 0, // Don't cache the data
        refetchOnWindowFocus: true, // Refetch when window/tab gains focus
        refetchOnMount: true, // Always refetch on mount
    })
}

// Custom hook to fetch indebted information for a member
export const useIndebtedTo = (memberId?: string) => {
    return useQuery({
        queryKey: ['indebted-to', memberId],
        queryFn: async () => {
            if (!memberId) return null
            const response = await getIndebtedToMembersMemberIdGetIndebtedToGet({ 
                path: { member_id: memberId } 
            })
            return response.data
        },
        enabled: !!memberId,
        staleTime: 0, // Data is immediately stale
        cacheTime: 0, // Don't cache the data
        refetchOnWindowFocus: true, // Refetch when window/tab gains focus
        refetchOnMount: true, // Always refetch on mount
    })
}

// Custom hook to fetch multiple member details
export const useMultipleMemberDetails = (memberIds: string[]) => {
    return useQuery({
        queryKey: ['multiple-member-details', memberIds],
        queryFn: async () => {
            if (memberIds.length === 0) return {}
            
            const memberPromises = memberIds.map(async (id) => {
                try {
                    const response = await getMemberMembersMemberIdGet({ 
                        path: { member_id: id } 
                    })
                    return { id, data: response.data }
                } catch (error) {
                    console.error(`Failed to fetch member ${id}:`, error)
                    return { id, data: null }
                }
            })
            
            const results = await Promise.all(memberPromises)
            return results.reduce((acc, { id, data }) => {
                acc[id] = data
                return acc
            }, {} as Record<string, any>)
        },
        enabled: memberIds.length > 0,
        staleTime: 0, // Data is immediately stale
        cacheTime: 0, // Don't cache the data
        refetchOnWindowFocus: true, // Refetch when window/tab gains focus
        refetchOnMount: true, // Always refetch on mount
    })
}
