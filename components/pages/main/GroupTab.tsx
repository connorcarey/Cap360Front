import { View, Text } from "react-native"
import { TabLayout } from "@/components/pages/main/TabLayout"
import { useBakraUser } from "@/hooks/useBakraUser"

export const GroupTab = () => {
    const { data: bakraUser, isLoading, error } = useBakraUser()

    if (isLoading) return <Text>Loading...</Text>
    if (error) return <Text>Error: {error.message}</Text>

    return (
        <TabLayout>
            <Text>Hi {(bakraUser as any)?.id}</Text>
        </TabLayout>
    )
}