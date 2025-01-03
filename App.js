import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Routes from './src/Navigations/Route';
import FlashMessage from "react-native-flash-message";

export default function App() {
  return (
    <View style={{flex:1}}>
    <Routes/>
    <FlashMessage position="top"/>
    </View>
  );
}