import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import apiClient from "../../api/apiClient";
import AppButton from "../../Components/Button";
import TicketCard from "./TicketCard";
import * as Animatable from "react-native-animatable";

const Ticket = () => {
  const [tickets, setTickets] = useState(null);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("active");

  const fetchTickets = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return console.warn("Token not found!");
      const decoded = jwtDecode(token);
      const userId = decoded?.sub;
      if (!userId) return console.warn("UserId not found in token!");

      const { data } = await apiClient(`/ticket/user/information/${userId}`);
      setTickets(data);
      filterTickets(data, selectedTab);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    filterTickets(tickets, selectedTab);
  }, [selectedTab]);

  const filterTickets = (ticketsList, tab) => {
    const filtered = tab === "active" ? ticketsList?.active : ticketsList?.past;
    setFilteredTickets(filtered || []);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🎫 My Tickets</Text>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <AppButton
          text="Active"
          variant={selectedTab === "active" ? "primary" : "secondary"}
          onPress={() => setSelectedTab("active")}
        />
        <View style={{ marginHorizontal: 8 }} />
        <AppButton
          text="Past"
          variant={selectedTab === "past" ? "primary" : "secondary"}
          onPress={() => setSelectedTab("past")}
        />
      </View>

      {/* Content */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#2C3E50"
          style={{ marginTop: 40 }}
        />
      ) : (
        <Animatable.View animation="fadeInUp" duration={700} style={{ flex: 1 }}>
          <FlatList
            data={filteredTickets}
            keyExtractor={(item, index) => `${item._id}_${index}`}
            renderItem={({ item }) => <TicketCard ticket={item} />}
            contentContainerStyle={{ paddingBottom: 40 }}
            ListEmptyComponent={() => (
              <View style={styles.noTicketsContainer}>
                <Text style={styles.noTicketsText}>
                  No {selectedTab} tickets found.
                </Text>
              </View>
            )}
          />
        </Animatable.View>
      )}
    </View>
  );
};

export default Ticket;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 60,
    backgroundColor: "#FFFFFF",
  },
  header: {
    fontSize: 28,
    color: "#2C3E50",
    marginBottom: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  noTicketsContainer: {
    marginTop: 60,
    alignItems: "center",
  },
  noTicketsText: {
    color: "#95A5A6",
    fontSize: 16,
  },
});
