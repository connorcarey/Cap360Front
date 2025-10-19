import React from 'react';
import { TouchableOpacity, Alert } from 'react-native';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNavigation } from '@react-navigation/native';
import { Icon } from '@/components/ui/icon';
import { CloseIcon } from '@/components/ui/icon';

interface LogoutButtonProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    showConfirmation?: boolean;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({ 
    size = 'md', 
    className = '',
    showConfirmation = true 
}) => {
    const { logout } = useCurrentUser();
    const navigation = useNavigation();

    const handleLogout = () => {
        if (showConfirmation) {
            Alert.alert(
                "Logout",
                "Are you sure you want to logout?",
                [
                    {
                        text: "Cancel",
                        style: "cancel"
                    },
                    {
                        text: "Logout",
                        style: "destructive",
                        onPress: () => {
                            logout();
                            navigation.navigate('Login' as never);
                        }
                    }
                ]
            );
        } else {
            logout();
            navigation.navigate('Login' as never);
        }
    };

    return (
        <TouchableOpacity
            onPress={handleLogout}
            className={`p-2 rounded-full bg-red-100 ${className}`}
            activeOpacity={0.7}
        >
            <Icon as={CloseIcon} size={size} className="text-red-600" />
        </TouchableOpacity>
    );
};
