import React from 'react';
import { View, Text } from 'react-native';
import { Button, ButtonText } from '@/components/ui/button';
import { RepeatIcon } from '@/components/ui/icon';

interface ErrorWithReloadProps {
  title?: string;
  message: string;
  onReload: () => void;
  isLoading?: boolean;
}

export const ErrorWithReload: React.FC<ErrorWithReloadProps> = ({
  title = "Something went wrong",
  message,
  onReload,
  isLoading = false
}) => {
  return (
    <View className="flex-1 items-center justify-center p-6">
      <View className="bg-red-50 border border-red-200 rounded-lg p-6 w-full max-w-sm">
        <Text className="text-lg font-semibold text-red-800 mb-2 text-center">
          {title}
        </Text>
        <Text className="text-red-600 text-center mb-4">
          {message}
        </Text>
        <Button 
          onPress={onReload}
          disabled={isLoading}
          className="bg-red-500"
        >
          <ButtonText className="flex-row items-center justify-center">
            <RepeatIcon 
              size="xs" 
              className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} 
            />
            {isLoading ? 'Retrying...' : 'Try Again'}
          </ButtonText>
        </Button>
      </View>
    </View>
  );
};
