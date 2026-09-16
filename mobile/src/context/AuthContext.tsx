import React, { createContext, useContext, useState } from 'react';
import { User } from '../types';
import { currentUser as mockStudentUser } from '../constants/mockData';
import { useToast } from './ToastContext';

interface AuthContextData {
  isLoggedIn: boolean;
  user: User | null;
  loginAsStudent: (identifier?: string) => void;
  logout: () => void;
  toggleMode: () => void;
}

const AuthContext = createContext<AuthContextData | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Defaults to false: first-time users land in Visitor / Prospectus Discovery Mode
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();

  const loginAsStudent = (identifier?: string) => {
    setIsLoggedIn(true);
    setUser(mockStudentUser);
    toast.success(
      `Welcome, ${mockStudentUser.name.split(' ')[0]}!`,
      `Signed in to Student LMS Portal (${mockStudentUser.registrationId})`
    );
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    toast.info('Logged out', 'Returned to Raven Tutorials Visitor Prospectus');
  };

  const toggleMode = () => {
    if (isLoggedIn) {
      logout();
    } else {
      loginAsStudent();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user: isLoggedIn ? user : null,
        loginAsStudent,
        logout,
        toggleMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextData => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
