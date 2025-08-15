import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  _id: string;
  userName: string;
  email: string;
  fullName?: string;
  companyName?: string;
  mobileNumber: string;
  profilePic?: string;
  adminPic?: string;
}

interface AuthContextType {
  user: User | null;
  userType: 'user' | 'admin' | null;
  login: (userData: User, type: 'user' | 'admin', token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<'user' | 'admin' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if token is expired and clear it
  const checkTokenExpiration = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Decode the JWT token to check expiration
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;
        
        if (payload.exp && payload.exp < currentTime) {
          console.log('Token expired, clearing authentication');
          localStorage.removeItem('token');
          localStorage.removeItem('userType');
          setUser(null);
          setUserType(null);
          return false;
        }
        return true;
      } catch (error) {
        console.log('Invalid token format, clearing authentication');
        localStorage.removeItem('token');
        localStorage.removeItem('userType');
        setUser(null);
        setUserType(null);
        return false;
      }
    }
    return false;
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUserType = localStorage.getItem('userType');
    
    if (token && storedUserType) {
      // Check if token is still valid
      if (checkTokenExpiration()) {
        setUserType(storedUserType as 'user' | 'admin');
        // Verify token with backend
        verifyTokenWithBackend(token, storedUserType as 'user' | 'admin');
      } else {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyTokenWithBackend = async (token: string, type: 'user' | 'admin') => {
    try {
      const endpoint = type === 'admin' ? '/admins/getcurrent-admin' : '/users/getcurrent-user';
      const response = await fetch(`http://localhost:8000/api/v1${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.data);
      } else {
        // Token is invalid, clear authentication
        console.log('Token verification failed, clearing authentication');
        localStorage.removeItem('token');
        localStorage.removeItem('userType');
        setUser(null);
        setUserType(null);
      }
    } catch (error) {
      console.error('Error verifying token:', error);
      // On error, clear authentication to be safe
      localStorage.removeItem('token');
      localStorage.removeItem('userType');
      setUser(null);
      setUserType(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = (userData: User, type: 'user' | 'admin', token: string) => {
    setUser(userData);
    setUserType(type);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('userType', type);
    localStorage.setItem('token', token);
  };

  const logout = () => {
    setUser(null);
    setUserType(null);
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, userType, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};