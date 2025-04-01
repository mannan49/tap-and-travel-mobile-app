import React, { useEffect, useState } from "react";
import { View, Text, Button } from "react-native";
import {
  useStripe,
  initPaymentSheet,
  presentPaymentSheet,
} from "@stripe/stripe-react-native";
import axios from "axios";
import Toast from "react-native-toast-message";
import { apiBaseUrl, PAYMENT_INTENT } from "../config/urls";
import { useNavigation } from "@react-navigation/native";
import apiClient from "../api/apiClient";
import AppButton from "./Button";



const Payment = ({ amount, adminId, userId, busId, selectedSeats }) => {
  const navigation = useNavigation();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initializePaymentSheet();
  }, []);

  const initializePaymentSheet = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.post(`/payment/create-payment-intent`, {
        amount,
        busId,
        userId,
        adminId,
      });

      const { clientSecret, ephemeralKey, customer } = data;


      const { error } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        merchantDisplayName: "Tap & Travel",
      });

      if (!error) {
        setLoading(false);
      }
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Unable to initialize payment.",
      });
    }
    setLoading(false);
  };

  const openPaymentSheet = async () => {
    if (loading) return;
    const { error } = await presentPaymentSheet();
    if (error) {
      Toast.show({
        type: "error",
        text1: "Payment Failed!",
        text2: error.message,
      });
    } else {
      Toast.show({
        type: "success",
        text1: "Payment Successful!",
        text2: "Your transaction has been completed.",
      });
      await handleTicketGeneration();
    }
  };

  const handleTicketGeneration = async () => {
    if (!selectedSeats || selectedSeats.length === 0) {
      Toast.show({
        type: "error",
        text1: "No Seats Selected",
        text2: "Please select at least one seat.",
      });
      return;
    }

    try {
      for (const seat of selectedSeats) {
        // **1️⃣ Update Seat Status**
        await apiClient.patch(`/bus/update-seat-status`, {
          busId,
          seatNumber: seat?.seatNumber,
          booked: true,
          email: "mannannasir49@gmail.com",
          gender: seat?.gender,
        });

        // **2️⃣ Generate Ticket**
        await axios.post(`${apiBaseUrl}/ticket/generate`, {
          userId,
          busId,
          seatNumber: seat?.seatNumber,
          travelDate: new Date().toISOString(),
        });
      }

      Toast.show({
        type: "success",
        text2: "Your ticket has been successfully generated.",
      });
      navigation.navigate("MainTabs", { screen: "Ticket" });
    } catch (error) {
      console.error("Error generating tickets:", error);
      Toast.show({
        type: "error",
        text1: "Something went wrong while booking tickets.",
      });
    }
  };

  return (
    <View>
      <AppButton text="Pay Now" onPress={openPaymentSheet} disabled={loading} />
    </View>
  );
};

export default Payment;
