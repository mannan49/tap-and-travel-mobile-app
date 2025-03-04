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
import { apiBaseUrl } from "../../config/urls";
import { format12time, formatDate } from "../../utils/helperFunction";
import Icon from "react-native-vector-icons/FontAwesome";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native"; // Import the useNavigation hook
import { useSelector } from "react-redux";
import BusesList from "../../Components/BusesList";

const BookingForm = () => {
  const navigation = useNavigation(); // Initialize navigation
  const [hasSearched, setHasSearched] = useState(false);
  const [filteredBuses, setFilteredBuses] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    console.log("Buses in use Effect", buses);
  }, []);

  console.log("Buses outside Effect", buses);
  const [formData, setFormData] = useState({
    fromCity: "",
    toCity: "",
    date: "",
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedBusId, setSelectedBusId] = useState(null);
  const buses = useSelector((state) => state.buses.data);
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
    const selectedDate = date
      ? new Date(date).toISOString().split("T")[0]
      : null;

    if (!selectedDate) {
      console.error("Invalid date selected");
      return;
    }

    const results = buses.filter((bus) => {
      const busStartCity = bus.route.startCity.trim().toLowerCase();
      const busEndCity = bus.route.endCity.trim().toLowerCase();
      const selectedFromCity = fromCity.trim().toLowerCase();
      const selectedToCity = toCity.trim().toLowerCase();

      const citiesMatch =
        busStartCity === selectedFromCity && busEndCity === selectedToCity;

      const busDate = bus.date
        ? new Date(bus.date).toISOString().split("T")[0]
        : null;
      if (!busDate) {
        console.error("Invalid bus date:", bus.date);
        return false;
      }

      const dateMatch = busDate === selectedDate;

      return citiesMatch && dateMatch;
    });

    setFilteredBuses(results);
    setLoading(false);
  };

  const handleSubmit = () => {
    setLoading(true);
    setHasSearched(true);
    filterBuses();
  };

  // Navigation to Ticket page when button is pressed
  const handleBookTicket = () => {
    setSelectedBusId(busId._id); // Store the selected bus ID
    navigation.navigate("BookTicket", { busId }); // Navigate to the 'Ticket' screen
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

      {/* Date Input (Touchable for date picker) */}
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.dateText}>{formData.date || "Select Date"}</Text>
      </TouchableOpacity>

      {/* Date Picker Popup */}
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

      <BusesList />

      {/* Loading Indicator */}
      {loading && (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
      )}

      {/* Show filtered buses if search is done */}
      {hasSearched && (
        <View style={styles.results}>
          {filteredBuses.length > 0 ? (
            filteredBuses.map((bus, index) => (
              <View key={index} style={styles.busCard}>
                <Text style={styles.busCompany}>{bus.adminName}</Text>
                <View style={styles.routeContainer}>
                  <Text style={styles.cityText}>
                    {bus.route.startCity}
                    {"   "}
                  </Text>
                  <Icon
                    name="arrow-right"
                    size={18}
                    color="black"
                    style={styles.arrowIcon}
                  />
                  <Text style={styles.cityText}>
                    {"   "}
                    {bus.route.endCity}
                  </Text>
                </View>

                <Text style={styles.price}>
                  Only in Rs. {bus.fare.actualPrice}
                </Text>
                <Text style={styles.dateTime}>
                  {formatDate(bus.date)} {bus.time}
                </Text>
                <Text style={styles.dateTime}>
                  {format12time(bus.departureTime)}
                  {"  "}
                  <Icon
                    name="arrow-right"
                    size={18}
                    color="black"
                    style={styles.arrowIcon}
                  />
                  {"  "}
                  {format12time(bus.arrivalTime)}
                </Text>
                <Text style={styles.stops}>
                  Stops: {bus.route.stops?.length || 0}
                </Text>

                {/* Book Button */}
                <TouchableOpacity
                  style={styles.bookButton}
                  onPress={handleBookTicket(bus._id)}
                >
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

// Styles for the form
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "white",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    height: 60,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 15,
    paddingLeft: 10,
    borderRadius: 5,
  },
  picker: {
    height: 60,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 15,
    borderRadius: 5,
    paddingLeft: 10,
  },
  dateText: {
    fontSize: 16,
    paddingVertical: 10,
    color: "#555",
  },
  loader: {
    marginTop: 20,
  },
  results: {
    marginTop: 20,
  },
  busCard: {
    padding: 20,
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  busCompany: {
    fontSize: 18,
    fontWeight: "bold",
  },
  routeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  cityText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#555",
  },
  arrowIcon: {
    marginHorizontal: 10,
  },
  price: {
    fontSize: 16,
    color: "green",
    textAlign: "center",
    marginBottom: 5,
  },
  dateTime: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    marginBottom: 5,
  },
  stops: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    marginBottom: 10,
  },
  bookButton: {
    backgroundColor: "#28a745",
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  bookButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default BookingForm;
