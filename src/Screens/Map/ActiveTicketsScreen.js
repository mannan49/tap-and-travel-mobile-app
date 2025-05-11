import React, { useEffect, useState } from "react";
import {
  Image,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AppButton from "../../Components/Button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import apiClient from "../../api/apiClient";
import * as Location from "expo-location";
import { formatDate } from "../../utils/helperFunction";
import { busStatuses } from "../../utils/bus-statuses";
import Loader from "../../Components/Loader";
import * as Animatable from "react-native-animatable";

const ActiveTicketsScreen = () => {
  const navigation = useNavigation();
  const [activeTickets, setActiveTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchActiveTickets();
  }, []);

  const fetchActiveTickets = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const decoded = jwtDecode(token);
      const userId = decoded?.sub;
      const { data } = await apiClient(
        `/ticket/user/information/${userId}?checkUptoEndDate=true`
      );
      setActiveTickets(data?.active);
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const processedTickets = activeTickets.map((ticket) => {
    const today = new Date();
    const ticketDate = new Date(ticket?.date);
    const isToday = ticketDate.toDateString() === today.toDateString();

    const shouldShowNavigationButton =
      isToday && ticket?.busStatus === busStatuses.IN_TRANSIT;

    return { ...ticket, shouldShowNavigationButton };
  });

  const handleChoose = async (ticket) => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission required", "Location access is needed.");
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
      console.error("Error:", error);
      Alert.alert("Error", "Failed to initiate navigation.");
      navigation.navigate("TrackLocation", { busId: ticket?.busId });
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Choose Your Route</Text>

      {loading ? (
        <Loader />
      ) : processedTickets.length > 0 ? (
        processedTickets.map((ticket, index) => (
          <Animatable.View
            key={index}
            animation="fadeInUp"
            duration={500}
            delay={index * 150}
            style={styles.card}
          >
            {ticket.route ? (
              <Text style={styles.route}>
                {ticket?.route?.startCity} → {ticket?.route?.endCity}
              </Text>
            ) : (
              <Text style={styles.route}>Route information unavailable</Text>
            )}

            <Text style={styles.date}>Date: {formatDate(ticket?.date)}</Text>
            <Text style={styles.bus}>Bus: {ticket?.busDetails?.busNumber}</Text>

            <View style={styles.imageContainer}>
              <Image
                source={{
                  uri: "https://t4.ftcdn.net/jpg/02/69/47/51/360_F_269475198_k41qahrZ1j4RK1sarncMiFHpcmE2qllQ.jpg",
                }}
                style={styles.busImage}
              />
            </View>

            {ticket.shouldShowNavigationButton && (
              <AppButton
                text="🧭 Start Navigation"
                onPress={() => handleChoose(ticket)}
                variant="primary"
              />
            )}
          </Animatable.View>
        ))
      ) : (
        <Text style={styles.emptyText}>No active tickets available.</Text>
      )}
    </ScrollView>
  );
};

export default ActiveTicketsScreen;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#F9FAFB",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2C3E50",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 32,
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  route: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#34495E",
    marginBottom: 6,
  },
  date: {
    fontSize: 14,
    color: "#7F8C8D",
    marginBottom: 4,
  },
  bus: {
    fontSize: 14,
    color: "#7F8C8D",
    marginBottom: 12,
  },
  imageContainer: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
    backgroundColor: "#ddd",
  },
  busImage: {
    width: "100%",
    height: undefined,
    aspectRatio: 2,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    color: "#7F8C8D",
  },
});
