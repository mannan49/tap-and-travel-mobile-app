import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import AppButton from "../../Components/Button";
import Toast from "react-native-toast-message";
import apiClient from "../../api/apiClient";

const passwordRules = [
  { label: "Minimum 8 characters", test: (val) => val.length >= 8 },
  { label: "At least one capital letter", test: (val) => /[A-Z]/.test(val) },
  { label: "At least one number", test: (val) => /\d/.test(val) },
  {
    label: "At least one special character",
    test: (val) => /[!@#$%^&*(),.?\":{}|<>]/.test(val),
  },
];

const ResetPassword = ({ navigation, route }) => {
  const { email, secret_key } = route?.params || {};
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!email || !secret_key) {
      navigation.replace("ForgotEmail");
    }
  }, [email, secret_key]);

  const isPasswordValid = passwordRules.every((rule) => rule.test(password));
  const passwordsMatch = password === confirmPassword;
  const canSubmit = isPasswordValid && passwordsMatch;

  const handleResetPassword = async () => {
    if (!canSubmit) return;
    setIsLoading(true);
    try {
      const response = await apiClient.post("/user/forgot-password/reset", {
        email,
        secret_key,
        newPassword: password,
      });

      Toast.show({
        type: "success",
        text1: response?.message || "Password reset successfully!",
      });
      navigation.replace("Login");
    } catch (error) {
      Toast.show({
        type: "error",
        text1: error?.response?.data?.message || "Failed to reset password.",
      });
    }
    setIsLoading(false);
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
          <Animatable.View animation="fadeInDown" duration={800}>
            <MaterialIcons name="location-on" size={64} color="white" />
            <Text style={styles.appName}>Tap And Travel</Text>
          </Animatable.View>
        </LinearGradient>

        <Animatable.View
          animation="fadeInUp"
          duration={800}
          delay={200}
          style={styles.bottomSection}
        >
          <Text style={styles.title}>Reset Your Password</Text>

          <Text style={styles.label}>Password</Text>
          <TextInput
            placeholder="New Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />

          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            placeholder="Confirm Password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={styles.input}
          />

          <View style={styles.rulesContainer}>
            {passwordRules.map((rule, index) => {
              const passed = rule.test(password);
              return (
                <Text
                  key={index}
                  style={[styles.ruleText, { color: passed ? "green" : "red" }]}
                >
                  • {rule.label}
                </Text>
              );
            })}
            {confirmPassword.length > 0 && (
              <Text
                style={{
                  color: passwordsMatch ? "green" : "red",
                  marginTop: 5,
                }}
              >
                • Passwords {passwordsMatch ? "match" : "do not match"}
              </Text>
            )}
          </View>

          <AppButton
            text="Reset Password"
            onPress={handleResetPassword}
            variant="primary"
            isLoading={isLoading}
            disabled={!canSubmit}
          />

          <View style={styles.loginLinkContainer}>
            <Text style={styles.loginText}>Remember your password? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </Animatable.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ResetPassword;

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
    marginTop: 10,
    textAlign: "center",
  },
  bottomSection: {
    flex: 2,
    backgroundColor: "white",
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
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#292966",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 15,
    color: "#34495E",
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    backgroundColor: "#f7f7f7",
    fontSize: 16,
  },
  rulesContainer: {
    marginBottom: 20,
  },
  ruleText: {
    fontSize: 14,
    marginBottom: 4,
  },
  loginLinkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  loginText: {
    color: "#999",
    fontSize: 14,
  },
  loginLink: {
    color: "#ff4d4d",
    fontWeight: "bold",
    fontSize: 14,
  },
});
