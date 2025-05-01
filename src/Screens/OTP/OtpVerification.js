import React, { useState, useEffect, useContext, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import AppButton from "../../Components/Button";
import { useNavigation } from "@react-navigation/native";
import apiClient from "../../api/apiClient";
import Toast from "react-native-toast-message";
import { AuthContext } from "../../context/AuthContext";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const OtpVerification = ({ route }) => {
  const { login } = useContext(AuthContext);
  const navigation = useNavigation();
  const { email } = route.params;

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);

  const inputRefs = useRef([]);

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const handleChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;
    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const updatedOtp = [...otp];
      updatedOtp[index - 1] = "";
      setOtp(updatedOtp);
    }
  };

  const onVerifyOtp = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      Toast.show({
        type: "error",
        text1: "Enter 6 digit Otp!",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.post("/user/verify-otp", {
        email,
        otp: code,
      });

      if (response.data) {
        Toast.show({
          type: "success",
          text1: response?.data?.message,
        });
        await login(response?.data?.token);
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Otp Verification Failed",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onResendOtp = async () => {
    if (resendTimer > 0) return;

    try {
      await apiClient.post("/user/resend-otp", { email });
      Toast.show({
        type: "success",
        text1: "Otp Resent!",
      });
      setResendTimer(30);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Failed to resend Otp!",
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo Section */}
      <View style={styles.logoContainer}>
        <MaterialIcons name="location-on" size={60} color="white" />
        <Text style={styles.appName}>Tap And Travel</Text>
      </View>

      <View style={styles.bottomSection}>
        <Text style={styles.title}>OTP Verification</Text>
        <Text style={styles.subtitle}>Enter the OTP sent to {email}</Text>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={styles.otpBox}
              keyboardType="numeric"
              maxLength={1}
              value={digit}
              onChangeText={(value) => handleChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
            />
          ))}
        </View>

        <AppButton
          text="Verify OTP"
          onPress={onVerifyOtp}
          isLoading={isLoading}
          variant="primary"
        />

        <TouchableOpacity onPress={onResendOtp} disabled={resendTimer > 0}>
          <Text
            style={[styles.resendText, resendTimer > 0 && styles.disabledText]}
          >
            {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
          </Text>
        </TouchableOpacity>

        <View style={styles.loginRow}>
          <Text style={styles.registerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.registerNow}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default OtpVerification;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#292966",
  },
  logoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  appName: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 8,
  },
  bottomSection: {
    flex: 2,
    backgroundColor: "white",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#292966",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "gray",
    marginBottom: 24,
    textAlign: "center",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  otpBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    width: 45,
    height: 50,
    textAlign: "center",
    fontSize: 18,
  },
  resendText: {
    textAlign: "center",
    fontSize: 16,
    color: "blue",
    marginTop: 15,
  },
  disabledText: {
    color: "gray",
  },
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  registerText: {
    color: "#999",
  },
  registerNow: {
    color: "red",
    fontWeight: "bold",
  },
});
