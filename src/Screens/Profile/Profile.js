import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "../../context/AuthContext";
import apiClient from "../../api/apiClient";
import Toast from "react-native-toast-message";

const Profile = () => {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const { logout } = useContext(AuthContext);

  useEffect(() => {
    fetchProfile();
  }, []);

  // 🔸 Get profile data
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
        setName(data?.user?.name);
        setPhoneNumber(data?.user?.phoneNumber);
        setEmail(data?.user?.email);
      }
    } catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "Something went wrong",
      });
    }
    setLoading(false);
  };

  // 🔸 Update profile (name + phone)
  const updateProfile = async () => {
    if (!name || !phoneNumber) {
      Toast.show({
        type: "info",
        text1: "Name and Phone Number are required",
      });
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

      Toast.show({
        type: "success",
        text1: "Profile updated successfully",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Something went wrong",
      });
    }

    setLoading(false);
  };

  // 🔸 Change password (requires email, oldPassword, newPassword)
  const changePassword = async () => {
    if (!oldPassword || !newPassword) {
      Toast.show({
        type: "info",
        text1: "Old and new passwords are required",
      });
      return;
    }

    setLoading(true);

    try {
      await apiClient.post(`/user/change-password`, {
        email,
        oldPassword,
        newPassword,
      });

      Toast.show({
        type: "success",
        text1: "Password changed successfully",
      });

      setOldPassword("");
      setNewPassword("");
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Failed to change password",
      });
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

        {/* Name Input */}
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={(text) => setName(text)}
          placeholder="Enter your name"
        />

        {/* Email Input (disabled) */}
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, { backgroundColor: "#ECF0F1" }]}
          value={email}
          editable={false}
        />

        {/* Phone Input */}
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={phoneNumber}
          onChangeText={(text) => setPhoneNumber(text)}
          placeholder="Enter your phone number"
          keyboardType="phone-pad"
        />

        {/* Update Profile Button */}
        <TouchableOpacity style={styles.saveButton} onPress={updateProfile}>
          <Text style={styles.saveButtonText}>Update Profile</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Change Password Section */}
        <Text style={styles.label}>Old Password</Text>
        <TextInput
          style={styles.input}
          value={oldPassword}
          onChangeText={(text) => setOldPassword(text)}
          placeholder="Enter your old password"
          secureTextEntry
        />

        <Text style={styles.label}>New Password</Text>
        <TextInput
          style={styles.input}
          value={newPassword}
          onChangeText={(text) => setNewPassword(text)}
          placeholder="Enter new password"
          secureTextEntry
        />

        <TouchableOpacity style={styles.saveButton} onPress={changePassword}>
          <Text style={styles.saveButtonText}>Change Password</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
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
    padding: 20,
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 40,
    borderRadius: 12,
    shadowColor: "#000000",
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
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 15,
    color: "#34495E",
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#F4F6F8",
    padding: 10,
    borderRadius: 8,
    fontSize: 15,
    color: "#2C3E50",
  },
  saveButton: {
    marginTop: 16,
    backgroundColor: "#1ABC9C",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 15,
  },
  logoutButton: {
    marginTop: 16,
    backgroundColor: "#E74C3C",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 15,
  },
  divider: {
    marginVertical: 20,
    height: 1,
    backgroundColor: "#BDC3C7",
  },
});
