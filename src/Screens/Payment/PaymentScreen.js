import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import Payment from "../../Components/Payment";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import ConfettiCannon from "react-native-confetti-cannon";

const PaymentScreen = ({ route }) => {
  const { amount, busId, userId, userName, email, adminId, selectedSeats } = route.params;
  const [showConfetti, setShowConfetti] = useState(false);

  const handlePaymentSuccess = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000); // Optional reset after 5s
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Animatable.View animation="fadeInUp" duration={700} style={styles.cardContainer}>
        <View style={styles.glassCard}>
          <Text style={styles.cardTitle}>💳 Billing Summary</Text>

          <View style={styles.detailRow}>
            <MaterialIcons name="person" size={22} color="#00cec9" style={styles.icon} />
            <Text style={styles.detail}>
              <Text style={styles.label}>Name: </Text>
              {userName}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <MaterialIcons name="email" size={22} color="#6c5ce7" style={styles.icon} />
            <Text style={styles.detail}>
              <Text style={styles.label}>Email: </Text>
              {email}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <FontAwesome5 name="money-bill-wave" size={20} color="#00b894" style={styles.icon} />
            <Text style={styles.detail}>
              <Text style={styles.label}>Total: </Text>PKR {amount}
            </Text>
          </View>
        </View>
      </Animatable.View>

      <Animatable.View animation="fadeInUp" duration={700} delay={300}>
        <Payment
          style={styles.button}
          amount={amount}
          busId={busId}
          userId={userId}
          email={email}
          adminId={adminId}
          selectedSeats={selectedSeats}
          onSuccess={handlePaymentSuccess}
        />
      </Animatable.View>

      {showConfetti && (
        <>
          <ConfettiCannon count={100} origin={{ x: 0, y: 0 }} fadeOut explosionSpeed={300} />
          <ConfettiCannon count={100} origin={{ x: 400, y: 0 }} fadeOut explosionSpeed={300} />
        </>
      )}
    </ScrollView>
  );
};

export default PaymentScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: "#f9f9f9",
    alignItems: "center",
    justifyContent: "center",
  },
  cardContainer: {
    width: "100%",
    marginBottom: 24,
  },
  glassCard: {
    backgroundColor: "rgba(41, 41, 102, 0.85)",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 20,
    textAlign: "center",
    letterSpacing: 1,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  icon: {
    marginRight: 10,
  },
  detail: {
    fontSize: 16,
    color: "#f0f0f0",
    flexShrink: 1,
  },
  label: {
    fontWeight: "bold",
    color: "#ffffff",
  },
  button: {
    marginTop: 10,
    borderRadius: 12,
    paddingVertical: 14,
    backgroundColor: "#5d5de6",
    alignItems: "center",
    justifyContent: "center",
  },
});
