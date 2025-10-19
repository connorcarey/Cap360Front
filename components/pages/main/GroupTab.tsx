import { View, Text, ScrollView, Image, Pressable } from "react-native"
import React, { useState } from "react"
import { TabLayout } from "@/components/pages/main/TabLayout"
import { useBakraUser } from "@/hooks/useBakraUser"
import { useFamilyMembers, FamilyMember } from "@/hooks/useFamilyMembers"
import { useIndebtedTo } from "@/hooks/useMemberDetails"
import { ErrorWithReload } from "@/components/ui/error-with-reload"
import { Input, InputField, InputIcon } from "@/components/ui/input"
import { Button, ButtonText } from "@/components/ui/button"
import { Icon, MoneyIcon, CheckIcon, CloseIcon } from "@/components/ui/icon"
import { resolveDebtRequestResolveDebtFromIdToIdPost } from "@/client"
import { useMutation, useQueryClient } from "@tanstack/react-query"

// Define the BakraUser type based on the API response
interface BakraUser {
    id: string;
    family_id: string;
    // Add other properties as needed based on actual API response
}

// Helper function to get member name
const getMemberName = (member: FamilyMember): string => {
    if (!member) return 'Unknown'
    
    const firstName = member.first_name || member.firstName || member.name || ''
    const lastName = member.last_name || member.lastName || member.surname || ''
    
    if (firstName && lastName) {
        return `${firstName} ${lastName}`
    } else if (firstName) {
        return firstName
    } else if (lastName) {
        return lastName
    }
    
    return 'Unknown'
}

// Function to get the appropriate profile image based on member name
const getMemberImage = (firstName?: string) => {
    if (!firstName) return require('@/assets/images/default.jpg')
    
    const name = firstName.toLowerCase()
    
    switch (name) {
        case 'chinmay':
            return require('@/assets/images/chinmay.png')
        case 'connor':
            return require('@/assets/images/connor.png')
        case 'aiyaz':
            return require('@/assets/images/aiyaz.png')
        default:
            return require('@/assets/images/default.jpg')
    }
}

export const GroupTab = () => {
    const [isReloading, setIsReloading] = useState(false)
    const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null)
    const [amount, setAmount] = useState<string>("")
    const [validationError, setValidationError] = useState<string>("")
    const [isProcessing, setIsProcessing] = useState(false)
    const queryClient = useQueryClient()
    
    const { data: bakraUser, isLoading: userLoading, error: userError, refetch: refetchBakraUser } = useBakraUser()
    const { data: familyMembers, isLoading: familyLoading, error: familyError, refetch: refetchFamilyMembers } = useFamilyMembers((bakraUser as BakraUser)?.family_id)
    const { data: indebtedData, isLoading: indebtedLoading, error: indebtedError, refetch: refetchIndebted } = useIndebtedTo((bakraUser as BakraUser)?.id)

    // Mutation for resolving debt
    const resolveDebtMutation = useMutation({
        mutationFn: async ({ fromId, toId, amount }: { fromId: string; toId: string; amount: number }) => {
            return await resolveDebtRequestResolveDebtFromIdToIdPost({
                path: { 
                    from_id: fromId, 
                    to_id: toId 
                },
                query: { 
                    amount 
                }
            })
        },
        onSuccess: async () => {
            console.log('Payment successful, refreshing data...')
            
            // Wait a moment for the server to process the payment
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            // Invalidate ALL queries to ensure complete refresh
            await queryClient.invalidateQueries()
            
            // Refetch specific data
            const [indebtedResult, userResult, familyResult] = await Promise.all([
                refetchIndebted(),
                refetchBakraUser(),
                refetchFamilyMembers()
            ])
            
            // Debug logging
            console.log('Refetch results:')
            console.log('Indebted data:', indebtedResult.data)
            console.log('User data:', userResult.data)
            console.log('User current_debt:', (userResult.data as any)?.current_debt)
            
            // Close drawer and reset form
            closeDrawer()
            setIsProcessing(false)
        },
        onError: (error) => {
            console.error('Failed to resolve debt:', error)
            setValidationError('Failed to process payment. Please try again.')
            setIsProcessing(false)
        }
    })

    // Validation function for amount (same as RequestsTab)
    const validateAmount = (amountStr: string): boolean => {
        const amountRegex = /^\d+(\.\d{1,2})?$/
        return amountRegex.test(amountStr) && parseFloat(amountStr) > 0
    }

    // Function to open drawer for a member
    const openDrawer = (member: FamilyMember) => {
        setSelectedMember(member)
        setAmount("")
        setValidationError("")
    }

    // Function to close drawer
    const closeDrawer = () => {
        setSelectedMember(null)
        setAmount("")
        setValidationError("")
    }

    // Function to handle checkmark (process payment)
    const handleCheck = () => {
        if (!validateAmount(amount)) {
            setValidationError("Please enter a valid amount")
            return
        }
        
        if (!selectedMember) {
            setValidationError("No member selected")
            return
        }
        
        const currentUserId = (bakraUser as BakraUser)?.id
        if (!currentUserId) {
            setValidationError("Unable to identify current user")
            return
        }
        
        setIsProcessing(true)
        setValidationError("")
        
        resolveDebtMutation.mutate({
            fromId: currentUserId,
            toId: selectedMember.id,
            amount: parseFloat(amount)
        })
    }

    const handleReload = async () => {
        setIsReloading(true)
        try {
            await Promise.all([
                refetchBakraUser(),
                refetchFamilyMembers(),
                refetchIndebted()
            ])
        } catch (error) {
            console.error('Error reloading data:', error)
        } finally {
            setIsReloading(false)
        }
    }

    // Loading state
    if (userLoading || familyLoading || indebtedLoading || isReloading) {
        return (
            <TabLayout>
                <View className="flex-1 items-center justify-center">
                    <Text className="text-lg text-typography-500">
                        {isReloading ? 'Refreshing family members...' : 'Loading family members...'}
                    </Text>
                </View>
            </TabLayout>
        )
    }

    // Error state
    if (userError || familyError || indebtedError) {
        return (
            <TabLayout>
                <ErrorWithReload
                    title="Failed to load family data"
                    message="Unable to load your family information. Please check your connection and try again."
                    onReload={handleReload}
                    isLoading={isReloading}
                />
            </TabLayout>
        )
    }

    const allMembers = familyMembers as FamilyMember[] || []
    const currentUserId = (bakraUser as BakraUser)?.id
    
    // Filter out the current user from the members list
    const members = allMembers.filter((member: FamilyMember) => member.id !== currentUserId)
    
    // Helper function to get debt amount for a specific member
    const getDebtAmount = (memberId: string): number => {
        if (!indebtedData || typeof indebtedData !== 'object') return 0
        
        // Look for debt to this specific member
        const debtToMember = (indebtedData as any)[memberId]
        return debtToMember ? parseFloat(debtToMember.toString()) : 0
    }

    return (
        <TabLayout>
            <ScrollView className="flex-1" contentContainerStyle={{ paddingVertical: 16 }}>
                {members.length === 0 ? (
                    <View className="flex-1 items-center justify-center py-8">
                        <Text className="text-lg text-typography-500">No family members found</Text>
                    </View>
                ) : (
                    <View>
                        {members.map((member, index) => {
                            const memberName = getMemberName(member)
                            const firstName = member.first_name || member.firstName || member.name || ''
                            const memberImage = getMemberImage(firstName)
                            const debtAmount = getDebtAmount(member.id)
                            
                            return (
                                <View key={member.id} className={`${index > 0 ? 'mt-4' : ''}`}>
                                    {debtAmount > 0 ? (
                                        <Pressable 
                                            className="bg-white border border-gray-200 rounded-lg p-4"
                                            onPress={() => openDrawer(member)}
                                        >
                                            <View className="flex-row items-center">
                                                {/* Profile Image */}
                                                <View className="w-12 h-12 rounded-full overflow-hidden mr-4">
                                                    <Image 
                                                        source={memberImage}
                                                        className="w-full h-full"
                                                        resizeMode="cover"
                                                    />
                                                </View>
                                                
                                                {/* Member Info */}
                                                <View className="flex-1">
                                                    <Text className="text-lg font-semibold text-typography-800">
                                                        {memberName}
                                                    </Text>
                                                    
                                                    {member.email && (
                                                        <Text className="text-sm text-typography-500 mt-1">
                                                            {member.email}
                                                        </Text>
                                                    )}
                                                    
                                                    {member.username && (
                                                        <Text className="text-xs text-typography-400 mt-1">
                                                            @{member.username}
                                                        </Text>
                                                    )}
                                                </View>
                                                
                                                {/* Debt Amount */}
                                                <View className="ml-4">
                                                    <Text className="text-lg font-semibold text-red-500">
                                                        -${debtAmount.toFixed(2)}
                                                    </Text>
                                                </View>
                                            </View>
                                            
                                            {/* Expanded Content */}
                                            {selectedMember?.id === member.id && (
                                                <View>
                                                    <View className="mt-4 pt-4 border-t border-gray-200">
                                                        <View className="flex-row items-center gap-3">
                                                            {/* Amount Input */}
                                                            <View className="flex-1">
                                                                <Input variant="underlined" size="lg">
                                                                    <InputIcon as={MoneyIcon}/>
                                                                    <InputField 
                                                                        placeholder="0.00"
                                                                        value={amount}
                                                                        onChangeText={setAmount}
                                                                        keyboardType="numeric"
                                                                    />
                                                                </Input>
                                                                {validationError && (
                                                                    <Text className="text-red-500 text-sm mt-1">
                                                                        {validationError}
                                                                    </Text>
                                                                )}
                                                            </View>
                                                            
                                                            {/* Check Button */}
                                                            <Pressable
                                                                className={`p-3 rounded-full ${isProcessing ? 'bg-gray-400' : 'bg-green-500'}`}
                                                                onPress={handleCheck}
                                                                disabled={isProcessing}
                                                            >
                                                                <Icon as={CheckIcon} className="text-white" />
                                                            </Pressable>
                                                            
                                                            {/* Close Button */}
                                                            <Pressable
                                                                className="p-3 bg-red-500 rounded-full"
                                                                onPress={closeDrawer}
                                                            >
                                                                <Icon as={CloseIcon} className="text-white" />
                                                            </Pressable>
                                                        </View>
                                                    </View>
                                                </View>
                                            )}
                                        </Pressable>
                                    ) : (
                                        <View className="bg-white border border-gray-200 rounded-lg p-4 opacity-60">
                                            <View className="flex-row items-center">
                                                {/* Profile Image */}
                                                <View className="w-12 h-12 rounded-full overflow-hidden mr-4">
                                                    <Image 
                                                        source={memberImage}
                                                        className="w-full h-full"
                                                        resizeMode="cover"
                                                    />
                                                </View>
                                                
                                                {/* Member Info */}
                                                <View className="flex-1">
                                                    <Text className="text-lg font-semibold text-typography-800">
                                                        {memberName}
                                                    </Text>
                                                    
                                                    {member.email && (
                                                        <Text className="text-sm text-typography-500 mt-1">
                                                            {member.email}
                                                        </Text>
                                                    )}
                                                    
                                                    {member.username && (
                                                        <Text className="text-xs text-typography-400 mt-1">
                                                            @{member.username}
                                                        </Text>
                                                    )}
                                                </View>
                                                
                                                {/* No Debt Indicator */}
                                                <View className="ml-4">
                                                    <Text className="text-sm text-typography-400">
                                                        No debt
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    )}
                                </View>
                            )
                        })}
                    </View>
                )}
            </ScrollView>
        </TabLayout>
    )
}