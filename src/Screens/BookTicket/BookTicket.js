import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
} from "react-native";
import { apiBaseUrl } from "../../config/urls";
import { useNavigation } from "@react-navigation/native";
import AppButton from "../../Components/Button";
import { jwtDecode } from "jwt-decode";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import * as Animatable from "react-native-animatable";

const BookTicket = ({ route }) => {
  const { busId } = route.params;
  const navigation = useNavigation();
  const [selectedBus, setSelectedBus] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [genderModalVisible, setGenderModalVisible] = useState(false);

  useEffect(() => {
    const fetchSelectedBus = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/bus/${busId}`);
        const data = await response.json();
        setSelectedBus(data);
      } catch (error) {
        console.error("Error fetching bus data:", error);
      }
    };

    if (busId) {
      fetchSelectedBus();
    }
  }, [busId]);

  const toggleSeatSelection = (seat) => {
    if (seat.booked) return;

    const alreadySelected = selectedSeats.find(
      (s) => s.seatNumber === seat.seatNumber
    );

    if (alreadySelected) {
      setSelectedSeats((prevSeats) =>
        prevSeats.filter((s) => s.seatNumber !== seat.seatNumber)
      );
    } else {
      setSelectedSeats((prevSeats) => [
        ...prevSeats,
        { ...seat, gender: null },
      ]);
    }
  };

  const handleGenderSelection = async (gender) => {
    for (let seat of selectedSeats) {
      const neighborGender = seat?.neighborGender;
      if (neighborGender && neighborGender !== gender) {
        Toast.show({
          type: "error",
          text1: `Seat ${seat.seatNumber.split("-")[1]}: Must select ${
            neighborGender === "M" ? "Male" : "Female"
          }`,
        });
        return;
      }
    }

    const token = await AsyncStorage.getItem("token");
    if (!token) return;

    const decoded = jwtDecode(token);
    const userId = decoded?.sub;
    const userName = decoded?.name;
    const email = decoded?.email;

    const updatedSeats = selectedSeats.map((seat) => ({
      ...seat,
      gender: gender,
    }));

    setSelectedSeats(updatedSeats);
    setGenderModalVisible(false);

    const totalAmount = selectedSeats.length * selectedBus.fare.actualPrice;

    navigation.navigate("PaymentScreen", {
      busId,
      userId,
      userName,
      email,
      amount: totalAmount,
      adminId: selectedBus?.busDetails?.adminId,
      selectedSeats: updatedSeats,
    });
  };

  const renderSeat = ({ item }) => {
    const isBooked = item.booked;
    const selectedSeat = selectedSeats.find(
      (s) => s.seatNumber === item.seatNumber
    );
    const isSelected = !!selectedSeat;

    let seatColor = "#BDC3C7"; // default: gray
    if (isBooked) {
      seatColor = item.gender === "M" ? "#4a90e2" : "#e94b86";
    } else if (isSelected) {
      seatColor = "#27ae60";
    }

    return (
      <TouchableOpacity
        style={[styles.seat, { backgroundColor: seatColor }]}
        onPress={() => toggleSeatSelection(item)}
        disabled={isBooked}
      >
        <Text style={styles.seatText}>{item.seatNumber.split("-")[1]}</Text>
        {isBooked && <Text style={styles.gender}>{item?.gender}</Text>}
      </TouchableOpacity>
    );
  };

  if (!selectedBus) {
    return (
      <View style={styles.container}>
        <Text>Loading bus details...</Text>
      </View>
    );
  }

  return (
    <Animatable.View animation="fadeInUp" duration={700} style={styles.container}>
      <Text style={styles.title}>
        {selectedBus?.route?.startCity} → {selectedBus?.route?.endCity}
      </Text>
      <Text style={styles.subtitle}>Select Your Seat</Text>

      <FlatList
        data={selectedBus.seats}
        numColumns={4}
        keyExtractor={(item) => item.seatNumber}
        renderItem={renderSeat}
        contentContainerStyle={styles.seatLayout}
      />

      {selectedSeats.length > 0 && (
        <View style={styles.selectionInfo}>
          <Text style={styles.selectionText}>
            Selected Seats:{" "}
            {selectedSeats.map((s) => s.seatNumber.split("-")[1]).join(", ")}
          </Text>
          <AppButton
            variant="secondary"
            text="Confirm Your Bookings"
            onPress={() => setGenderModalVisible(true)}
          />
        </View>
      )}

      <Modal
        animationType="fade"
        transparent={true}
        visible={genderModalVisible}
        onRequestClose={() => setGenderModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <Animatable.View animation="zoomIn" style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Select Gender</Text>
            <AppButton
              style={{ width: 150 }}
              text="Male"
              variant="secondary"
              onPress={() => handleGenderSelection("M")}
            />
            <View style={{ marginVertical: 8 }} />
            <AppButton
              style={{ width: 150 }}
              text="Female"
              variant="secondary"
              onPress={() => handleGenderSelection("F")}
            />
            <TouchableOpacity
              onPress={() => setGenderModalVisible(false)}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </Animatable.View>
        </View>
      </Modal>
    </Animatable.View>
  );
};

export default BookTicket;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    backgroundColor: "#F9F9F9",
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#7F8C8D",
    marginBottom: 24,
    textAlign: "center",
  },
  seatLayout: {
    alignItems: "center",
    marginBottom: 40,
  },
  seat: {
    width: 58,
    height: 58,
    margin: 10,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: "#BDC3C7",
    elevation: 2,
  },
  seatText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  gender: {
    color: "#fff",
    fontSize: 12,
  },
  selectionInfo: {
    marginTop: 10,
    alignItems: "center",
    paddingBottom: 20,
  },
  selectionText: {
    fontSize: 16,
    color: "#34495E",
    marginBottom: 14,
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 32,
    padding: 24,
    borderRadius: 14,
    alignItems: "center",
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 20,
  },
  cancelButton: {
    marginTop: 16,
  },
  cancelButtonText: {
    color: "#7F8C8D",
    fontSize: 14,
  },
});
