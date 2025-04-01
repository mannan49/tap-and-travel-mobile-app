import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Payment from "../../Components/Payment";

const PaymentScreen = ({ route }) => {
  const { amount, busId, userId, adminId, selectedSeats } = route.params;
  return (
    <View style={styles.container}>
      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <Text style={styles.title}>Billing Details</Text>
          <Text style={styles.detail}><Text style={styles.label}>Name:</Text> John Doe</Text>
          <Text style={styles.detail}><Text style={styles.label}>Email:</Text> johndoe@example.com</Text>
          <Text style={styles.detail}><Text style={styles.label}>Total Amount:</Text> $50.00</Text>
        </View>
      </View>
      <Payment style={styles.button}
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
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
    elevation: 3,
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  cardContainer: {
    width: "90%",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  card: {
    backgroundColor: "white",
    padding: 25,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    width: "100%",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#2C3E50",
  },
  detail: {
    fontSize: 16,
    color: "#34495E",
    marginBottom: 8,
  },
  label: {
    fontWeight: "bold",
    color: "#2C3E50",
  },
});

export default PaymentScreen;