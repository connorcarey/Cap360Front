import { StatusBar } from 'expo-status-bar';

import './global.css';

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';
import { Login } from '@/components/pages/special/Login';
import { Home } from '@/components/pages/main/Home';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CurrentUserProvider } from '@/hooks/useCurrentUser';

const queryClient = new QueryClient();

const Stack = createStackNavigator();
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GluestackUIProvider mode="light">
        <CurrentUserProvider>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="Login">
              <Stack.Screen name="Login" component={Login} options={{ headerShown: false }}/>
              <Stack.Screen name="Home" component={Home} options={{ headerShown: false }}/>
            </Stack.Navigator>
          </NavigationContainer>
        </CurrentUserProvider>
      </GluestackUIProvider>
    </QueryClientProvider>
  );
}
