import React, { useState } from "react";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";
import ButtonWithLoader from "../../Components/ButtonWithLoader";
import TextInputWithLable from "../../Components/TextInputWithLabel";

import validator from "../../utils/validation";
import { showError } from "../../utils/helperFunction";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const loginUser = async (userData) => {
  try {
    const response = await fetch(
      "https://tap-and-travel-backend.vercel.app/api/v1/user/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      }
    );

    const data = await response.json();
    console.log("Parsed JSON data:", data);

    if (response.ok && data.token) {
      // Store the token in AsyncStorage
      await AsyncStorage.setItem("token", data.token);
      return { success: true, data };
    } else {
      console.error("Login failed", data.message);
      return { success: false, message: data.message };
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
    console.error("Error while logging in:", errorMessage);
    return { success: false, message: errorMessage };
  }
};


const Login = ({ navigation }) => {
  const [state, setState] = useState({
    isLoading: false,
    email: "",
    password: "",
    isSecure: true,
  });
  const { isLoading, email, password, isSecure } = state;
  const updateState = (data) => setState(() => ({ ...state, ...data }));

  const isValidData = () => {
    const error = validator({
      email,
      password,
    });
    if (error) {
      showError(error);
      return false;
    }
    return true;
  };

  const onLogin = async () => {
    const checkValid = isValidData();
    if (!checkValid) return; // If the validation fails, stop the process.
     // Set loading to true
     updateState({ isLoading: true });

     const response = await loginUser({ email, password }); // Call the API function
 
     if (response.success) {
      navigation.navigate("Signup")
     } else {
       // If login failed, show an error message
       Alert.alert("Login Failed", response.message || "Something went wrong");
     }
 
     // Set loading to false after the login attempt
     updateState({ isLoading: false });
  };
  return (
    <View style={styles.container}>
      <TextInputWithLable
        label="Email"
        placheHolder="enter your email"
        onChangeText={(email) => updateState({ email })}
      />
      <TextInputWithLable
        label="Password"
        placheHolder="enter your password"
        // isSecure={isSecure}
        secureTextEntry={isSecure}
        onChangeText={(password) => updateState({ password })}
      />

      <ButtonWithLoader text="Login" onPress={onLogin} isLoading={isLoading} />

      <View style={{ marginVertical: 8 }} />

      <ButtonWithLoader
        text="Signup"
        onPress={() => navigation.navigate("Signup")}
      />
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
