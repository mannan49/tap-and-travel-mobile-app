import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";

const BookTicket = ({ route }) => {
  const { busId } = route.params; // Access the busId passed from the previous screen
  const [selectedBus, setSelectedBus] = useState(null);

  useEffect(() => {
    // Fetch the selected bus data using the busId
    const fetchSelectedBus = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/bus/${busId}`); // Fetch the bus details by busId
        const data = await response.json();
        setSelectedBus(data); // Store the bus details
      } catch (error) {
        console.error("Error fetching bus data:", error);
      }
    };

    if (busId) {
      fetchSelectedBus(); // Fetch bus details when busId is available
    }
  }, [busId]);

  if (!selectedBus) {
    return (
      <View style={styles.container}>
        <Text>Loading bus details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text>Bus ID: {selectedBus.id}</Text>
      <Text>Bus Company: {selectedBus.adminName}</Text>
      {/* Display other bus details here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default BookTicket;

// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   Button,
//   Modal,
//   TouchableOpacity,
//   StyleSheet,
// } from "react-native";

// export const getBusData = async (busData) => {
//     try {
//       const response = await fetch(
//         "https://tap-and-travel-backend.vercel.app/api/v1/bus/",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(busData),
//         }
//       );
//       const data = await response.json();
//       console.log("Parsed JSON data:", data);
//     }
//     catch (err) {
//         const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
//         console.error("Error in getting the bus :", errorMessage);
//         return { success: false, message: errorMessage };
//     }
// }

// const BookingTicketForm = ({ busData }) => {
//   const [selectedSeat, setSelectedSeat] = useState(null);
//   const [showGenderModal, setShowGenderModal] = useState(false);
//   const [selectedGender, setSelectedGender] = useState(null);

//   // Function to handle seat selection
//   const handleSeatSelect = (seatNumber) => {
//     setSelectedSeat(seatNumber);
//     setShowGenderModal(true); // Show the gender selection modal
//   };

//   const handleGenderSelect = (gender) => {
//     setSelectedGender(gender);
//     setShowGenderModal(false); // Close the modal after gender selection
//     // Proceed to booking, or do something else with the seat & gender
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Select Your Seat</Text>

//       <View style={styles.seatContainer}>
//         {busData.seats.map((seat, index) => (
//           <TouchableOpacity
//             key={index}
//             style={[
//               styles.seatButton,
//               !seat.isAvailable && styles.seatUnavailable,
//             ]}
//             onPress={() =>
//               seat.isAvailable && handleSeatSelect(seat.seatNumber)
//             }
//             disabled={!seat.isAvailable}
//           >
//             <Text style={styles.seatText}>{seat.seatNumber}</Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       {/* Modal for Gender Selection */}
//       <Modal
//         visible={showGenderModal}
//         animationType="slide"
//         transparent={true}
//         onRequestClose={() => setShowGenderModal(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>Select Gender</Text>
//             <TouchableOpacity
//               style={styles.modalButton}
//               onPress={() => handleGenderSelect("Male")}
//             >
//               <Text style={styles.modalButtonText}>Male</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={styles.modalButton}
//               onPress={() => handleGenderSelect("Female")}
//             >
//               <Text style={styles.modalButtonText}>Female</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={styles.modalButton}
//               onPress={() => handleGenderSelect("Other")}
//             >
//               <Text style={styles.modalButtonText}>Other</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: "white",
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginBottom: 20,
//     textAlign: "center",
//   },
//   seatContainer: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "space-evenly",
//   },
//   seatButton: {
//     width: 60,
//     height: 60,
//     borderRadius: 5,
//     backgroundColor: "#4CAF50",
//     justifyContent: "center",
//     alignItems: "center",
//     margin: 5,
//   },
//   seatUnavailable: {
//     backgroundColor: "#B0BEC5",
//   },
//   seatText: {
//     color: "white",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   modalOverlay: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "rgba(0, 0, 0, 0.5)",
//   },
//   modalContent: {
//     backgroundColor: "white",
//     padding: 20,
//     borderRadius: 10,
//     width: 300,
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: "bold",
//     marginBottom: 20,
//     textAlign: "center",
//   },
//   modalButton: {
//     padding: 15,
//     backgroundColor: "#4CAF50",
//     borderRadius: 5,
//     marginBottom: 10,
//     alignItems: "center",
//   },
//   modalButtonText: {
//     color: "white",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
// });

// export default BookingTicketForm;
