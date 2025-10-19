import { View, Text } from "react-native"
import { useState } from "react"
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input"
import { GripVerticalIcon, ChevronDownIcon } from "@/components/ui/icon"
import { Button, ButtonText } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallbackText } from "@/components/ui/avatar"
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
import { useBakraUser } from "@/hooks/useBakraUser"
import { getFamilyMembersFamilyGetMembersFamilyIdGet, requestMoneyMembersFromIdRequestMoneyPost } from "@/client"
import { useQuery, useMutation } from "@tanstack/react-query"

// Define the family member type based on the API response
interface FamilyMember {
    id: string;
    first_name: string;
    last_name: string;
    // Add other properties as needed based on actual API response
}

// Define the bakra user type (we only care about family_id here and user_id)
interface BakraUser {
    id: string;
    family_id: string;
    // Add other properties as needed based on actual API response
}

export const RequestsTab = () => {
    const [selectedMemberId, setSelectedMemberId] = useState<string>("")
    const [amount, setAmount] = useState<string>("")
    const [validationError, setValidationError] = useState<string>("")
    const [successMessage, setSuccessMessage] = useState<string>("")

    const { data: bakraUser, isLoading: userLoading, error: userError } = useBakraUser()

    // Validation function for amount
    const validateAmount = (amountStr: string): boolean => {
        const amountRegex = /^\d+(\.\d{1,2})?$/
        return amountRegex.test(amountStr) && parseFloat(amountStr) > 0
    }

    // Mutation for sending money request
    const sendMoneyRequestMutation = useMutation({
        mutationFn: async () => {
            const user = bakraUser as BakraUser
            if (!user?.id || !selectedMemberId || !amount) {
                throw new Error("Missing required fields")
            }
            
            console.log('Sending money request:', {
                from_id: user.id,
                to_id: selectedMemberId,
                amount: parseFloat(amount)
            })
            
            return await requestMoneyMembersFromIdRequestMoneyPost({
                path: { from_id: user.id },
                query: { 
                    to_id: selectedMemberId, 
                    amount: parseFloat(amount),
                    description: `Money request for $${amount}`
                }
            })
        },
        onSuccess: () => {
            setAmount("")
            setSelectedMemberId("")
            setValidationError("")
            setSuccessMessage(`Money request sent successfully!`)
            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMessage(""), 3000)
        },
        onError: (error: any) => {
            console.error('Money request failed:', error)
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
        if (!bakraUser?.id) {
            setValidationError("User data not available. Please try again.")
            return
        }
        
        sendMoneyRequestMutation.mutate()
    }

    const { data: familyMembers, isLoading: familyLoading, error: familyError } = useQuery({
        queryKey: ['family-members', (bakraUser as BakraUser)?.family_id],
        queryFn: async () => {
            const user = bakraUser as BakraUser
            if (!user?.family_id) return []
            const response = await getFamilyMembersFamilyGetMembersFamilyIdGet({ 
                path: { family_id: user.family_id } 
            })
            console.log('Family members API response:', response.data)
            // Handle different possible response structures
            if (Array.isArray(response.data)) {
                return response.data as FamilyMember[]
            } else if (response.data && typeof response.data === 'object' && 'members' in response.data) {
                return (response.data as any).members as FamilyMember[]
            } else if (response.data && typeof response.data === 'object' && 'family_members' in response.data) {
                return (response.data as any).family_members as FamilyMember[]
            }
            return []
        },
        enabled: !!(bakraUser as BakraUser)?.family_id
    })

    if (userLoading || familyLoading) return <Text>Loading...</Text>
    if (userError) return <Text>Error: {userError.message}</Text>
    if (familyError) return <Text>Error: {familyError.message}</Text>

    // Debug logging
    console.log('BakraUser:', bakraUser)
    console.log('FamilyMembers:', familyMembers)
    console.log('FamilyMembers type:', typeof familyMembers)
    console.log('Is Array:', Array.isArray(familyMembers))

    return (
        <View className="flex-1 flex-col">
            <Avatar className="absolute z-10 top-1/4 left-1/2 h-[200] w-[200] mt-[-100] ml-[-100] ">
                <AvatarFallbackText>
                    {selectedMemberId && familyMembers 
                        ? (() => {
                            const selectedMember = familyMembers.find(member => member.id === selectedMemberId);
                            return selectedMember 
                                ? `${selectedMember.first_name.charAt(0)}${selectedMember.last_name.charAt(0)}`
                                : "X";
                          })()
                        : "X"
                    }
                </AvatarFallbackText>
                <AvatarImage source={require('@/assets/images/placeholder-logo.png')} />
            </Avatar>
            <View className="h-1/4 bg-red-500"></View>
            <View className="flex-1 flex flex-col items-center justify-center ml-24 mr-24 gap-4">
                <Input variant="underlined" size="lg">
                    <InputIcon as={GripVerticalIcon}/>
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
                                            const selectedMember = familyMembers.find(member => member.id === selectedMemberId);
                                            return selectedMember 
                                                ? `${selectedMember.first_name} ${selectedMember.last_name.charAt(0)}.`
                                                : "";
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
                                    .filter((member: FamilyMember) => member.id !== (bakraUser as BakraUser)?.id)
                                    .map((member: FamilyMember) => (
                                    <SelectItem 
                                        key={member.id} 
                                        label={`${member.first_name} ${member.last_name}`} 
                                        value={member.id} 
                                    />
                                ))}
                            </SelectContent>
                        </SelectPortal>
                    </Select>
                    <View className="flex-1"></View>
                </View>
                
                {/* Success Message */}
                {successMessage && (
                    <View className="bg-green-100 border border-green-400 rounded-lg p-3 mb-2">
                        <Text className="text-green-700 text-center font-medium">
                            {successMessage}
                        </Text>
                    </View>
                )}
                
                {/* Error Message */}
                {validationError && (
                    <View className="bg-red-100 border border-red-400 rounded-lg p-3 mb-2">
                        <Text className="text-red-700 text-center font-medium">
                            {validationError}
                        </Text>
                    </View>
                )}
                
                {/* Send Button with Dynamic Styling */}
                <Button 
                    size="md" 
                    className={
                        sendMoneyRequestMutation.isPending 
                            ? "bg-yellow-500" 
                            : sendMoneyRequestMutation.isError 
                                ? "bg-red-500" 
                                : "bg-green-500"
                    }
                    onPress={handleSend}
                    disabled={sendMoneyRequestMutation.isPending}
                >
                    <ButtonText>
                        {sendMoneyRequestMutation.isPending 
                            ? "Sending..." 
                            : sendMoneyRequestMutation.isError 
                                ? "Retry Send" 
                                : "Send"
                        }
                    </ButtonText>
                </Button>
            </View>
        </View>
    )
}