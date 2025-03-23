import React, { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import ButtonWithLoader from "../../Components/ButtonWithLoader";
import TextInputWithLable from "../../Components/TextInputWithLabel";
import validator from "../../utils/validation";
import { showError } from "../../utils/helperFunction";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LOGIN } from "../../config/urls";
import { useDispatch } from "react-redux";
import { initializeStore } from "../../store/intializeStore";

export const loginUser = async (userData) => {
  console.log("Login request payload:", userData); // ✅ Log the request payload

  try {
    const response = await fetch(LOGIN, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    console.log("API Response:", data); // ✅ Log API response

    if (response.ok && data.token) {
      console.log("Login successful, saving token..."); // ✅ Log token save
      await AsyncStorage.setItem("token", data.token);
      return { success: true, data };
    } else {
      console.error("Login failed:", data.message);
      return { success: false, message: data.message || "Login failed" };
    }
  } catch (err) {
    console.error("Login error:", err.message);
    return { success: false, message: err.message || "Unexpected error" };
  }
};

const Login = ({ navigation }) => {
  const dispatch = useDispatch();
  const [state, setState] = useState({
    isLoading: false,
    email: "",
    password: "",
    isSecure: true,
  });

  const { isLoading, email, password, isSecure } = state;

  const updateState = (data) => setState((prev) => ({ ...prev, ...data }));

  const isValidData = () => {
    const error = validator({ email, password });
    if (error) {
      showError(error);
      return false;
    }
    return true;
  };

  const onLogin = async () => {
    console.log("Login button clicked"); // ✅ Log click event

    if (!isValidData()) {
      console.log("Validation failed"); // ✅ Log validation failure
      return;
    }

    updateState({ isLoading: true });
    console.log("Sending login request..."); // ✅ Log before API call

    const response = await loginUser({ email, password });

    if (response.success) {
      console.log("Login successful, navigating to Signup"); // ✅ Log successful login
      navigation.navigate("Signup");
    } else {
      console.error("Login failed:", response.message);
      Alert.alert("Login Failed", response.message || "Something went wrong");
    }

    updateState({ isLoading: false });
  };

  return (
    <View style={styles.container}>
      <TextInputWithLable
        label="Email"
        placheHolder="Enter your Email"
        onChangeText={(email) => updateState({ email })}
      />
      <TextInputWithLable
        label="Password"
        placheHolder="Enter your password"
        secureTextEntry={isSecure}
        onChangeText={(password) => updateState({ password })}
      />

      <ButtonWithLoader text="Login" onPress={onLogin} isLoading={isLoading} />
      <View style={{ marginVertical: 8 }} />
      <ButtonWithLoader text="Signup" onPress={() => navigation.navigate("Signup")} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "white",
  },
});

export default Login;
