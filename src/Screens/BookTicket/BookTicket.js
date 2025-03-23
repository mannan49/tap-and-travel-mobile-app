import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  Pressable,
} from "react-native";
import { apiBaseUrl } from "../../config/urls";

const BookTicket = ({ route }) => {
  const { busId } = route.params;
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
      setSelectedSeats((prevSeats) => [...prevSeats, { ...seat, gender: null }]);
    }
  };

  const handleGenderSelection = (gender) => {
    const updatedSeats = selectedSeats.map((seat) => ({
      ...seat,
      gender: gender,
    }));
    setSelectedSeats(updatedSeats);
    setGenderModalVisible(false);

    // You can handle submission here
    console.log("Selected Seats with Gender: ", updatedSeats);
  };

  const renderSeat = ({ item }) => {
    const isBooked = item.booked;
    const selectedSeat = selectedSeats.find(
      (s) => s.seatNumber === item.seatNumber
    );
    const isSelected = !!selectedSeat;

    let seatColor = "gray";
    if (isBooked) {
      seatColor = item.gender === "M" ? "#4a90e2" : "#e94b86"; // Blue / Pink
    } else if (isSelected) {
      seatColor = "green";
    }

    return (
      <TouchableOpacity
        style={[styles.seat, { backgroundColor: seatColor }]}
        onPress={() => toggleSeatSelection(item)}
        disabled={isBooked}
      >
        <Text style={styles.seatText}>{item.seatNumber.split("-")[1]}</Text>
        {isBooked && <Text style={styles.gender}>{item.gender}</Text>}
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
    <View style={styles.container}>
      <Text style={styles.title}>{selectedBus?.route?.startCity} to {selectedBus?.route?.endCity}</Text>
      <Text style={styles.subtitle}>Select Your Seat</Text>

      <FlatList
        data={selectedBus.seats}
        numColumns={4}
        keyExtractor={(item) => item.seatNumber}
        renderItem={renderSeat}
        contentContainerStyle={styles.seatLayout}
      />

      {/* Show confirm button when seats are selected */}
      {selectedSeats.length > 0 && (
        <View style={styles.selectionInfo}>
          <Text style={styles.selectionText}>
            Selected Seats:{" "}
            {selectedSeats.map((s) => s.seatNumber.split("-")[1]).join(", ")}
          </Text>

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={() => setGenderModalVisible(true)}
          >
            <Text style={styles.confirmButtonText}>Confirm Your Booking</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Gender Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={genderModalVisible}
        onRequestClose={() => setGenderModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Select Gender</Text>

            <Pressable
              style={[styles.genderButton, { backgroundColor: "#4a90e2" }]}
              onPress={() => handleGenderSelection("M")}
            >
              <Text style={styles.genderButtonText}>Male</Text>
            </Pressable>

            <Pressable
              style={[styles.genderButton, { backgroundColor: "#e94b86" }]}
              onPress={() => handleGenderSelection("F")}
            >
              <Text style={styles.genderButtonText}>Female</Text>
            </Pressable>

            <TouchableOpacity
              onPress={() => setGenderModalVisible(false)}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  seatLayout: {
    alignItems: "center",
  },
  seat: {
    width: 60,
    height: 60,
    margin: 8,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  seatText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  gender: {
    color: "white",
    fontSize: 12,
  },
  selectionInfo: {
    marginTop: 20,
    alignItems: "center",
  },
  selectionText: {
    fontSize: 16,
    marginBottom: 10,
  },
  confirmButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  confirmButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    backgroundColor: "white",
    marginHorizontal: 30,
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  genderButton: {
    width: "80%",
    padding: 12,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: "center",
  },
  genderButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    marginTop: 15,
  },
  cancelButtonText: {
    color: "#555",
    fontSize: 14,
  },
});

export default BookTicket;
