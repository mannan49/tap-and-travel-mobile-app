import React, { useContext, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import * as Animatable from "react-native-animatable";
import { LinearGradient } from "expo-linear-gradient";

import validator from "../../utils/validation";
import { showError } from "../../utils/helperFunction";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LOGIN } from "../../config/urls";
import { AuthContext } from "../../context/AuthContext";
import Toast from "react-native-toast-message";
import AppButton from "../../Components/Button";
import AppInput from "../../Components/AppInput";
import { registerExpoPushToken } from "../../utils/notificationHelper";

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
      await registerExpoPushToken(data?.userId);
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
    if (!isValidData()) return;

    updateState({ isLoading: true });

    const response = await loginUser({ email, password });

    if (response.success) {
      await login(response?.data?.token);
    } else {
      Toast.show({
        type: "error",
        text1: "Invalid email or password!",
      });
    }

    updateState({ isLoading: false });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <LinearGradient
          colors={["#4c669f", "#3b5998", "#192f6a"]}
          style={styles.topSection}
        >
          <Animatable.View animation="fadeInDown" duration={800} delay={200}>
            <MaterialIcons
              name="location-on"
              size={64}
              color="white"
              style={{ marginBottom: 10 }}
            />
            <Text style={styles.appName}>Tap And Travel</Text>
          </Animatable.View>
        </LinearGradient>

        <Animatable.View
          animation="fadeInUp"
          duration={800}
          delay={300}
          style={styles.bottomSection}
        >
          <Text style={styles.welcomeText}>Welcome 👋</Text>
          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
              <Text style={styles.registerNow}>Register now</Text>
            </TouchableOpacity>
          </View>

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

          <TouchableOpacity onPress={() => navigation.navigate("ForgotEmail")}>
            <Text style={[styles.registerNow, { textAlign: "right", marginTop: 8 }]}>
              Forgot Password?
            </Text>
          </TouchableOpacity>

          <View style={{ marginVertical: 16 }} />
          <AppButton
            text="Login"
            onPress={onLogin}
            variant="primary"
            isLoading={isLoading}
          />
        </Animatable.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#292966",
  },
  topSection: {
    flex: 1.2,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  appName: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },
  bottomSection: {
    flex: 2,
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 36,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 10,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#292966",
    marginBottom: 12,
  },
  registerRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  registerText: {
    color: "#777",
    fontSize: 14,
  },
  registerNow: {
    color: "#ff4d4d",
    fontWeight: "bold",
    fontSize: 14,
  },
});

export default Login;
