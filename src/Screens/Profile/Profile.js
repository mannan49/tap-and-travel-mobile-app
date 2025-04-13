import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Modal,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "../../context/AuthContext";
import apiClient from "../../api/apiClient";
import Toast from "react-native-toast-message";
import AppInput from "../../Components/AppInput";
import AppButton from "../../Components/Button";

const Profile = () => {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);

  // Order form state
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [address, setAddress] = useState("");

  const { logout } = useContext(AuthContext);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      const decoded = jwtDecode(token);
      const userId = decoded?.sub;

      const { data } = await apiClient.get(`/user/${userId}`);
      if (data && data.user) {
        setName(data.user.name);
        setPhoneNumber(data.user.phoneNumber);
        setEmail(data.user.email);
      }
    } catch (error) {
      console.error(error);
      Toast.show({ type: "error", text1: "Something went wrong" });
    }
    setLoading(false);
  };

  const updateProfile = async () => {
    if (!name || !phoneNumber) {
      Toast.show({ type: "info", text1: "Name and Phone Number are required" });
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const { sub: userId } = jwtDecode(token);

      await apiClient.patch(`/user/update-profile`, {
        userId,
        name,
        phoneNumber,
      });

      Toast.show({ type: "success", text1: "Profile updated successfully" });
    } catch (error) {
      Toast.show({ type: "error", text1: "Something went wrong" });
    }
    setLoading(false);
  };

  const changePassword = async () => {
    if (!oldPassword || !newPassword) {
      Toast.show({ type: "info", text1: "Old and new passwords are required" });
      return;
    }

    setLoading(true);
    try {
      await apiClient.post(`/user/change-password`, {
        email,
        oldPassword,
        newPassword,
      });

      Toast.show({ type: "success", text1: "Password changed successfully" });
      setOldPassword("");
      setNewPassword("");
    } catch (error) {
      Toast.show({ type: "error", text1: "Failed to change password" });
    }
    setLoading(false);
  };

  const submitRFIDOrder = async () => {
    if (!province || !city || !postalCode || !address) {
      Toast.show({ type: "info", text1: "Please fill all the fields" });
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const { sub: userId } = jwtDecode(token);

      await apiClient.post("/rfid/request", {
        userId,
        province,
        city,
        postalCode,
        address,
      });

      Toast.show({ type: "success", text1: "RFID card requested successfully" });
      setShowOrderForm(false);

      // Clear form
      setProvince("");
      setCity("");
      setPostalCode("");
      setAddress("");
    } catch (error) {
      console.error(error);
      Toast.show({ type: "error", text1: "Failed to request RFID card" });
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1ABC9C" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.header}>Profile Settings</Text>

        <Text style={styles.label}>Name</Text>
        <AppInput style={styles.input} value={name} onChangeText={setName} placeholder="Enter your name" />

        <Text style={styles.label}>Email</Text>
        <AppInput style={[styles.input, { backgroundColor: "#ECF0F1" }]} value={email} editable={false} />

        <Text style={styles.label}>Phone Number</Text>
        <AppInput
          style={styles.input}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="Enter your phone number"
          keyboardType="phone-pad"
        />

        <View style={{ marginVertical: 8 }} />
        <AppButton text="Update Profile" onPress={updateProfile} variant="secondary" />

        <View style={styles.divider} />

        <Text style={styles.label}>Old Password</Text>
        <AppInput
          style={styles.input}
          value={oldPassword}
          onChangeText={setOldPassword}
          placeholder="Enter your old password"
          secureTextEntry
        />

        <Text style={styles.label}>New Password</Text>
        <AppInput
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="Enter new password"
          secureTextEntry
        />

        <View style={{ marginVertical: 8 }} />
        <AppButton text="Change Password" onPress={changePassword} variant="secondary" />

        <View style={styles.divider} />

        <AppButton text="Order RFID Card" variant="secondary" onPress={() => setShowOrderForm(true)} />

        <View style={styles.divider} />

        <AppButton text="Logout" onPress={logout} />

        {/* RFID Order Modal */}
        <Modal visible={showOrderForm} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalHeader}>Enter Your Address</Text>

              <Text style={styles.label}>Province</Text>
              <AppInput value={province} onChangeText={setProvince} placeholder="Enter province" />

              <Text style={styles.label}>City</Text>
              <AppInput value={city} onChangeText={setCity} placeholder="Enter city" />

              <Text style={styles.label}>Postal Code</Text>
              <AppInput value={postalCode} onChangeText={setPostalCode} placeholder="Postal Code" keyboardType="numeric" />

              <Text style={styles.label}>Address</Text>
              <AppInput value={address} onChangeText={setAddress} placeholder="Complete address" />

              <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 15 }}>
                <TouchableOpacity onPress={() => setShowOrderForm(false)}>
                  <Text style={{ color: "#7f8c8d" }}>Cancel</Text>
                </TouchableOpacity>
                <AppButton onPress={submitRFIDOrder} text="Submit"/>
                {/* <TouchableOpacity onPress={submitRFIDOrder}>
                  <Text style={{ color: "#1ABC9C", fontWeight: "bold" }}>Submit</Text>
                </TouchableOpacity> */}
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#ecf0f1",
    justifyContent: "center",
  },
  container: {
    padding: 35,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2C3E50",
    textAlign: "center",
  },
  label: {
    fontSize: 15,
    color: "#34495E",
    marginBottom: 6,
    marginTop: 6,
  },
  input: {
    backgroundColor: "#F4F6F8",
    padding: 10,
    borderRadius: 8,
    fontSize: 15,
    color: "#2C3E50",
  },
  divider: {
    marginVertical: 20,
    height: 1,
    backgroundColor: "#BDC3C7",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.2)", // Light dimming effect
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF", // Light background
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50", // Dark text for contrast
    marginBottom: 15,
    textAlign: "center",
  },

});
