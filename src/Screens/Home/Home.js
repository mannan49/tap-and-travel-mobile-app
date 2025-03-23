import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import { apiBaseUrl } from "../../config/urls";
import { format12time, formatDate } from "../../utils/helperFunction";
import Icon from "react-native-vector-icons/FontAwesome";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native"; // Import useNavigation hook

const BookingForm = () => {
  const navigation = useNavigation();
  const [hasSearched, setHasSearched] = useState(false);
  const [filteredBuses, setFilteredBuses] = useState([]);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState([]);

  useEffect(() => {
    fetchBuses();
  }, []);

  const fetchBuses = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiBaseUrl}/bus`);
      const today = new Date().toISOString().split("T")[0];

      const filteredData = response.data.filter((bus) => {
        const busDate = new Date(bus.date).toISOString().split("T")[0];
        return busDate >= today;
      });

      setBuses(filteredData);
      extractCities(filteredData);
      console.log("Fetched Buses:", filteredData);
    } catch (error) {
      console.error("Error fetching buses:", error);
    }
    setLoading(false);
  };

  const extractCities = (busesData) => {
    const citySet = new Set();
    busesData.forEach((bus) => {
      citySet.add(bus.route.startCity);
      citySet.add(bus.route.endCity);
    });
    setCities([...citySet]);
  };

  const [formData, setFormData] = useState({
    fromCity: "",
    toCity: "",
    date: "",
  });

  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleInputChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || formData.date;
    const formattedDate = currentDate
      ? new Date(currentDate).toISOString().split("T")[0]
      : null;

    setShowDatePicker(false);
    setFormData({ ...formData, date: formattedDate });
  };

  const filterBuses = () => {
    const { fromCity, toCity, date } = formData;
    const selectedDate = date ? new Date(date).toISOString().split("T")[0] : null;

    if (!selectedDate) {
      console.error("Invalid date selected");
      return;
    }

    const results = buses.filter((bus) => {
      const busStartCity = bus.route.startCity.trim().toLowerCase();
      const busEndCity = bus.route.endCity.trim().toLowerCase();
      const selectedFromCity = fromCity.trim().toLowerCase();
      const selectedToCity = toCity.trim().toLowerCase();
      const busDate = bus.date ? new Date(bus.date).toISOString().split("T")[0] : null;

      return (
        busStartCity === selectedFromCity &&
        busEndCity === selectedToCity &&
        busDate === selectedDate
      );
    });

    setFilteredBuses(results);
    setLoading(false);
  };

  const handleSubmit = () => {
    setLoading(true);
    setHasSearched(true);
    filterBuses();
  };

  const handleBookTicket = (busId) => {
    navigation.navigate("BookTicket", { busId });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Bus Booking Form</Text>

      {/* From City Dropdown */}
      <Picker
        selectedValue={formData.fromCity}
        style={styles.picker}
        onValueChange={(itemValue) => handleInputChange("fromCity", itemValue)}
      >
        <Picker.Item label="Select From City" value="" />
        {cities.map((city, index) => (
          <Picker.Item key={index} label={city} value={city} />
        ))}
      </Picker>

      {/* To City Dropdown */}
      <Picker
        selectedValue={formData.toCity}
        style={styles.picker}
        onValueChange={(itemValue) => handleInputChange("toCity", itemValue)}
      >
        <Picker.Item label="Select To City" value="" />
        {cities.map((city, index) => (
          <Picker.Item key={index} label={city} value={city} />
        ))}
      </Picker>

      {/* Date Input */}
      <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
        <Text style={styles.dateText}>{formData.date || "Select Date"}</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={new Date(formData.date || new Date())}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}

      {/* Submit Button */}
      <Button title="Search" onPress={handleSubmit} />

      {/* Loading Indicator */}
      {loading && <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />}

      {/* Show filtered buses if search is done */}
      {hasSearched && (
        <View style={styles.results}>
          {filteredBuses.length > 0 ? (
            filteredBuses.map((bus, index) => (
              <View key={index} style={styles.busCard}>
                <Text style={styles.busCompany}>{bus.adminName}</Text>
                <View style={styles.routeContainer}>
                  <Text style={styles.cityText}>{bus.route.startCity} </Text>
                  <Icon name="arrow-right" size={18} color="black" style={styles.arrowIcon} />
                  <Text style={styles.cityText}>{bus.route.endCity}</Text>
                </View>

                <Text style={styles.price}>Only in Rs. {bus.fare.actualPrice}</Text>
                <Text style={styles.dateTime}>
                  {formatDate(bus.date)} {bus.time}
                </Text>
                <Text style={styles.dateTime}>
                  {format12time(bus.departureTime)}
                  {"  "}
                  <Icon name="arrow-right" size={18} color="black" style={styles.arrowIcon} />
                  {"  "}
                  {format12time(bus.arrivalTime)}
                </Text>
                <Text style={styles.stops}>Stops: {bus.route.stops?.length || 0}</Text>

                {/* Book Button */}
                <TouchableOpacity style={styles.bookButton} onPress={() => handleBookTicket(bus._id)}>
                  <Text style={styles.bookButtonText}>Book my Ticket</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text>No buses found</Text>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "white" },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  picker: { height: 60, borderColor: "#ccc", borderWidth: 1, marginBottom: 15, borderRadius: 5 },
  loader: { marginTop: 20 },
  results: { marginTop: 20 },
  busCard: { padding: 20, marginBottom: 15, borderRadius: 10, backgroundColor: "#fff" },
  bookButton: { backgroundColor: "#28a745", paddingVertical: 10, borderRadius: 5, alignItems: "center" },
  bookButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});

export default BookingForm;
