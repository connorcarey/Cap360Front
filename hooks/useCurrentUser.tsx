import { createContext, useContext, useState, ReactNode } from 'react';

export interface CurrentUser {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    family_id: string;
    [key: string]: any;
}

interface CurrentUserContextType {
    currentUser: CurrentUser | null;
    setCurrentUser: (user: CurrentUser | null) => void;
    logout: () => void;
    isLoggedIn: boolean;
}

const CurrentUserContext = createContext<CurrentUserContextType | undefined>(undefined);

export const CurrentUserProvider = ({ children }: { children: ReactNode }) => {
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

    const logout = () => {
        setCurrentUser(null);
    };

    const value = {
        currentUser,
        setCurrentUser,
        logout,
        isLoggedIn: currentUser !== null,
    };

    return (
        <CurrentUserContext.Provider value={value}>
            {children}
        </CurrentUserContext.Provider>
    );
};

export const useCurrentUser = () => {
    const context = useContext(CurrentUserContext);
    if (context === undefined) {
        throw new Error('useCurrentUser must be used within a CurrentUserProvider');
    }
    return context;
};
