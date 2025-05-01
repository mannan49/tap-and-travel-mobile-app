import React, { useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import AppInput from "../../Components/AppInput";
import Toast from "react-native-toast-message";
import apiClient from "../../api/apiClient";
import AppButton from "../../Components/Button";
import { isValidEmail } from "../../utils/isValidEmail";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const ForgotEmail = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const handleSendOtp = async () => {
    if (!isValidEmail(email)) {
      Toast.show({ type: "error", text1: "Please enter a valid email" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.post("user/forgot-password/send-otp", {
        email,
      });

      if (response?.status === 200) {
        Toast.show({ type: "success", text1: response?.data?.message });
        navigation.navigate("ForgotOtp", { email });
      } else {
        Toast.show({
          type: "error",
          text1: response?.data?.message || "Failed to send OTP",
        });
      }
    } catch (error) {
      Toast.show({ type: "error", text1: error?.message || "Server error" });
    }
    setIsLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <MaterialIcons
          name="location-on"
          size={60}
          color="white"
          style={{ marginBottom: 10 }}
        />
        <Text style={styles.appName}>Tap And Travel</Text>
      </View>

      <View style={styles.bottomSection}>
        <Text style={styles.welcomeText}>Forgot Password</Text>
        <Text style={{ color: "#999", marginBottom: 20 }}>
          Enter your registered email to receive an OTP.
        </Text>

        <AppInput
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
        />

        <View style={styles.loginRedirectRow}>
          <Text style={{ color: "#999" }}>Remember your password? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>
        </View>

        <View style={{ marginVertical: 12 }} />
        <AppButton
          text="Send OTP"
          onPress={handleSendOtp}
          disabled={!isValidEmail(email)}
          variant="primary"
          isLoading={isLoading}
        />
      </View>
    </View>
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
  },
  appName: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  bottomSection: {
    flex: 2,
    backgroundColor: "white",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 30,
  },
  loginRedirectRow: {
    flexDirection: "row",
    gap: 0,
    marginTop: 10,
  },
  loginText: {
    color: "red",
    fontWeight: "bold",
  },

  welcomeText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#292966",
    marginBottom: 8,
  },
});

export default ForgotEmail;
