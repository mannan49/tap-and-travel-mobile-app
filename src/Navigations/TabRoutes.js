import React from "react";
import {
  BottomTabBar,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import { MaterialIcons } from "react-native-vector-icons";
import { Home, Profile , Ticket, Map} from "../";

const BottomTab = createBottomTabNavigator();

const TabRoutes = () => {
  return (
    <BottomTab.Navigator
      tabBar={(tabsProps) => (
        <>
          <BottomTabBar {...tabsProps} />
        </>
      )}
      initialRouteName="Home"
      screenOptions={{
        tabBarActiveTintColor: "tomato", // Active tab color
        tabBarInactiveTintColor: "gray", // Inactive tab color
        tabBarStyle: { backgroundColor: "white" }, // Tab bar background color
      }}
    >
      <BottomTab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} /> // Home icon
          ),
        }}
      />
        <BottomTab.Screen
        name="Ticket"
        component={Ticket}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="confirmation-number" size={size} color={color} /> // Ticket icon
          ),
        }}
      />
      <BottomTab.Screen
        name="Map"
        component={Map}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="map" size={size} color={color} /> // Map icon
          ),
        }}
      />
      <BottomTab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={size} color={color} /> // Profile icon
          ),
        }}
      />
    </BottomTab.Navigator>
  );
};

export default TabRoutes;
