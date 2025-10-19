import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native"
import { TabLayout } from "@/components/pages/main/TabLayout"
import { Avatar, AvatarImage, AvatarFallbackText } from "@/components/ui/avatar"
import { useBakraUser } from "@/hooks/useBakraUser"
import * as Updates from 'expo-updates'
import { ErrorWithReload } from "@/components/ui/error-with-reload"
// Import for restart functionality
let RNRestart: any = null;
try {
    RNRestart = require('react-native-restart');
} catch (error) {
    console.log('react-native-restart not available, using alternative method');
}

// Define types for the dashboard data
interface BakraUser {
    id: string;
    first_name: string;
    last_name: string;
    balance?: number;
    current_debt?: number;
}

// Dashboard is always for Bakra, so always use Aiyaz image

export const Dashboard = () => {
    const { data: bakraUser, isLoading: userLoading, error: userError } = useBakraUser()

    // Handle profile icon click to restart the app
    const handleProfileClick = () => {
        Alert.alert(
            "Restart App",
            "Are you sure you want to restart the app?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Restart",
                    style: "destructive",
                    onPress: () => {
                        try {
                            // Check if we're in development mode
                            if (__DEV__) {
                                Alert.alert(
                                    "Development Mode",
                                    "App restart is not available in development mode. Please manually restart the app from the terminal or reload the app in your simulator/device.",
                                    [{ text: "OK" }]
                                );
                                return;
                            }

                            // Try Expo Updates first (works in production)
                            if (typeof Updates.reloadAsync === 'function') {
                                Updates.reloadAsync();
                            } else if (RNRestart && typeof RNRestart.Restart === 'function') {
                                // Fallback to react-native-restart
                                RNRestart.Restart();
                            } else {
                                // Final fallback
                                Alert.alert(
                                    "Restart Not Available",
                                    "App restart is not available in this environment. Please manually restart the app.",
                                    [{ text: "OK" }]
                                );
                            }
                        } catch (error) {
                            console.error('Error restarting app:', error);
                            Alert.alert(
                                "Restart Failed",
                                "Failed to restart the app. Please manually restart the app.",
                                [{ text: "OK" }]
                            );
                        }
                    }
                }
            ]
        );
    };

    if (userLoading) {
        return (
            <TabLayout>
                <View className="flex-1 items-center justify-center">
                    <Text className="text-lg text-typography-500">Loading dashboard...</Text>
                </View>
            </TabLayout>
        )
    }

    if (userError) {
        return (
            <TabLayout>
                <ErrorWithReload
                    title="Failed to load user data"
                    message="Unable to load your profile information. Please check your connection and try again."
                    onReload={() => {
                        // Refetch user data by restarting the app
                        try {
                            if (typeof Updates.reloadAsync === 'function') {
                                Updates.reloadAsync();
                            } else if (RNRestart && typeof RNRestart.Restart === 'function') {
                                RNRestart.Restart();
                            }
                        } catch (error) {
                            console.error('Error reloading:', error);
                        }
                    }}
                />
            </TabLayout>
        )
    }

    const user = bakraUser as BakraUser
    const currentBalance = user?.balance || 0
    const totalDebt = user?.current_debt || 0
    const netWorth = currentBalance - totalDebt

    return (
        <TabLayout>
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Header Section */}
                <View className="items-center mb-8">
                    <TouchableOpacity onPress={handleProfileClick} activeOpacity={0.7}>
                        <Avatar className="h-32 w-32 mb-4">
                            <AvatarFallbackText className="text-2xl font-bold">
                                {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                            </AvatarFallbackText>
                            <AvatarImage source={require('@/assets/images/aiyaz.png')} />
                        </Avatar>
                    </TouchableOpacity>
                    <Text className="text-2xl font-bold text-typography-800">
                        Welcome, {user?.first_name}!
                    </Text>
                    <Text className="text-sm text-typography-500">
                        Group Finance Dashboard
                    </Text>
                </View>

                {/* Balance Section */}
                <View className="bg-green-50 rounded-2xl p-8 mb-6">
                    <Text className="text-lg font-semibold text-green-800 mb-2">Current Balance</Text>
                    <Text className="text-4xl font-bold text-green-900 mb-2">
                        ${currentBalance.toFixed(2)}
                    </Text>
                    <Text className="text-sm text-green-600">
                        Available funds
                    </Text>
                </View>

                {/* Outstanding Debt Section */}
                <View className="bg-red-50 rounded-2xl p-8 mb-6">
                    <Text className="text-lg font-semibold text-red-800 mb-2">Outstanding Debt</Text>
                    <Text className="text-4xl font-bold text-red-900 mb-2">
                        ${totalDebt.toFixed(2)}
                    </Text>
                    <Text className="text-sm text-red-600">
                        Money owed to family members
                    </Text>
                </View>

                {/* Net Worth Section */}
                <View className={`rounded-2xl p-8 ${netWorth >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
                    <Text className={`text-lg font-semibold mb-2 ${netWorth >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>
                        Net Worth
                    </Text>
                    <Text className={`text-4xl font-bold mb-2 ${netWorth >= 0 ? 'text-blue-900' : 'text-orange-900'}`}>
                        ${netWorth.toFixed(2)}
                    </Text>
                    <Text className={`text-sm ${netWorth >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                        {netWorth >= 0 ? 'Positive financial position' : 'Negative financial position'}
                    </Text>
                </View>
            </ScrollView>
        </TabLayout>
    )
}