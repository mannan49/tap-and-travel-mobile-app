import React, { useState } from "react";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";
import ButtonWithLoader from "../../Components/ButtonWithLoader";
import TextInputWithLable from "../../Components/TextInputWithLabel";

import validator from "../../utils/validation";
import { showError } from "../../utils/helperFunction";
import AppInput from "../../Components/AppInput";
import AppButton from "../../Components/Button";

const Signup = ({ navigation }) => {
  const [state, setState] = useState({
    isLoading: false,
    userName: "",
    email: "",
    password: "",
    isSecure: true,
  });
  const { isLoading, userName, email, password, isSecure } = state;
  const updateState = (data) => setState(() => ({ ...state, ...data }));

  const isValidData = () => {
    const error = validator({
      userName,
      email,
      password,
    });
    if (error) {
      showError(error);
      return false;
    }
    return true;
  };

  const onSignUp = async () => {
    const checkValid = isValidData();
    if (checkValid) {
      navigation.navigate("Signup");
    }
  };
  return (
    <View style={styles.container}>
      <AppInput
        label="User name"
        placeholder="Enter your Username"
        onChangeText={(userName) => updateState({ userName })}
      />
      <AppInput
        placeholder="Enter your Email"
        onChangeText={(email) => updateState({ email })}
      />
      <AppInput
        placeholder="Enter your Password"
        secureTextEntry={isSecure}
        onChangeText={(password) => updateState({ password })}
      />

      <View style={{ marginVertical: 8 }} />
      <AppButton
        text="SignUp"
        onPress={onSignUp}
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
    justifyContent: "center",
  },
});

export default Signup;
