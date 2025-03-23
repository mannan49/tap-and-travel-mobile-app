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
    paddingHorizontal: 24,
    paddingTop: 60, // Increased spacing from the top
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 32,
  },
  seatLayout: {
    alignItems: 'center',
    marginBottom: 40,
  },
  seat: {
    width: 60,
    height: 60,
    margin: 10, // Slightly more space between seats
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#3498DB', // Example color for available seat
  },
  seatText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  gender: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  selectionInfo: {
    marginTop: 40,
    alignItems: 'center',
  },
  selectionText: {
    fontSize: 18,
    color: '#34495E',
    marginBottom: 20,
  },
  confirmButton: {
    backgroundColor: '#1ABC9C',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 32,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 24,
  },
  genderButton: {
    width: '80%',
    paddingVertical: 14,
    borderRadius: 10,
    marginVertical: 12,
    alignItems: 'center',
    backgroundColor: '#2980B9',
  },
  genderButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    marginTop: 20,
  },
  cancelButtonText: {
    color: '#7F8C8D',
    fontSize: 14,
  },
});


export default BookTicket;
