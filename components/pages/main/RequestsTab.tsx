import { View, Text } from "react-native"
import { useState } from "react"
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input"
import { MoneyIcon, ChevronDownIcon } from "@/components/ui/icon"
import { Button, ButtonText } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallbackText } from "@/components/ui/avatar"
import { ErrorWithReload } from "@/components/ui/error-with-reload"
import {
    Select,
    SelectTrigger,
    SelectInput,
    SelectIcon,
    SelectPortal,
    SelectBackdrop,
    SelectContent,
    SelectDragIndicator,
    SelectDragIndicatorWrapper,
    SelectItem,
  } from '@/components/ui/select';
import { useCurrentUserData } from "@/hooks/useCurrentUserData"
import { useFamilyMembers, FamilyMember } from "@/hooks/useFamilyMembers"
import { requestMoneyRequestFromIdRequestMoneyPost } from "@/client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import * as Updates from 'expo-updates'
import { useSafeAreaInsets } from "react-native-safe-area-context"

// Define the BakraUser type based on the API response
interface CurrentUserData {
    id: string;
    family_id: string;
    // Add other properties as needed based on actual API response
}

// Function to get the appropriate profile image based on recipient name
const getRecipientImage = (firstName?: string) => {
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

// Custom hook for money request mutation
const useMoneyRequest = () => {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: async ({ fromId, toId, amount }: { fromId: string; toId: string; amount: number }) => {
            return await requestMoneyRequestFromIdRequestMoneyPost({
                path: { from_id: fromId },
                query: { 
                    to_id: toId, 
                    amount,
                    description: `Money request for $${amount}`
                }
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['family-members'] })
        }
    })
}

export const RequestsTab = () => {
    const insets = useSafeAreaInsets();
    const [selectedMemberId, setSelectedMemberId] = useState<string>("")
    const [amount, setAmount] = useState<string>("")
    const [validationError, setValidationError] = useState<string>("")
    const [successMessage, setSuccessMessage] = useState<string>("")
    const { data: currentUserData, isLoading: userLoading, error: userError } = useCurrentUserData()
    const { data: familyMembers, isLoading: familyLoading, error: familyError } = useFamilyMembers((currentUserData as CurrentUserData)?.family_id)
    const moneyRequestMutation = useMoneyRequest()

    // Validation function for amount
    const validateAmount = (amountStr: string): boolean => {
        const amountRegex = /^\d+(\.\d{1,2})?$/
        return amountRegex.test(amountStr) && parseFloat(amountStr) > 0
    }

    const handleSend = () => {
        setValidationError("")
        setSuccessMessage("")
        
        // Validate recipient selection
        if (!selectedMemberId) {
            setValidationError("Please select a family member")
            return
        }
        
        // Validate amount
        if (!amount.trim()) {
            setValidationError("Please enter an amount")
            return
        }
        
        if (!validateAmount(amount)) {
            setValidationError("Please enter a valid amount (e.g., 10.50)")
            return
        }
        
        // Check if user data is available
        if (!(currentUserData as any)?.id) {
            setValidationError("User data not available. Please try again.")
            return
        }
        
        moneyRequestMutation.mutate({
            fromId: (currentUserData as CurrentUserData).id,
            toId: selectedMemberId,
            amount: parseFloat(amount)
        }, {
            onSuccess: () => {
                setAmount("")
                setValidationError("")
                setSuccessMessage(`Money request sent successfully!`)
                setTimeout(() => setSuccessMessage(""), 3000)
            },
            onError: (error: any) => {
                setSuccessMessage("")
                let errorMessage = "Failed to send request"
                
                if (error?.message) {
                    errorMessage = error.message
                } else if (error?.response?.data?.message) {
                    errorMessage = error.response.data.message
                } else if (error?.response?.status) {
                    errorMessage = `Request failed with status ${error.response.status}`
                }
                
                setValidationError(errorMessage)
            }
        })
    }

    if (userLoading || familyLoading) return (
        <View className="flex-1 items-center justify-center" style={{ paddingTop: insets.top }}>
            <Text className="text-lg text-typography-500">Loading... Request Page</Text>
        </View>
    )
    if (userError) return (
        <ErrorWithReload
            title="Failed to load user data"
            message="Unable to load your profile information. Please check your connection and try again."
                    onReload={() => {
                        // Refetch user data
                        try {
                            if (typeof Updates.reloadAsync === 'function') {
                                Updates.reloadAsync();
                            }
                        } catch (error) {
                            // Error handling for reload
                        }
                    }}
        />
    )
    if (familyError) return (
        <ErrorWithReload
            title="Failed to load family members"
            message="Unable to load family member information. Please check your connection and try again."
                    onReload={() => {
                        // Refetch family data
                        try {
                            if (typeof Updates.reloadAsync === 'function') {
                                Updates.reloadAsync();
                            }
                        } catch (error) {
                            // Error handling for reload
                        }
                    }}
        />
    )


    return (
        <View className="flex-1 flex-col">
            <Avatar className="absolute z-10 top-1/4 left-1/2 h-[200] w-[200] mt-[-100] ml-[-100] bg-sky-950 border-2 border-sky-950">
                <AvatarFallbackText className="bg-sky-950 text-white">
                    {selectedMemberId && familyMembers 
                        ? (() => {
                            const selectedMember = (familyMembers as FamilyMember[]).find((member: FamilyMember) => member.id === selectedMemberId);
                            
                            if (selectedMember) {
                                // Use member's name directly
                                const firstName = selectedMember.first_name || selectedMember.firstName || selectedMember.name || 'U'
                                const lastName = selectedMember.last_name || selectedMember.lastName || selectedMember.surname || 'U'
                                return `${firstName.charAt(0)}${lastName.charAt(0)}`
                            }
                            
                            return selectedMemberId.charAt(0) + (selectedMemberId.charAt(1) || 'U')
                          })()
                        : ""
                    }
                </AvatarFallbackText>
                {selectedMemberId && familyMembers && (() => {
                    const selectedMember = (familyMembers as FamilyMember[]).find((member: FamilyMember) => member.id === selectedMemberId);
                    return selectedMember ? (
                        <AvatarImage source={getRecipientImage(selectedMember.first_name)} />
                    ) : null;
                })()}
            </Avatar>
            <View className="h-1/4 bg-red-500"></View>
            <View className="flex-1 flex flex-col items-center justify-center ml-24 mr-24 gap-4">
                <Input variant="underlined" size="lg">
                    <InputIcon as={MoneyIcon}/>
                    <InputField 
                        type='text' 
                        keyboardType="numeric" 
                        placeholder="Enter amount"
                        value={amount}
                        onChangeText={setAmount}
                        className="pl-3"
                    />
                    <InputSlot className="pr-3">
                    </InputSlot>
                </Input>
                <View className="w-full flex flex-row">
                    <Select className="w-1/2" selectedValue={selectedMemberId} onValueChange={setSelectedMemberId}>
                        <SelectTrigger variant="underlined" size="lg">
                            <SelectIcon className="mr-3" as={ChevronDownIcon} />
                            <SelectInput 
                                placeholder="Recipient" 
                                value={
                                    selectedMemberId && familyMembers 
                                        ? (() => {
                                            const selectedMember = (familyMembers as FamilyMember[]).find((member: FamilyMember) => member.id === selectedMemberId);
                                            
                                            if (selectedMember) {
                                                // Use member's name directly
                                                const firstName = selectedMember.first_name || selectedMember.firstName || selectedMember.name || 'Unknown'
                                                const lastName = selectedMember.last_name || selectedMember.lastName || selectedMember.surname || 'Unknown'
                                                return `${firstName} ${lastName.charAt(0)}.`
                                            }
                                            
                                            return `Member ${selectedMemberId}`
                                          })()
                                        : ""
                                }
                            />
                        </SelectTrigger>
                        <SelectPortal>
                            <SelectBackdrop />
                            <SelectContent>
                                <SelectDragIndicatorWrapper>
                                    <SelectDragIndicator />
                                </SelectDragIndicatorWrapper>
                                {familyMembers && Array.isArray(familyMembers) && familyMembers
                                    .filter((member: FamilyMember) => member.id !== (currentUserData as CurrentUserData)?.id)
                                    .map((member: FamilyMember, index: number) => {
                                        // Use member's name directly
                                        const firstName = member.first_name || member.firstName || member.name || 'Unknown'
                                        const lastName = member.last_name || member.lastName || member.surname || 'Unknown'
                                        const displayName = `${firstName} ${lastName}`
                                        
                                        return (
                                            <SelectItem 
                                                key={`${member.id}-${index}`} 
                                                label={displayName} 
                                                value={member.id} 
                                            />
                                        )
                                    })}
                            </SelectContent>
                        </SelectPortal>
                    </Select>
                    <View className="flex-1"></View>
                </View>
                
                {/* Send Button with Dynamic Styling */}
                <Button 
                    size="lg" 
                    className={`w-full ${
                        moneyRequestMutation.isPending 
                            ? "bg-yellow-500" 
                            : moneyRequestMutation.isError 
                                ? "bg-red-500" 
                                : "bg-green-500"
                    }`}
                    onPress={handleSend}
                    disabled={moneyRequestMutation.isPending}
                >
                    <ButtonText>
                        {moneyRequestMutation.isPending 
                            ? "Sending..." 
                            : moneyRequestMutation.isError 
                                ? "Retry Send" 
                                : "Send"
                        }
                    </ButtonText>
                </Button>
                
                {/* Message Container - Fixed height to prevent UI shift */}
                <View className="h-16 justify-center">
                    {/* Success Message */}
                    {successMessage && (
                        <View className="bg-green-100 border border-green-400 rounded-lg p-3">
                            <Text className="text-green-700 text-center font-medium">
                                {successMessage}
                            </Text>
                        </View>
                    )}
                    
                    {/* Error Message */}
                    {validationError && (
                        <View className="bg-red-100 border border-red-400 rounded-lg p-3">
                            <Text className="text-red-700 text-center font-medium mb-2">
                                {validationError}
                            </Text>
                            {(validationError.includes('Failed to send request') || 
                              validationError.includes('Request failed') ||
                              validationError.includes('status') ||
                              moneyRequestMutation.isError) && (
                                <Button 
                                    size="sm" 
                                    className="bg-red-500 mt-2"
                                    onPress={() => {
                                        try {
                                            if (typeof Updates.reloadAsync === 'function') {
                                                Updates.reloadAsync();
                                            }
                                        } catch (error) {
                                            // Error handling for reload
                                        }
                                    }}
                                >
                                    <ButtonText>Retry</ButtonText>
                                </Button>
                            )}
                        </View>
                    )}
                </View>
            </View>
        </View>
    )
}