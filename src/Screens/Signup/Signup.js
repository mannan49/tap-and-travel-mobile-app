import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import AppInput from "../../Components/AppInput";
import AppButton from "../../Components/Button";
import { showError, showSuccess } from "../../utils/helperFunction";
import apiClient from "../../api/apiClient";

const Signup = ({ navigation }) => {
  const [state, setState] = useState({
    isLoading: false,
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    isSecure: true,
    isSecureConfirm: true,
  });

  const updateState = (data) => setState((prev) => ({ ...prev, ...data }));

  const togglePasswordVisibility = () => {
    updateState({ isSecure: !state.isSecure });
  };

  const toggleConfirmPasswordVisibility = () => {
    updateState({ isSecureConfirm: !state.isSecureConfirm });
  };

  const isValidData = () => {
    if (!state.name || !state.email || !state.password || !state.phoneNumber) {
      showError("All fields are required");
      return false;
    }
    if (state.password !== state.confirmPassword) {
      showError("Passwords do not match!");
      return false;
    }
    return true;
  };

  const onSignUp = async () => {
    if (!isValidData()) return;

    updateState({ isLoading: true });

    try {
      const response = await apiClient.post("/user/register", {
        name: state.name,
        email: state.email,
        password: state.password,
        phoneNumber: state.phoneNumber,
      });

      if (response.data) {
        showSuccess(response.data.message);
        navigation.navigate("OtpVerification", { email: state.email });
      }
    } catch (error) {
      showError(error.response?.data?.message || "Signup failed");
    } finally {
      updateState({ isLoading: false });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

      <AppInput
        label="Full Name"
        placeholder="Enter your name"
        onChangeText={(name) => updateState({ name })}
      />
      <AppInput
        label="Email"
        placeholder="Enter your email"
        keyboardType="email-address"
        onChangeText={(email) => updateState({ email })}
      />
      <AppInput
        label="Phone Number"
        placeholder="Enter your phone number"
        keyboardType="phone-pad"
        onChangeText={(phoneNumber) => updateState({ phoneNumber })}
      />
      <AppInput
        label="Password"
        placeholder="Enter your password"
        secureTextEntry={state.isSecure}
        onChangeText={(password) => updateState({ password })}
        rightIcon={state.isSecure ? "eye-off" : "eye"}
        onRightIconPress={togglePasswordVisibility}
      />
      <AppInput
        label="Confirm Password"
        placeholder="Re-enter your password"
        secureTextEntry={state.isSecureConfirm}
        onChangeText={(confirmPassword) => updateState({ confirmPassword })}
        rightIcon={state.isSecureConfirm ? "eye-off" : "eye"}
        onRightIconPress={toggleConfirmPasswordVisibility}
      />

      <AppButton
        text="Sign Up"
        onPress={onSignUp}
        isLoading={state.isLoading}
      />

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.loginText}>
          Already have an account? <Text style={styles.boldText}>Login</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "white",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  loginText: {
    textAlign: "center",
    marginTop: 15,
    fontSize: 16,
  },
  boldText: {
    fontWeight: "bold",
    color: "blue",
  },
});

export default Signup;
