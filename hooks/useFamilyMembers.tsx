import { useQuery } from "@tanstack/react-query"
import { getFamilyMembersFamilyGetMembersFamilyIdGet } from "@/client"

// Define the family member type based on the API response
export interface FamilyMember {
    id: string;
    first_name?: string;
    last_name?: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    surname?: string;
    username?: string;
    email?: string;
    display_name?: string;
    full_name?: string;
    // Add other properties as needed based on actual API response
}

// Custom hook for family members
export const useFamilyMembers = (familyId?: string) => {
    return useQuery({
        queryKey: ['family-members', familyId],
        queryFn: async () => {
            if (!familyId) return []
            const response = await getFamilyMembersFamilyGetMembersFamilyIdGet({ 
                path: { family_id: familyId } 
            })
            
            if (Array.isArray(response.data)) {
                return response.data as FamilyMember[]
            } else if (response.data && typeof response.data === 'object' && 'members' in response.data) {
                return (response.data as any).members as FamilyMember[]
            }
            return []
        },
        enabled: !!familyId
    })
}
