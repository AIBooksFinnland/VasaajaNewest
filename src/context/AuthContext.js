import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check for existing user on app start
    const loadUser = async () => {
      try {
        const userJson = await AsyncStorage.getItem('user');
        if (userJson) {
          setUser(JSON.parse(userJson));
        }
      } catch (e) {
        setError('Käyttäjätietojen lataaminen epäonnistui.');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Register new user locally
  const register = async (username, password) => {
    try {
      setLoading(true);
      setError(null);

      // Check if username already exists in local storage
      const usersJson = await AsyncStorage.getItem('users');
      const users = usersJson ? JSON.parse(usersJson) : [];

      if (users.some(u => u.username === username)) {
        throw new Error('Käyttäjänimi on jo käytössä.');
      }

      // Create new user object
      const newUser = {
        id: uuid.v4(),
        username,
        password, // In a real app, this should be hashed!
        createdAt: new Date().toISOString(),
      };

      // Update users list
      users.push(newUser);
      await AsyncStorage.setItem('users', JSON.stringify(users));

      // Set as current user
      setUser(newUser);
      await AsyncStorage.setItem('user', JSON.stringify(newUser));

      return newUser;
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // Login with local credentials
  const login = async (username, password) => {
    try {
      setLoading(true);
      setError(null);

      // Get users from storage
      const usersJson = await AsyncStorage.getItem('users');
      if (!usersJson) {
        throw new Error('Käyttäjää ei löytynyt.');
      }

      const users = JSON.parse(usersJson);

      // Find user with matching credentials
      const foundUser = users.find(
        u => u.username === username && u.password === password,
      );

      if (!foundUser) {
        throw new Error('Virheellinen käyttäjänimi tai salasana.');
      }

      // Set as current user
      setUser(foundUser);
      await AsyncStorage.setItem('user', JSON.stringify(foundUser));

      return foundUser;
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // Logout current user
  const logout = async () => {
    try {
      setLoading(true);
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (e) {
      setError('Uloskirjautuminen epäonnistui.');
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (updatedUser) => {
    try {
      setLoading(true);

      // Get all users
      const usersJson = await AsyncStorage.getItem('users');
      const users = JSON.parse(usersJson);

      // Update the user in the users array
      const updatedUsers = users.map(u =>
        u.id === updatedUser.id ? updatedUser : u,
      );

      // Save back to storage
      await AsyncStorage.setItem('users', JSON.stringify(updatedUsers));
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

      // Update state
      setUser(updatedUser);
    } catch (e) {
      setError('Profiilin päivitys epäonnistui.');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        register,
        login,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
