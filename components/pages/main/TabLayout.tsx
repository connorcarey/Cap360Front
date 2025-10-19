import { View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export const TabLayout = (props: { children: React.ReactNode }) => {
    const insets = useSafeAreaInsets();
    return (
        <View className="flex-1" style={{ paddingTop: insets.top, paddingLeft: 8, paddingRight: 8}}>
            {props.children}
        </View>
    )
}