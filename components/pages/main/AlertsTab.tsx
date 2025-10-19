import { View, Text } from "react-native"
import { useState } from "react"
import { TabLayout } from "@/components/pages/main/TabLayout"
import { Button, ButtonText } from "@/components/ui/button"

export const AlertsTab = () => {
    const [activeTab, setActiveTab] = useState<'general' | 'alerts'>('general')

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
                        General
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
                        Alerts
                    </ButtonText>
                </Button>
            </View>

            {/* Tab Content */}
            <View className="flex-1">
                {activeTab === 'general' ? (
                    <Text className="text-lg text-typography-800">General content goes here</Text>
                ) : (
                    <Text className="text-lg text-typography-800">Alerts content goes here</Text>
                )}
            </View>
        </TabLayout>
    )
}