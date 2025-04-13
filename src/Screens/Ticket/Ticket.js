import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import apiClient from "../../api/apiClient";
import AppButton from "../../Components/Button";
import Icon from "react-native-vector-icons/FontAwesome";

const Ticket = () => {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]); // ⬅️ filtered tickets
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("active"); // ⬅️ tab state

  const fetchTickets = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        console.warn("Token not found!");
        return;
      }

      const decoded = jwtDecode(token);

      const userId = decoded?.sub;

      if (!userId) {
        console.warn("UserId not found in token!");
        return;
      }

      const { data } = await apiClient(`/ticket/user/${userId}`);
      setTickets(data);
      filterTickets(data, selectedTab); // ⬅️ filter tickets after fetching
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };
  const formatSeatNumber = (seatNumber) => {
    if (!seatNumber) return "N/A";

    const parts = seatNumber.split("-");
    return parts[1]; // Just get the row number (the second part)
  };
  useEffect(() => {
    fetchTickets();
  }, []);

  // ⬇️ filter tickets whenever selectedTab changes
  useEffect(() => {
    filterTickets(tickets, selectedTab);
  }, [selectedTab]);

  const filterTickets = (ticketsList, tab) => {
    const today = new Date();

    if (tab === "active") {
      const active = ticketsList.filter((ticket) => {
        const travelDate = new Date(ticket.travelDate);
        return travelDate >= today;
      });
      setFilteredTickets(active);
    } else {
      const past = ticketsList.filter((ticket) => {
        const travelDate = new Date(ticket.travelDate);
        return travelDate < today;
      });
      setFilteredTickets(past);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Tickets</Text>

      {/* ⬇️ Tabs */}
      <View style={styles.tabsContainer}>
        <AppButton
          text="Active"
          variant={selectedTab === "active" ? "primary" : "secondary"}
          onPress={() => setSelectedTab("active")}
        />
        <View style={{ marginHorizontal: 8 }} />
        <AppButton
          text="Past"
          onPress={() => setSelectedTab("past")}
          variant={selectedTab === "past" ? "primary" : "secondary"}
        />
      </View>

      <FlatList
        data={filteredTickets}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.ticketCard}>
            <View style={styles.ticketRow}>
              <Icon
                name="building"
                size={18}
                color="#3498db"
                style={styles.icon}
              />
              <Text style={styles.ticketText}>{item.adminId?.name}</Text>
            </View>
            <View style={styles.ticketRow}>
              <Icon
                name="event-seat"
                size={18}
                color="#8e44ad"
                style={styles.icon}
              />
              <Text style={styles.ticketText}>
                Seat: {formatSeatNumber(item?.seatNumber)}
              </Text>
            </View>
            <View style={styles.ticketRow}>
              <Icon
                name="money"
                size={18}
                color="#27ae60"
                style={styles.icon}
              />
              <Text style={styles.ticketText}>Fare: Rs. {item?.fare}</Text>
            </View>
            <View style={styles.ticketRow}>
              <Icon
                name="calendar"
                size={18}
                color="#e67e22"
                style={styles.icon}
              />
              <Text style={styles.ticketText}>
                {new Date(item?.travelDate).toDateString()}
              </Text>
            </View>
            <View style={styles.ticketRow}>
              <Icon
                name="check-circle"
                size={18}
                color={item.status === "confirmed" ? "#2ecc71" : "#e74c3c"}
                style={styles.icon}
              />
              <Text style={styles.ticketText}>Status: {item?.status}</Text>
            </View>
            <View style={styles.barcodeContainer}>
              <Image
                source={require("../../../assets/barcode.png")}
                style={styles.barcode}
                resizeMode="contain"
              />
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.noTicketsContainer}>
            <Text style={styles.noTicketsText}>
              No {selectedTab} tickets found.
            </Text>
          </View>
        )}
      />
    </View>
  );
};

export default Ticket;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 8,
    paddingTop: 60, // Increased top padding for better spacing
    backgroundColor: "#FFFFFF", // Clean white background
  },
  header: {
    fontSize: 28,
    color: "#2C3E50", // Darker text for better readability
    marginBottom: 20, // More spacing below header
    fontWeight: "bold",
    textAlign: "center",
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 12, // Increased spacing under tabs
  },
  tabButton: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    backgroundColor: "#F4F6F8", // Light neutral grey tab
    borderRadius: 12,
    marginHorizontal: 6,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4, // Enhanced Android shadow
  },
  activeTabButton: {
    backgroundColor: "#1ABC9C", // Highlight color for active tab (same)
  },
  tabButtonText: {
    color: "#34495E", // Darker neutral text
    fontWeight: "bold",
    fontSize: 16,
  },
  activeTabButtonText: {
    color: "#FFFFFF", // White text on active tab
  },
  ticketRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 0,
  },
  icon: {
    marginRight: 12,
  },
  barcodeContainer: {
    alignItems: "center",
    marginTop: 0,
  },
  barcode: {
    width: 180,
    height: 100,
    opacity: 0.8,
  },
  ticketCard: {
    backgroundColor: "#fff",
    paddingHorizontal: 30,
    paddingVertical: 10,
    marginBottom: 24,
    borderRadius: 16,
    borderColor: "#e0e0e0",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  ticketText: {
    color: "#2C3E50", // Dark text for readability
    fontSize: 16,
    marginBottom: 8,
  },
  noTicketsContainer: {
    marginTop: 60, // More space before showing "no tickets" message
    alignItems: "center",
  },
  noTicketsText: {
    color: "#95A5A6", // Softer grey for no ticket messages
    fontSize: 16,
  },
});
