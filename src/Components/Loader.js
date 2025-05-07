import React from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";

const Loader = ({ size = "large", color = "#292966", style }) => {
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default Loader;
