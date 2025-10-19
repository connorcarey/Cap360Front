import { Icon, BellIcon, BarChartIcon, GroupIcon, MoneyBagIcon} from "@/components/ui/icon"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { RequestsTab } from "@/components/pages/main/RequestsTab"
import { GroupTab } from "@/components/pages/main/GroupTab"
import { AlertsTab } from "@/components/pages/main/AlertsTab"
import { Dashboard } from "@/components/pages/main/Dashboard"

export const Home = () => {
    const Tab = createBottomTabNavigator();

    return (
        <Tab.Navigator>
            <Tab.Screen name="Dashboard" component={Dashboard} options={{ headerShown: false, tabBarIcon: ({ color, size }) => <Icon as={BarChartIcon} size="xl" />}}/>
            <Tab.Screen name="Request" component={RequestsTab} options={{ headerShown: false, tabBarIcon: ({ color, size }) => <Icon as={MoneyBagIcon} size="xl" />}}/>
            <Tab.Screen name="Group" component={GroupTab} options={{ headerShown: false, tabBarIcon: ({ color, size }) => <Icon as={GroupIcon} size="xl" />}}/>
            <Tab.Screen name="Alerts" component={AlertsTab} options={{ headerShown: false, tabBarIcon: ({ color, size }) => <Icon as={BellIcon} size="xl" />}}/>
        </Tab.Navigator>
    )

}


