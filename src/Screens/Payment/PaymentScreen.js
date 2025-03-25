import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Payment from "../../Components/Payment";

const PaymentScreen = ({ route }) => {
  const { amount, busId, userId, adminId, selectedSeats } = route.params;
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Billing Details</Text>
        <Text>Name: John Doe</Text>
        <Text>Email: johndoe@example.com</Text>
        <Text>Total Amount: $50.00</Text>
      </View>
      <Payment
        amount={amount}
        busId={busId}
        userId={userId}
        adminId={adminId}
        selectedSeats={selectedSeats}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#f8f9fa",
  },
  card: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
});

export default PaymentScreen;
