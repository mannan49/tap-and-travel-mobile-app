import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MainStack from './MainStack';
import AuthStack from './AuthStack';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createStackNavigator();

export default function Routes() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // isAuthenticated = false;
  useEffect(() => {
    // Function to check token in AsyncStorage
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          setIsAuthenticated(true);  // Token exists, user is authenticated
        } else {
          setIsAuthenticated(false); // No token, user is not authenticated
        }
      } catch (error) {
        console.error("Error fetching token:", error);
        setIsAuthenticated(false);  // In case of error, treat user as unauthenticated
      }
    };

    checkToken();  // Check the token status when the component mounts
  }, []);  // Empty dependency array ensures it runs only once when component mounts

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {isAuthenticated ? MainStack(Stack) : AuthStack(Stack)}
      </Stack.Navigator>
    </NavigationContainer>
  );
}