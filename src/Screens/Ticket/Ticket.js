import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import apiClient from '../../api/apiClient';

const Ticket = () => {
    const [tickets, setTickets] = useState([]);
    const [filteredTickets, setFilteredTickets] = useState([]); // ⬅️ filtered tickets
    const [loading, setLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState('active'); // ⬅️ tab state

    const fetchTickets = async () => {
        try {
            const token = await AsyncStorage.getItem('token');

            if (!token) {
                console.warn('Token not found!');
                return;
            }

            const decoded = jwtDecode(token);
            console.log('Decoded JWT:', decoded);

            const userId = decoded?.sub;

            if (!userId) {
                console.warn('UserId not found in token!');
                return;
            }



            // const response = await fetch(`https://tap-and-travel-backend.vercel.app/api/v1/ticket/user/${userId}`);
            const response = await apiClient(`/ticket/user/${userId}`);
            const data = await response.json();

            // console.log('Tickets fetched:', data);
            setTickets(data);
            filterTickets(data, selectedTab); // ⬅️ filter tickets after fetching
        } catch (error) {
            console.error('Error fetching tickets:', error);
        } finally {
            setLoading(false);
        }
    };
    const formatSeatNumber = (seatNumber) => {
        if (!seatNumber) return 'N/A';

        const parts = seatNumber.split('-');
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

        if (tab === 'active') {
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
                <TouchableOpacity
                    style={[
                        styles.tabButton,
                        selectedTab === 'active' && styles.activeTabButton,
                    ]}
                    onPress={() => setSelectedTab('active')}
                >
                    <Text style={styles.tabButtonText}>Active</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.tabButton,
                        selectedTab === 'past' && styles.activeTabButton,
                    ]}
                    onPress={() => setSelectedTab('past')}
                >
                    <Text style={styles.tabButtonText}>Past</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={filteredTickets}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <View style={styles.ticketCard}>
                        <Text style={styles.ticketText}>Company: {item.adminId?.name}</Text>
                        <Text style={styles.ticketText}>Seat: {formatSeatNumber(item.seatNumber)}</Text>
                        <Text style={styles.ticketText}>Fare: {item.fare}</Text>
                        <Text style={styles.ticketText}>Travel Date: {new Date(item.travelDate).toDateString()}</Text>
                        <Text style={styles.ticketText}>Status: {item.status}</Text>
                    </View>
                )}
                ListEmptyComponent={() => (
                    <View style={styles.noTicketsContainer}>
                        <Text style={styles.noTicketsText}>No {selectedTab} tickets found.</Text>
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
        paddingHorizontal: 24,
        paddingTop: 60, // Increased top padding for better spacing
        backgroundColor: '#FFFFFF', // Clean white background
    },
    header: {
        fontSize: 28,
        color: '#2C3E50', // Darker text for better readability
        marginBottom: 40, // More spacing below header
        fontWeight: 'bold',
        textAlign: 'center',
    },
    tabsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 32, // Increased spacing under tabs
    },
    tabButton: {
        paddingVertical: 12,
        paddingHorizontal: 28,
        backgroundColor: '#F4F6F8', // Light neutral grey tab
        borderRadius: 12,
        marginHorizontal: 6,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4, // Enhanced Android shadow
    },
    activeTabButton: {
        backgroundColor: '#1ABC9C', // Highlight color for active tab (same)
    },
    tabButtonText: {
        color: '#34495E', // Darker neutral text
        fontWeight: 'bold',
        fontSize: 16,
    },
    activeTabButtonText: {
        color: '#FFFFFF', // White text on active tab
    },
    ticketCard: {
        backgroundColor: '#FFFFFF', // Clean white background for cards
        padding: 20,
        marginBottom: 24,
        borderRadius: 12,
        borderColor: '#ECECEC', // Soft border for card edges
        borderWidth: 1,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 3, // Subtle elevation for Android
    },
    ticketText: {
        color: '#2C3E50', // Dark text for readability
        fontSize: 16,
        marginBottom: 8,
    },
    noTicketsContainer: {
        marginTop: 60, // More space before showing "no tickets" message
        alignItems: 'center',
    },
    noTicketsText: {
        color: '#95A5A6', // Softer grey for no ticket messages
        fontSize: 16,
    },
});


