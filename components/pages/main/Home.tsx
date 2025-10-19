import { Icon, BellIcon, CircleIcon} from "@/components/ui/icon"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { RequestsTab } from "@/components/pages/main/RequestsTab"
import { GroupTab } from "@/components/pages/main/GroupTab"
import { AlertsTab } from "@/components/pages/main/AlertsTab"

export const Home = () => {
    const Tab = createBottomTabNavigator();

    const styles = {
        icon: 'w-10 h-10'
    }

    return (
        <Tab.Navigator>
            <Tab.Screen name="Requests" component={RequestsTab} options={{ headerShown: false, tabBarIcon: ({ color, size }) => <Icon as={CircleIcon} size="xl" />}}/>
            <Tab.Screen name="Group" component={GroupTab} options={{ headerShown: false, tabBarIcon: ({ color, size }) => <Icon as={CircleIcon} size="xl" />}}/>
            <Tab.Screen name="Alerts" component={AlertsTab} options={{ headerShown: false, tabBarIcon: ({ color, size }) => <Icon as={BellIcon} size="xl" />}}/>
        </Tab.Navigator>
    )

}


