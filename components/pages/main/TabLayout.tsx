import { View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { LogoutButton } from "@/components/ui/logout-button"

export const TabLayout = (props: { children: React.ReactNode }) => {
    const insets = useSafeAreaInsets();
    return (
        <View className="flex-1" style={{ paddingTop: insets.top, paddingLeft: 8, paddingRight: 8}}>
            {/* Top Header with Logout Button */}
            <View className="flex-row justify-end items-center mb-2">
                <LogoutButton size="md" />
            </View>
            {props.children}
        </View>
    )
}