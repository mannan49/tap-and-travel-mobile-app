import React, { useState, useEffect, useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MainStack from './MainStack';
import AuthStack from './AuthStack';
import { AuthContext } from '../context/AuthContext';

const Stack = createStackNavigator();

export default function Routes() {
  const { isAuthenticated } = useContext(AuthContext); // <-- get auth state
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {isAuthenticated ? MainStack(Stack) : AuthStack(Stack)}
      </Stack.Navigator>
    </NavigationContainer>
  );
}