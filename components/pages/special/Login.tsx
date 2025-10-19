import { Text, View, Alert } from "react-native";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { EyeIcon, EyeOffIcon, MailIcon } from '@/components/ui/icon';
import { useState } from "react";
import { Button, ButtonText } from "@/components/ui/button";
import { Image } from '@/components/ui/image';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { getBakraMembersThegoatBakraGet, getFamilyMembersFamilyGetMembersFamilyIdGet } from '@/client';
import { useNavigation } from '@react-navigation/native';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setCurrentUser } = useCurrentUser();
  const navigation = useNavigation();

  const handleState = () => setShowPassword(!showPassword);

  const handleLogin = async () => {
    if (!username.trim()) {
      Alert.alert('Error', 'Please enter a username');
      return;
    }

    setIsLoading(true);
    try {
      // First, get the family data to get the family_id
      const familyResponse = await getBakraMembersThegoatBakraGet();
      const familyData = familyResponse.data as any;
      
      if (!familyData || !familyData.family_id) {
        Alert.alert('Error', 'Could not find family data');
        return;
      }

      // Get all family members
      const membersResponse = await getFamilyMembersFamilyGetMembersFamilyIdGet({
        path: { family_id: familyData.family_id }
      });
      const responseData = membersResponse.data as any;
      const members = responseData?.members || [];

      if (!members || !Array.isArray(members)) {
        Alert.alert('Error', 'Could not find family members');
        return;
      }

      // Find the member that matches the username
      console.log('Looking for user:', username);
      console.log('Available members:', members.map(m => `${m.first_name} ${m.last_name}`));
      
      const matchingMember = members.find(member => {
        const firstName = member.first_name || member.firstName || '';
        const lastName = member.last_name || member.lastName || '';
        const expectedEmail = `${firstName.toLowerCase()}${lastName.toLowerCase()}@gmail.com`;
        console.log(`Checking ${firstName} ${lastName}: ${expectedEmail} vs ${username}`);
        return expectedEmail === username.toLowerCase();
      });

      if (!matchingMember) {
        Alert.alert('Error', 'User not found. Please check your username format: firstnamelastname@gmail.com');
        return;
      }

      // Set the current user
      const currentUser = {
        id: matchingMember.id,
        first_name: matchingMember.first_name || matchingMember.firstName,
        last_name: matchingMember.last_name || matchingMember.lastName,
        email: username,
        family_id: familyData.family_id,
        ...matchingMember
      };

      setCurrentUser(currentUser);
      
      // Navigate to Home
      navigation.navigate('Home' as never);
      
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className={styles.container}>
      <Image
        size="xl"
        source={require('@/assets/images/placeholder-logo.png')}
        alt="logo"
      />
      <Text className="text-white text-xl font-bold mb-4">Login</Text>
      <Input variant="rounded" className={styles.input}>
        <InputField 
          type='text' 
          placeholder="Email"
          value={username}
          onChangeText={(text) => setUsername(text.toLowerCase())}
        />
        <InputSlot className="pr-3">
          <InputIcon as={MailIcon} />
        </InputSlot>
      </Input>
      <Input variant="rounded" className={styles.input}>
        <InputField 
          type={showPassword ? 'text' : 'password'} 
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
        />
        <InputSlot className="pr-3" onPress={handleState}>
          <InputIcon as={showPassword ? EyeIcon : EyeOffIcon} />
        </InputSlot>
      </Input>
      <Button 
        variant="solid" 
        className={styles.button}
        onPress={handleLogin}
        disabled={isLoading}
      >
        <ButtonText>{isLoading ? 'Logging in...' : 'Login'}</ButtonText>
      </Button>
    </View>
  );
};
const styles = {
    logo: 'w-10 h-10',
    container: 'flex-1 items-center justify-center bg-sky-950 p-8 gap-4',
    input: 'bg-neutral-200',
    button: 'bg-red-500'
}
