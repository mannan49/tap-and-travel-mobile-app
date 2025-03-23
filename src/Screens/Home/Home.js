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
      // console.log("Fetched Buses:", filteredData);
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
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,             // Increased top padding for space
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2C3E50',
    marginBottom: 40,           // Extra space below title
  },
  picker: {
    height: 56,
    borderColor: '#BDC3C7',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 24,
    paddingHorizontal: 12,
    backgroundColor: '#F8F9FA',
  },
  loader: {
    marginTop: 40,
  },
  results: {
    marginTop: 40,
  },
  busCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 24,
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderColor: '#ECECEC',
    borderWidth: 1,
  },
  bookButton: {
    backgroundColor: '#3498DB',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});


export default BookingForm;
