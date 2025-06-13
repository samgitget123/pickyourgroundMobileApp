import React, { useEffect, useState } from "react";
import * as Sharing from 'expo-sharing';
import {
  View,
  FlatList,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  Text,
  Button,
  TextInput,
  Card,
} from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as FileSystem from "expo-file-system";
import { useApi } from "../src/contexts/ApiContext";

const DashboardScreen = () => {
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState({ groundId: "", bookingId: "", userName: "" });
  const [page, setPage] = useState(0);
  const itemsPerPage = 5;
  const { BASE_URL } = useApi();

  useEffect(() => {
    fetchBookings();
  }, [date]);

  const fetchBookings = async () => {
    try {
      const formattedDate = date.toISOString().split("T")[0];
      const response = await fetch(
        `${BASE_URL}/booking/getallbooking?user_id=5621f3e5-9419-4ae5-816f-d04dea908af7`
      );
      const result = await response.json();
      const data = result?.data || [];

      const filteredByDate = data.filter((item) =>
        item.date?.startsWith(formattedDate)
      );

      setBookings(filteredByDate);
      setFiltered(filteredByDate);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  };

  const handleSearch = () => {
    const { groundId, bookingId, userName } = search;

    const result = bookings.filter((item) =>
      item.ground_id?.toLowerCase().includes(groundId.toLowerCase()) &&
      item.book?.booking_id?.toLowerCase().includes(bookingId.toLowerCase()) &&
      item.name?.toLowerCase().includes(userName.toLowerCase())
    );

    setFiltered(result);
    setPage(0);
  };

  useEffect(() => {
    const { groundId, bookingId, userName } = search;
    if (!groundId && !bookingId && !userName) {
      setFiltered(bookings);
    }
  }, [search]);

  const handleDownload = async () => {
    try {
      const startStr = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split("T")[0];
      const endStr = new Date(date).toISOString().split("T")[0];

      const filteredByRange = bookings.filter(b => {
        const bookingDateStr = b.date?.split("T")[0];
        return bookingDateStr >= startStr && bookingDateStr <= endStr;
      });

      if (filteredByRange.length === 0) {
        alert("No bookings available for selected month.");
        return;
      }

      const header = "Ground ID,Booking ID,User Name,Date,Slots,Mobile,Advance,Amount,Status";
      const rows = filteredByRange.map(b =>
        `${b.ground_id},${b.book?.booking_id},${b.name},${b.date},${b.slots?.join("-")},${b.mobile},${b.prepaid},${b.book?.price},${b.paymentStatus}`
      );
      const totalAmount = filteredByRange.reduce(
        (sum, b) => sum + (Number(b.book?.price) || 0), 0
      );
      const totalRow = `,,,,,,Total Amount,${totalAmount}`;
      const csvString = [header, ...rows, totalRow].join("\n");
      const filename = `bookings_${startStr}_to_${endStr}.csv`;
      const fileUri = FileSystem.documentDirectory + filename;

      await FileSystem.writeAsStringAsync(fileUri, csvString, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        alert(`File saved to: ${fileUri}`);
      }
    } catch (error) {
      alert("Download failed. Please try again.");
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.rowItem}>
      <Text style={styles.cell} numberOfLines={1} ellipsizeMode="tail">{item.book?.booking_id}</Text>
      <Text style={styles.cell} numberOfLines={1} ellipsizeMode="tail">{item.name}</Text>
      <Text style={styles.cell} numberOfLines={1} ellipsizeMode="tail">{item.mobile}</Text>
      <Text style={styles.cell} numberOfLines={1} ellipsizeMode="tail">{item.prepaid}</Text>
      <Text style={styles.cell} numberOfLines={1} ellipsizeMode="tail">{item.book?.price}</Text>
      <Text style={styles.cell} numberOfLines={1} ellipsizeMode="tail">{item.date}</Text>
      <Text style={styles.cell} numberOfLines={1} ellipsizeMode="tail">
        {formatSelectedSlotsDuration(item.slots.map(slot => ({ slot })))}
      </Text>
      <Text style={styles.cell} numberOfLines={1} ellipsizeMode="tail">{item.paymentStatus}</Text>
    </View>
  );

  const formatSelectedSlotsDuration = (slots) => {
    if (!slots || slots.length === 0) return "";

    const sortedSlots = [...slots].sort((a, b) => parseFloat(a.slot) - parseFloat(b.slot));
    const startSlot = parseFloat(sortedSlots[0].slot);
    const endSlot = parseFloat(sortedSlots[sortedSlots.length - 1].slot) + 0.5;

    const formatTime = (floatVal) => {
      const totalMinutes = floatVal * 60;
      const hour = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      const isPM = hour >= 12;
      const displayHour = hour % 12 === 0 ? 12 : hour % 12;
      const ampm = isPM ? "PM" : "AM";
      const minStr = minutes === 0 ? "00" : "30";
      return `${displayHour}:${minStr} ${ampm}`;
    };

    return `${formatTime(startSlot)} - ${formatTime(endSlot)}`;
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <Text variant="titleLarge" style={styles.header}>Booking Dashboard</Text>

          {/* Date Picker */}
          <View style={styles.dateRow}>
            {/* <Button mode="outlined" onPress={() => setShowDatePicker(true)}>
              {date.toDateString()}
            </Button> */}
            {/* {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={(e, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) setDate(selectedDate);
                }}
              />
            )} */}
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={(e, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setDate(selectedDate);
              }}
            />
          </View>

          {/* Search Filters */}
          <View style={styles.filterContainer}>
            <TextInput
              label="Booking ID"
              mode="outlined"
              style={styles.input}
              value={search.bookingId}
              onChangeText={(text) => setSearch((prev) => ({ ...prev, bookingId: text }))}
            />
            <TextInput
              label="Name"
              mode="outlined"
              style={styles.input}
              value={search.userName}
              onChangeText={(text) => setSearch((prev) => ({ ...prev, userName: text }))}
            />
            <Button icon="magnify" mode="contained" style={styles.searchButton} onPress={handleSearch}>
              Search
            </Button>
          </View>

          {/* Table Section */}
          <Card style={styles.tableCard}>
            <ScrollView horizontal>
              <View>
                <View style={styles.tableHeader}>
                  <Text style={styles.cell}>Booking ID</Text>
                  <Text style={styles.cell}>Name</Text>
                  <Text style={styles.cell}>Mobile</Text>
                  <Text style={styles.cell}>Advance</Text>
                  <Text style={styles.cell}>Amount</Text>
                  <Text style={styles.cell}>Date</Text>
                  <Text style={styles.cell}>Time</Text>
                  <Text style={styles.cell}>Status</Text>
                </View>
                <FlatList
                  data={filtered.slice(page * itemsPerPage, (page + 1) * itemsPerPage)}
                  renderItem={renderItem}
                  keyExtractor={(item) => item.book?.booking_id || item._id}
               
  
                />
                <View style={styles.paginationRow}>
                  <Button mode="outlined" disabled={page === 0} onPress={() => setPage(page - 1)}>
                    Previous
                  </Button>
                  <Text style={styles.pageInfo}>
                    Page {page + 1} of {Math.ceil(filtered.length / itemsPerPage)}
                  </Text>
                  <Button
                    mode="outlined"
                    disabled={(page + 1) * itemsPerPage >= filtered.length}
                    onPress={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </View>
              </View>
            </ScrollView>
          </Card>

          <Button mode="contained" style={styles.download} onPress={handleDownload}>
            Download CSV
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: { padding: 16 },
  container: { flex: 1, gap: 12 },
  header: { fontWeight: "bold", fontSize: 22, marginBottom: 12 },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  filterContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  input: { flexGrow: 1, minWidth: 150 },
  searchButton: { alignSelf: "flex-start" },
  tableCard: {
    marginTop: 12,
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#fff",
    elevation: 2,
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 10,
    backgroundColor: "#f0f0f0",
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  rowItem: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
  cell: {
    width: 120,
    paddingHorizontal: 8,
    fontSize: 14,
    overflow: "hidden",
  },
  paginationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  pageInfo: { fontSize: 14 },
  download: { marginTop: 20 },
});

export default DashboardScreen;
