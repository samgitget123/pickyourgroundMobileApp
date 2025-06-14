import React, { useEffect, useState } from "react";
// import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import {
  View,
  FlatList,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal
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
  //View booking
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const itemsPerPage = 5;
  const { BASE_URL } = useApi();
  console.log(filtered, '--------------------filtered-----------------')
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
      // console.log(data, 'boooking data')
      const filteredByDate = data.filter((item) =>
        item.date?.startsWith(formattedDate)
      );

      setBookings(data);
      setFiltered(filteredByDate);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  };

  const handleSearch = () => {
    const { groundId, bookingId, userName } = search;

    // Check if all fields are empty
    const isSearchEmpty = !groundId && !bookingId && !userName;

    if (isSearchEmpty) {
      // Show bookings only for selected date
      const formattedDate = date.toISOString().split("T")[0];
      const filteredByDate = bookings.filter((item) =>
        item.date?.startsWith(formattedDate)
      );
      setFiltered(filteredByDate);
      setPage(0);
      return;
    }

    const result = bookings.filter((item) =>
      item.ground_id?.toLowerCase().includes(groundId.toLowerCase()) &&
      item.book?.booking_id?.toLowerCase().includes(bookingId.toLowerCase()) &&
      item.name?.toLowerCase().includes(userName.toLowerCase())
    );

    setFiltered(result);
    setPage(0);
  };
  useEffect(() => {
    handleSearch();
  }, [search]);


  const handleDownload = async () => {
    try {
      // Convert to YYYY-MM-DD string format
      const startStr = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split("T")[0];
      const endStr = new Date(date).toISOString().split("T")[0];

      // Filter bookings between start of month and selected date
      const filteredByRange = bookings.filter(b => {
        const bookingDateStr = b.date?.split("T")[0]; // handles ISO string
        return bookingDateStr >= startStr && bookingDateStr <= endStr;
      });

      if (filteredByRange.length === 0) {
        alert("No bookings available for selected month.");
        return;
      }

      // Generate CSV data
      const header = "Ground ID,Booking ID,User Name,Date,Slots,Mobile,Advance,Amount,Status";

      const rows = filteredByRange.map(b =>
        `${b.ground_id},${b.book?.booking_id},${b.name},${b.date},${b.slots?.join("-")},${b.mobile},${b.prepaid},${b.book?.price},${b.paymentStatus}`
      );

      // Calculate total amount (fallback to 0 if undefined)
      const totalAmount = filteredByRange.reduce(
        (sum, b) => sum + (Number(b.book?.price) || 0),
        0
      );

      // Append total amount as a new row (you can format this as you prefer)
      const totalRow = `,,,,,,Total Amount,${totalAmount}`;

      // Combine all into CSV string
      const csvString = [header, ...rows, totalRow].join("\n");

      // File path and name
      const filename = `bookings_${startStr}_to_${endStr}.csv`;
      const fileUri = FileSystem.documentDirectory + filename;

      // Write and share
      await FileSystem.writeAsStringAsync(fileUri, csvString, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        alert(`File saved to: ${fileUri}`);
      }

      alert(`Download complete:\n${fileUri}`);
    } catch (error) {
      // console.error("Error downloading file:", error);
      alert("Download failed. Please try again.");
    }
  };

  const bookingdetails = (details) => {
    console.log(details, '-------------view details-----------');
  }
  const renderItem = ({ item }) => (
    <View style={styles.rowItem}>
      <Text style={styles.cell} numberOfLines={1} ellipsizeMode="tail">{item.book?.booking_id}</Text>
      <Text style={styles.cell} numberOfLines={1} ellipsizeMode="tail">{item.name}</Text>
      <Text style={styles.cell} numberOfLines={1} ellipsizeMode="tail">{item.mobile}</Text>
      <Text style={styles.cell} numberOfLines={1} ellipsizeMode="tail">{item.prepaid}</Text>
      <Text style={styles.cell} numberOfLines={1} ellipsizeMode="tail">{item.book?.price}</Text>
      <Text style={styles.cell} numberOfLines={1} ellipsizeMode="tail">{item.date}</Text>
      <Text style={styles.cell} numberOfLines={1} ellipsizeMode="tail">{formatSelectedSlotsDuration(item.slots.map(slot => ({ slot })))}</Text>
      <Text style={styles.cell} numberOfLines={1} ellipsizeMode="tail">{item.paymentStatus}</Text>
      <Text
        style={[styles.cell, { color: 'blue', textDecorationLine: 'underline' }]}
        onPress={() => {
          setSelectedBooking(item);
          setModalVisible(true);
        }}>View</Text>
    </View>
  );


  //  bookingDetails?.data[0]?.slots?.map(slot => ({ slot }))
  const formatSelectedSlotsDuration = (slots) => {
    if (!slots || slots.length === 0) return "";

    // Sort slots by start time
    const sortedSlots = [...slots].sort((a, b) => parseFloat(a.slot) - parseFloat(b.slot));

    const startSlot = parseFloat(sortedSlots[0].slot);
    const endSlot = parseFloat(sortedSlots[sortedSlots.length - 1].slot) + 0.5; // each slot is 0.5 hr

    // Format time for start and end slot
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

    // Calculate total duration in minutes
    const totalDurationMins = (endSlot - startSlot) * 60;
    const hours = Math.floor(totalDurationMins / 60);
    const minutes = totalDurationMins % 60;

    // Format duration string, e.g., "2 hours 0 minutes"
    let durationStr = "";
    if (hours > 0) durationStr += `${hours} hour${hours > 1 ? "s" : ""}`;
    if (minutes > 0) durationStr += ` ${minutes} minutes`;
    // return `${formatTime(startSlot)} - ${formatTime(endSlot)} (${durationStr.trim()})`;
    return `${formatTime(startSlot)} - ${formatTime(endSlot)}`;
  };
  const renderEmptyComponent = () => (
    <View style={{ padding: 16, alignItems: 'center' }}>
      <Text>No data found</Text>
    </View>
  );
    useEffect(() => {
getSummary();
  }, []);

  const getSummary = () => {
    if (!date) {
      return { totalSlots: 0, totalAmount: 0, monthlyAmount: 0 };
    }

    const selectedDateStr = date.toISOString().split("T")[0];

    // Get first and last day of the selected month
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    lastDayOfMonth.setHours(23, 59, 59, 999);
    // Filter bookings for the selected date
    const selectedDateBookings = bookings.filter(booking => booking.date.split("T")[0] === selectedDateStr);

    // Filter bookings for the entire month
    const monthlyBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.date);
      return bookingDate >= firstDayOfMonth && bookingDate <= lastDayOfMonth;
    });

    // Calculate totals
    const totalSlots = selectedDateBookings.reduce((total, booking) => total + booking?.slots.length, 0);
    const totalAmount = selectedDateBookings.reduce((total, booking) => total + (booking.book ? booking.book.price : 0), 0);
    const monthlyAmount = monthlyBookings.reduce((total, booking) => total + (booking.book ? booking.book.price : 0), 0);

    return { totalSlots, totalAmount, monthlyAmount };
  };

  // Get the updated summary
  const { totalSlots, totalAmount, monthlyAmount } = getSummary();
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
         
          <Text variant="titleLarge" style={styles.header}>Dashboard </Text>

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
            {/* <TextInput
              label="Ground ID"
              mode="outlined"
              style={styles.input}
              value={search.groundId}
              onChangeText={(text) => setSearch((prev) => ({ ...prev, groundId: text }))}
            /> */}
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
            {/* <Button icon="magnify" mode="contained" style={styles.searchButton} onPress={handleSearch}>
              Search
            </Button> */}
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
                  <Text style={styles.cell}>View</Text>
                </View>
                <FlatList
                  data={filtered.slice(page * itemsPerPage, (page + 1) * itemsPerPage)}
                  renderItem={renderItem}
                  keyExtractor={(item) => item.book?.booking_id || item._id} />
                ListEmptyComponent={renderEmptyComponent}
                <View style={styles.paginationRow}>
                  <Button
                    mode="outlined"
                    disabled={page === 0}
                    onPress={() => setPage(page - 1)}
                  >
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
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statText}>
                Today's Slots: <Text style={styles.statStrong}>{totalSlots}</Text>
              </Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statText}>
                Today Amount: <Text style={styles.statStrong}>₹{totalAmount}</Text>
              </Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statText}>
                Monthly Amount: <Text style={styles.statStrong}>₹{monthlyAmount}</Text>
              </Text>

            </View>
            <View>
              <Text style={styles.noteText}>
                Note: Monthly amount is consolidated from the 1st to the last day of the selected month.
              </Text>
            </View>
          </View>

          <Button mode="contained" style={styles.closeButton}
            onPress={handleDownload}>
            Download CSV
          </Button>
          <Text style={styles.noteText}>
            Note: Downloads data from the 1st of the selected month to the selected date.
          </Text>
          {/* <Button mode="contained" onPress={handleDownloadToXLSX}>
            Download Excel
          </Button> */}

        </View>
        {/* ////////////////////Modal for view booking//////////////// */}
        {/* <Modal
  visible={modalVisible}
  transparent={true}
  animationType="slide"
  onRequestClose={() => setModalVisible(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Booking Details</Text>

      {selectedBooking && (
        <>
          <Text>Booking ID: {selectedBooking.book?.booking_id}</Text>
          <Text>Name: {selectedBooking.name}</Text>
          <Text>Mobile: {selectedBooking.mobile}</Text>
          <Text>Amount: ₹{selectedBooking.book?.price}</Text>
          <Text>Date: {selectedBooking.date}</Text>
          <Text>Slots: {formatSelectedSlotsDuration(selectedBooking.slots.map(slot => ({ slot })))}</Text>
          <Text>Payment Status: {selectedBooking.paymentStatus}</Text>
        </>
      )}
    <Button
                          mode="contained"
                          style={{ marginTop: 10, marginLeft: 10, backgroundColor: '#006849' }}
                          onPress={() => setModalVisible(false)}
                        >
                          Close
                        </Button>
     
    </View>
  </View>
</Modal> */}
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>📋 Booking Details</Text>

              {selectedBooking ? (
                <ScrollView>
                  <View style={styles.detailRow}>
                    <Text style={styles.label}>Booking ID:</Text>
                    <Text style={styles.value}>{selectedBooking.book?.booking_id}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.label}>Name:</Text>
                    <Text style={styles.value}>{selectedBooking.name}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.label}>Mobile:</Text>
                    <Text style={styles.value}>{selectedBooking.mobile}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.label}>Amount:</Text>
                    <Text style={styles.value}>₹{selectedBooking.book?.price}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.label}>Date:</Text>
                    <Text style={styles.value}>{selectedBooking.date}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.label}>Slots:</Text>
                    <Text style={styles.value}>{formatSelectedSlotsDuration(selectedBooking.slots.map(slot => ({ slot })))}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.label}>Payment Status:</Text>
                    <Text style={styles.value}>{selectedBooking.paymentStatus}</Text>
                  </View>
                </ScrollView>
              ) : (
                <Text style={{ color: '#777', marginVertical: 20 }}>No data found</Text>
              )}

              <Button
                mode="contained"
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                Close
              </Button>
            </View>
          </View>
        </Modal>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 16,
  },
  container: {
    flex: 1,
    gap: 12,
  },
  header: {
    fontWeight: "bold",
    fontSize: 22,
    marginBottom: 12,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  filterContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  input: {
    flexGrow: 1,
    minWidth: 150,
  },
  searchButton: {
    alignSelf: "flex-start",

  },
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
    width: 120,               // Fixed width for consistency
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
  pageInfo: {
    fontSize: 14,
  },
  download: {
    marginTop: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 10,
  },

  statBox: {
    marginHorizontal: 12,
    marginTop: 8,
  },

  statText: {
    fontSize: 14,
  },

  statStrong: {
    fontWeight: 'bold',
  },

  noteText: {
    fontSize: 12,
    color: 'gray',
    fontStyle: 'italic',
    marginTop: 4,
  },
  /////css for modal view booking////////
  // modalOverlay: {
  //   flex: 1,
  //   backgroundColor: 'rgba(0,0,0,0.5)',
  //   justifyContent: 'center',
  //   alignItems: 'center',
  // },
  // modalContent: {
  //   width: '90%',
  //   backgroundColor: 'white',
  //   padding: 20,
  //   borderRadius: 10,
  //   elevation: 5,
  // },
  // modalTitle: {
  //   fontSize: 18,
  //   fontWeight: 'bold',
  //   marginBottom: 10,
  // },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    elevation: 10,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#006849',
    marginBottom: 15,
    textAlign: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 5,
  },
  label: {
    fontWeight: '600',
    color: '#333',
    fontSize: 14,
  },
  value: {
    fontWeight: '400',
    color: '#555',
    fontSize: 14,
    textAlign: 'right',
    maxWidth: '60%',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#006849',
  },


});

export default DashboardScreen;
