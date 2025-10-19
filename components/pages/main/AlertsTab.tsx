import { View, Text, ScrollView, Pressable } from "react-native"
import React, { useState, useMemo, useEffect } from "react"
import { useFocusEffect } from "@react-navigation/native"
import { TabLayout } from "@/components/pages/main/TabLayout"
import { Button, ButtonText } from "@/components/ui/button"
import { Icon, CheckIcon, CloseIcon, RefreshCwIcon } from "@/components/ui/icon"
import { useCurrentUserData } from "@/hooks/useCurrentUserData"
import { useMultipleMemberDetails } from "@/hooks/useMemberDetails"
import { resolveRequestRequestResolveRequestRequestIdPost } from "@/client"
import { useQueryClient } from "@tanstack/react-query"

// Transaction interface based on the actual API response
interface Transaction {
    id: string;
    type_transaction: string;
    from_id: string;
    to_id: string;
    from_name: string;
    to_name: string;
    amount: number;
    from_debt: number;
    to_debt: number;
    date: string;
    description: string | null;
}

// Request interface based on the actual API response
interface Request {
    id: string;
    from_id: string;
    to_id: string;
    amount: number;
    date: string;
    status: string;
    description: string | null;
}

// CurrentUserData interface - contains both requests and transactions
interface CurrentUserData {
    requests?: Record<string, Request>;
    transactions?: Record<string, Transaction>;
    [key: string]: any; // Allow any additional properties
}

// Helper function to format date
const formatDate = (dateString: string): string => {
    try {
        // Handle the format: 025-10-19T13:45:36.296684
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    } catch (error) {
        return 'Invalid date'
    }
}

// Helper function to get member name
const getMemberName = (memberData: any): string => {
    if (!memberData) return 'Unknown'
    
    const firstName = memberData.first_name || memberData.firstName || memberData.name || ''
    const lastName = memberData.last_name || memberData.lastName || memberData.surname || ''
    
    if (firstName && lastName) {
        return `${firstName} ${lastName}`
    } else if (firstName) {
        return firstName
    } else if (lastName) {
        return lastName
    }
    
    return 'Unknown'
}

export const AlertsTab = () => {
    const [activeTab, setActiveTab] = useState<'general' | 'alerts'>('general')
    const [resolvedRequests, setResolvedRequests] = useState<Set<string>>(new Set())
    const [resolvingRequest, setResolvingRequest] = useState<string | null>(null)
    const queryClient = useQueryClient()
    const { data: currentUserData, isLoading: userLoading, error: userError, refetch: refetchCurrentUserData } = useCurrentUserData()
    
    // Extract requests from current user data - requests is an object, not an array
    const requests: Request[] = useMemo(() => {
        if (!currentUserData) return []
        
        const user = currentUserData as CurrentUserData
        console.log('Processing current user data:', user)
        
        // Check if requests exists and is an object
        if (user.requests && typeof user.requests === 'object') {
            // Convert the requests object to an array
            const requestsArray = Object.values(user.requests)
            console.log('Found requests:', requestsArray)
            return requestsArray
        }
        
        console.log('No requests found in user data')
        return []
    }, [currentUserData])

    // Extract transactions from current user data - transactions is an object, not an array
    const transactions: Transaction[] = useMemo(() => {
        if (!currentUserData) return []
        
        const user = currentUserData as CurrentUserData
        console.log('Processing current user data for transactions:', user)
        
        // Check if transactions exists and is an object
        if (user.transactions && typeof user.transactions === 'object') {
            // Convert the transactions object to an array
            const transactionsArray = Object.values(user.transactions)
            console.log('Found transactions:', transactionsArray)
            return transactionsArray
        }
        
        console.log('No transactions found in user data')
        return []
    }, [currentUserData])
    
    // Sort requests by date (newest first) and filter out resolved ones
    const sortedRequests = useMemo(() => {
        const filteredRequests = requests.filter(request => !resolvedRequests.has(request.id))
        const sorted = [...filteredRequests].sort((a, b) => {
            const dateA = new Date(a.date)
            const dateB = new Date(b.date)
            return dateB.getTime() - dateA.getTime() // Newest first
        })
        return sorted
    }, [requests, resolvedRequests])

    // Sort transactions by date (newest first)
    const sortedTransactions = useMemo(() => {
        const sorted = [...transactions].sort((a, b) => {
            const dateA = new Date(a.date)
            const dateB = new Date(b.date)
            return dateB.getTime() - dateA.getTime() // Newest first
        })
        return sorted
    }, [transactions])
    
    // Get unique member IDs from requests
    const memberIds = useMemo(() => {
        const uniqueIds = new Set(sortedRequests.map(req => req.from_id))
        return Array.from(uniqueIds)
    }, [sortedRequests])
    
    // Fetch member details for all request senders
    const { data: memberDetails, isLoading: membersLoading, refetch: refetchMembers } = useMultipleMemberDetails(memberIds)
    
    // Function to resolve a request
    const resolveRequest = async (requestId: string, accepted: boolean) => {
        try {
            setResolvingRequest(requestId)
            console.log(`Resolving request ${requestId} with accepted: ${accepted}`)
            
            await resolveRequestRequestResolveRequestRequestIdPost({
                path: { request_id: requestId },
                query: { success: accepted }
            })
            
            // Add to resolved requests to remove from UI immediately
            setResolvedRequests(prev => new Set([...prev, requestId]))
            
            // Force invalidate and refetch all current user data
            await queryClient.invalidateQueries({ queryKey: ['currentUserData'] })
            await refetchCurrentUserData()
            
        } catch (error) {
            console.error('Failed to resolve request:', error)
            // You could add error handling/toast here
        } finally {
            setResolvingRequest(null)
        }
    }
    
    // Auto-refresh when tab becomes focused
    useFocusEffect(
        React.useCallback(() => {
            // Refetch data when the tab becomes active
            refetchCurrentUserData()
            if (memberIds.length > 0) {
                refetchMembers()
            }
        }, [refetchCurrentUserData, refetchMembers, memberIds.length])
    )
    
    // Auto-refresh every 30 seconds when on alerts tab
    useEffect(() => {
        if (activeTab === 'alerts') {
            console.log('Setting up auto-refresh interval for alerts tab')
            const interval = setInterval(() => {
                console.log('Auto-refreshing data...')
                refetchCurrentUserData()
                if (memberIds.length > 0) {
                    refetchMembers()
                }
            }, 3000) // 3 seconds - very frequent refresh
            
            return () => {
                console.log('Clearing auto-refresh interval')
                clearInterval(interval)
            }
        }
    }, [activeTab]) // Simplified dependencies
    
    // Loading state
    if (userLoading || membersLoading) {
        return (
            <TabLayout>
                <View className="flex-1 items-center justify-center">
                    <Text className="text-lg text-typography-500">Loading alerts...</Text>
                </View>
            </TabLayout>
        )
    }
    
    // Error state
    if (userError) {
        return (
            <TabLayout>
                <View className="flex-1 items-center justify-center">
                    <Text className="text-lg text-red-500">Failed to load alerts</Text>
                </View>
            </TabLayout>
        )
    }

    return (
        <TabLayout>
            {/* Seamless Tab Navigation */}
            <View className="flex-row bg-transparent mb-4">
                <Button
                    variant="outline"
                    action="default"
                    size="lg"
                    className={`flex-1 border-0 ${activeTab === 'general' ? 'bg-background-100' : 'bg-transparent'}`}
                    onPress={() => setActiveTab('general')}
                >
                    <ButtonText className={`text-lg font-medium ${activeTab === 'general' ? 'text-primary-600' : 'text-typography-500'}`}>
                        Transactions
                    </ButtonText>
                </Button>
                
                <Button
                    variant="outline"
                    action="default"
                    size="lg"
                    className={`flex-1 border-0 ${activeTab === 'alerts' ? 'bg-background-100' : 'bg-transparent'}`}
                    onPress={() => setActiveTab('alerts')}
                >
                    <ButtonText className={`text-lg font-medium ${activeTab === 'alerts' ? 'text-primary-600' : 'text-typography-500'}`}>
                        Requests
                    </ButtonText>
                </Button>
            </View>

            {/* Tab Content */}
            <View className="flex-1">
                {activeTab === 'general' ? (
                    <ScrollView className="flex-1" contentContainerStyle={{ paddingVertical: 16 }}>
                        {sortedTransactions.length === 0 ? (
                            <View className="flex-1 items-center justify-center py-8">
                                <Text className="text-lg text-typography-500">No transactions found</Text>
                            </View>
                        ) : (
                            <View>
                                {sortedTransactions.map((transaction, index) => (
                                    <View 
                                        key={transaction.id}
                                        className={`bg-white border border-gray-200 rounded-lg p-4 ${index > 0 ? 'mt-4' : ''}`}
                                    >
                                        <View className="flex-row justify-between items-start mb-2">
                                            <View className="flex-1">
                                                <Text className="text-lg font-semibold text-typography-800">
                                                    {transaction.from_name} → {transaction.to_name}
                                                </Text>
                                                <Text className="text-sm text-typography-600">
                                                    {transaction.type_transaction === 'resolve_request' ? 'Request Resolved' : transaction.type_transaction}
                                                </Text>
                                            </View>
                                            <Text className={`text-2xl font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                ${Math.abs(transaction.amount).toFixed(2)}
                                            </Text>
                                        </View>
                                        <Text className="text-sm text-typography-500 mb-2">
                                            {formatDate(transaction.date)}
                                        </Text>
                                        {transaction.description && (
                                            <Text className="text-sm text-typography-600 mb-2">
                                                {transaction.description}
                                            </Text>
                                        )}
                                        <View className="flex-row justify-between items-center">
                                            <Text className="text-xs text-typography-400">
                                                From Debt: ${transaction.from_debt.toFixed(2)}
                                            </Text>
                                            <Text className="text-xs text-typography-400">
                                                To Debt: ${transaction.to_debt.toFixed(2)}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}
                    </ScrollView>
                ) : (
                    <ScrollView className="flex-1" contentContainerStyle={{ paddingVertical: 16 }}>
                        {sortedRequests.length === 0 ? (
                            <View className="flex-1 items-center justify-center py-8">
                                <Text className="text-lg text-typography-500">No requests found</Text>
                            </View>
                        ) : (
                            <View>
                                {sortedRequests.map((request, index) => {
                                    const memberData = (memberDetails as Record<string, any>)?.[request.from_id]
                                    const memberName = getMemberName(memberData)
                                    
                                    return (
                                        <View 
                                            key={request.id}
                                            className={`bg-white border border-gray-200 rounded-lg p-4 ${index > 0 ? 'mt-4' : ''}`}
                                        >
                                            <View className="flex-row justify-between items-start mb-2">
                                                <Text className="text-lg font-semibold text-typography-800">
                                                    {memberName}
                                                </Text>
                                                <Text className="text-2xl font-bold text-green-600">
                                                    ${request.amount.toFixed(2)}
                                                </Text>
                                            </View>
                                            <Text className="text-sm text-typography-500">
                                                {formatDate(request.date)}
                                            </Text>
                                            <View className="mt-2 flex-row justify-between items-center">
                                                <Text className="text-xs text-typography-400 uppercase tracking-wide">
                                                    Status: {request.status}
                                                </Text>
                                                <View className="flex-row gap-2">
                                                    <Pressable
                                                        className={`p-2 rounded-full ${resolvingRequest === request.id ? 'bg-gray-200' : 'bg-green-100'}`}
                                                        onPress={() => resolveRequest(request.id, true)}
                                                        disabled={resolvingRequest === request.id}
                                                    >
                                                        <Icon as={CheckIcon} size="sm" className={`${resolvingRequest === request.id ? 'text-gray-400' : 'text-green-600'}`} />
                                                    </Pressable>
                                                    <Pressable
                                                        className={`p-2 rounded-full ${resolvingRequest === request.id ? 'bg-gray-200' : 'bg-red-100'}`}
                                                        onPress={() => resolveRequest(request.id, false)}
                                                        disabled={resolvingRequest === request.id}
                                                    >
                                                        <Icon as={CloseIcon} size="sm" className={`${resolvingRequest === request.id ? 'text-gray-400' : 'text-red-600'}`} />
                                                    </Pressable>
                                                </View>
                                            </View>
                                        </View>
                                    )
                                })}
                            </View>
                        )}
                    </ScrollView>
                )}
            </View>
        </TabLayout>
    )
}