import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AuthContext } from '../../context/AuthContext';

// Profile component
const Profile = () => {

  // Function to clear token and redirect to Auth Stack
  const { logout } = useContext(AuthContext); // <-- get login from context

  return (
    <View style={styles.container}>
      {/* Full-width button at the top */}
      <TouchableOpacity style={styles.button} onPress={logout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>

      {/* Profile content */}
      <Text style={styles.text}>Profile Screen</Text>
    </View>
  );
};

// Define styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2c3e50', // Set background color for the Profile screen
    paddingTop: 50, // Padding from the top for the button
  },
  button: {
    width: '100%', // Full width button
    paddingVertical: 15, // Height of the button
    backgroundColor: '#e74c3c', // Button color
    alignItems: 'center', // Center the text inside the button
    justifyContent: 'center',
    borderRadius: 5, // Rounded corners
  },
  buttonText: {
    color: 'white', // Text color
    fontSize: 16,
    fontWeight: 'bold',
  },
  text: {
    color: 'white',
    fontSize: 24,
    textAlign: 'center',
    marginTop: 20, // Space below the button
  },
});

export default Profile;
