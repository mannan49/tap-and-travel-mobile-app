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
import AppSelect from "../../Components/AppSelect";
import AppDatePicker from "../../Components/AppDatePicker";
import AppButton from "../../Components/Button";

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

  const onDateChange = (selectedDate) => {
    if (!selectedDate) return;

    const formattedDate = new Date(selectedDate).toISOString().split("T")[0];

    setFormData({ ...formData, date: formattedDate });
    console.log("Selected Date:", formattedDate);
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
      const busDate = bus.date
        ? new Date(bus.date).toISOString().split("T")[0]
        : null;

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

      <AppSelect
        selectedValue={formData.fromCity}
        items={cities.map((city) => ({ label: city, value: city }))}
        onValueChange={(itemValue) => handleInputChange("fromCity", itemValue)}
        value={formData.fromCity}
        placeholder="Select From City"
      />
      <AppSelect
        selectedValue={formData.toCity}
        items={cities.map((city) => ({ label: city, value: city }))}
        onValueChange={(itemValue) => handleInputChange("toCity", itemValue)}
        placeholder="Select To City"
        value={formData.toCity}
      />

      <AppDatePicker
        value={formData.date}
        onChange={onDateChange}
        placeholder="Select date"
        variant="primary"
        borderRadius={12}
      />

      {/* Submit Button */}
      <AppButton text="Search"
        onPress={handleSubmit}
        variant="secondary" />

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
                  <Text style={styles.cityText}>{bus.route.startCity} </Text>
                  <Icon
                    name="arrow-right"
                    size={18}
                    color="black"
                    style={styles.arrowIcon}
                  />
                  <Text style={styles.cityText}>{bus.route.endCity}</Text>
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
                <AppButton text="Book my Ticket" variant="secondary" onPress={() => handleBookTicket(bus._id)} />
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
    paddingHorizontal: 20,
    paddingTop: 40,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#2C3E50",
    marginBottom: 30,
  },
  picker: {
    height: 50,
    borderColor: "#BDC3C7",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 10,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
  },
  input: {
    height: 50,
    borderColor: "#BDC3C7",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    justifyContent: "center",
    backgroundColor: "#F8F9FA",
    marginBottom: 20,
  },
  dateText: {
    fontSize: 16,
    color: "#34495E",
  },
  searchButton: {
    backgroundColor: "#3498DB",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 30,
    elevation: 2,
  },
  searchButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  loader: {
    marginTop: 20,
  },
  results: {
    marginTop: 20,
  },
  busCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    marginBottom: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderColor: "#ECECEC",
    borderWidth: 1,
  },
  busCompany: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 10,
  },
  routeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  cityText: {
    fontSize: 16,
    color: "#34495E",
  },
  arrowIcon: {
    marginHorizontal: 8,
  },
  price: {
    fontSize: 16,
    color: "#27AE60",
    fontWeight: "600",
    marginBottom: 6,
  },
  dateTime: {
    fontSize: 14,
    color: "#7F8C8D",
    marginBottom: 4,
  },
  stops: {
    fontSize: 14,
    color: "#7F8C8D",
    marginBottom: 12,
  },
  bookButton: {
    backgroundColor: "#3498DB",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    elevation: 2,
  },
  bookButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default BookingForm;
