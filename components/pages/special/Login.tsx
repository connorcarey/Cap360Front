import { Text, View } from "react-native";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { EyeIcon, EyeOffIcon, MailIcon } from '@/components/ui/icon';
import { useState } from "react";
import { Button, ButtonText } from "@/components/ui/button";
import { Image } from '@/components/ui/image';

export const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const handleState = () => setShowPassword(!showPassword);
  return (
  <View className={styles.container}>
    <Image
      size="xl"
      source={require('@/assets/images/placeholder-logo.png')}
      alt="logo"
    />
    <Input variant="rounded" className={styles.input}>
      <InputField type='text' />
      <InputSlot className="pr-3">
        <InputIcon as={MailIcon} />
      </InputSlot>
    </Input>
    <Input variant="rounded" className={styles.input}>
        <InputField type={showPassword ? 'text' : 'password'} />
        <InputSlot className="pr-3" onPress={handleState}>
          <InputIcon as={showPassword ? EyeIcon : EyeOffIcon} />
        </InputSlot>
      </Input>
      <Button variant="solid" className={styles.button}>
        <ButtonText>Login</ButtonText>
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
