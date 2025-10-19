import { useQuery } from '@tanstack/react-query';
import { getFamilyMembersFamilyGetMembersFamilyIdGet } from '@/client';
import { useCurrentUser } from './useCurrentUser';

export const useCurrentUserData = () => {
    const { currentUser } = useCurrentUser();
    
    return useQuery({
        queryKey: ['currentUserData', currentUser?.id],
        queryFn: async () => { 
            if (!currentUser?.family_id) {
                throw new Error('No family ID available');
            }
            
            const response = await getFamilyMembersFamilyGetMembersFamilyIdGet({
                path: { family_id: currentUser.family_id }
            });
            
            const responseData = response.data as any;
            const members = responseData?.members || [];
            
            // Find the current user's data from the members array
            const userData = members.find((member: any) => member.id === currentUser.id);
            
            if (!userData) {
                throw new Error('Current user data not found');
            }
            
            return userData;
        },
        enabled: !!currentUser && !!currentUser.family_id, // Only run query if user is logged in and has family_id
        staleTime: 0, // Data is immediately stale
        cacheTime: 0, // Don't cache the data
        refetchOnWindowFocus: true, // Refetch when window/tab gains focus
        refetchOnMount: true, // Always refetch on mount
    })
}
