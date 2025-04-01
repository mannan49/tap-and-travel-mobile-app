import React, { useContext, useState } from "react";
import { View, StyleSheet } from "react-native";
import validator from "../../utils/validation";
import { showError } from "../../utils/helperFunction";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LOGIN } from "../../config/urls";
import { AuthContext } from "../../context/AuthContext";
import Toast from "react-native-toast-message";
import AppButton from "../../Components/Button";
import AppInput from "../../Components/AppInput";

export const loginUser = async (userData) => {
  try {
    const response = await fetch(LOGIN, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (response.ok && data.token) {
      await AsyncStorage.setItem("token", data.token);
      return { success: true, data };
    } else {
      return { success: false, message: data.message || "Login failed" };
    }
  } catch (err) {
    return { success: false, message: err.message || "Unexpected error" };
  }
};

const Login = ({ navigation }) => {
  const { login } = useContext(AuthContext);
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
    if (!isValidData()) {
      return;
    }

    updateState({ isLoading: true });

    const response = await loginUser({ email, password });

    if (response.success) {
      await login(response.data.token);
    } else {
      Toast.show({
        type: "error",
        text1: "Invalid email or password!",
      });
    }

    updateState({ isLoading: false });
  };

  return (
    <View style={styles.container}>
      <AppInput
        placeholder="Enter your email"
        value={email}
        onChangeText={(email) => updateState({ email })}
      />
      <AppInput
        placeholder="Enter your password"
        value={password}
        secureTextEntry={isSecure}
        onChangeText={(password) => updateState({ password })}
      />

      <View style={{ marginVertical: 8 }} />
      <AppButton
        text="Login"
        onPress={onLogin}
        variant="secondary"
        isLoading={isLoading}
      />
      <View style={{ marginVertical: 8 }} />
      <AppButton
        text="Sign Up"
        onPress={() => navigation.navigate("Signup")}
        variant="secondary"
        isLoading={isLoading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "white",
    justifyContent: "center", // Align vertically (Y-axis)]
  },
});

export default Login;
