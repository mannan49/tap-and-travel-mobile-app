import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import AppButton from "../../Components/Button";
import { apiBaseUrl } from "../../config/urls";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";

const ActiveTicketsScreen = () => {
    const navigation = useNavigation();
    const [activeTickets, setActiveTickets] = useState([]);

    useEffect(() => {
        fetchActiveTickets();
    }, []);

    const fetchActiveTickets = async () => {
        try {
            const token = await AsyncStorage.getItem('token');

            if (!token) {
                console.warn('Token not found!');
                return;
            }

            const decoded = jwtDecode(token);

            const userId = decoded?.sub;

            if (!userId) {
                console.warn('UserId not found in token!');
                return;
            }
            const { data } = await axios(`${apiBaseUrl}/ticket/user/${userId}`);
            // console.log("Fetched ticket data:", data);
            const today = new Date().toISOString().split("T")[0];  // Get today's date in YYYY-MM-DD format

            // Filter tickets based on the travelDate
            const filtered = data.filter((ticket) => {
                const ticketTravelDate = ticket.travelDate;  // Use the travelDate field

                if (!ticketTravelDate) {
                    console.warn('Ticket has no travelDate:', ticket);
                    return false;
                }

                const ticketDate = new Date(ticketTravelDate);
                if (isNaN(ticketDate.getTime())) return false;  // Check if the date is valid

                const formattedDate = ticketDate.toISOString().split("T")[0];  // Format the date
                return formattedDate >= today;  // Only include tickets with a future date
            });


            setActiveTickets(filtered);
            console.log("Active tickets:", activeTickets);
        } catch (error) {
            console.error("Error fetching tickets:", error);
        }
    };

    const handleChoose = (ticket) => {
        navigation.navigate("TrackLocation", { ticket });
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>Active Tickets</Text>

            {activeTickets.length > 0 ? (
                activeTickets.map((ticket, index) => (
                    <View key={index} style={styles.card}>
                        {/* Check if ticket.route exists before accessing its properties */}
                        {ticket.route ? (
                            <Text style={styles.route}>
                                {ticket.route.startCity} → {ticket.route.endCity}
                            </Text>
                        ) : (
                            <Text style={styles.route}>Route information is unavailable</Text>
                        )}
                        <Text style={styles.date}>Date: {ticket.date}</Text>
                        <Text style={styles.bus}>Bus: {ticket.busName}</Text>
                        <AppButton
                            text="Choose"
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
        marginBottom: 16,
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
