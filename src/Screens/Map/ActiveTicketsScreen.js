import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import AppButton from "../../Components/Button";
import { apiBaseUrl } from "../../config/urls";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import apiClient from "../../api/apiClient";
import * as Location from "expo-location";
import { formatDate } from "../../utils/helperFunction";

const ActiveTicketsScreen = () => {
  const navigation = useNavigation();
  const [activeTickets, setActiveTickets] = useState([]);

  useEffect(() => {
    fetchActiveTickets();
  }, []);

  const fetchActiveTickets = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const decoded = jwtDecode(token);
      const userId = decoded?.sub;
      const { data } = await apiClient(`/ticket/user/information/${userId}`);
      console.log("DAta", data);
      const today = new Date().toISOString().split("T")[0];
      const filtered = data.filter((ticket) => {
        const ticketTravelDate = ticket?.date;

        if (!ticketTravelDate) {
          console.warn("Ticket has no travelDate:", ticket);
          return false;
        }

        const ticketDate = new Date(ticketTravelDate);
        if (isNaN(ticketDate.getTime())) return false;

        const formattedDate = ticketDate.toISOString().split("T")[0];

        return formattedDate >= today;
      });

      setActiveTickets(filtered);
      console.log("Active tickets:", filtered);
    } catch (error) {}
  };

  const processedTickets = activeTickets.map((ticket) => {
    const today = new Date();
    const ticketDate = new Date(ticket?.date);
    const isToday = ticketDate.toDateString() === today.toDateString();

    let shouldShowNavigationButton = false;
    if (isToday) {
      const departure = new Date(`${ticket?.date}T${ticket?.departureTime}`);
      const arrival = new Date(`${ticket?.date}T${ticket?.arrivalTime}`);
      const beforeDeparture = new Date(departure.getTime() - 30 * 60000); // 30 min before departure
      const afterArrival = new Date(arrival.getTime() + 15 * 60000); // 15 min after arrival

      if (today >= beforeDeparture && today <= afterArrival) {
        shouldShowNavigationButton = true;
      }
    }

    return { ...ticket, shouldShowNavigationButton };
  });

  const handleChoose = async (ticket) => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Location permission is required.");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const currentLocation = {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      };

      const payload = {
        userId: ticket?.userId,
        busId: ticket?.busId,
        currentLocation,
        route: {
          ...ticket?.route,
          stops: ticket?.route?.stops?.map((stop) => ({ ...stop })),
        },
      };

      await apiClient.post("/ticket/schedule-notifications", payload);

      navigation.navigate("TrackLocation", { busId: ticket?.busId });
    } catch (error) {
      console.error("Error scheduling notifications:", error);
      navigation.navigate("TrackLocation", { busId: ticket?.busId });
      alert("Failed to schedule notifications. Please try again.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Choose Your Route</Text>

      {processedTickets.length > 0 ? (
        processedTickets.map((ticket, index) => (
          <View key={index} style={styles.card}>
            {/* Check if ticket.route exists before accessing its properties */}
            {ticket.route ? (
              <Text style={styles.route}>
                {ticket?.route?.startCity} → {ticket?.route?.endCity}
              </Text>
            ) : (
              <Text style={styles.route}>Route information is unavailable</Text>
            )}
            <Text style={styles.date}>Date: {formatDate(ticket?.date)}</Text>
            <Text style={styles.bus}>Bus: {ticket?.busDetails?.busNumber}</Text>
            {/* {ticket.shouldShowNavigationButton && (
              <AppButton
                text="Start Navigation"
                onPress={() => handleChoose(ticket)}
                variant="primary"
              />
            )} */}
            <AppButton
              text="Start Navigation"
              onPress={() => handleChoose(ticket)}
              variant="primary"
            />
          </View>
        ))
      ) : (
        <Text style={styles.emptyText}>No active tickets available.</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#FFFFFF",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 16,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#F8F8F8",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  route: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
  },
  date: {
    fontSize: 14,
    marginBottom: 4,
    color: "#7F8C8D",
  },
  bus: {
    fontSize: 14,
    marginBottom: 10,
    color: "#7F8C8D",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 30,
    fontSize: 16,
    color: "#7F8C8D",
  },
});

export default ActiveTicketsScreen;
