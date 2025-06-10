import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Modal,
  Image,
  TextInput,
  Alert,
  KeyboardAvoidingView
} from 'react-native';
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Groundslots } from '../Helpers/GroundslotSchedules';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useApi } from '../src/contexts/ApiContext';
import ConvertSlotToTimeRange from '../Helpers/ConvertSlotToTimeRange';
import AsyncStorage from '@react-native-async-storage/async-storage';
export default function GroundSlots({ route }) {
  const navigation = useNavigation();
  const { BASE_URL } = useApi();
  const { grounds } = route.params;
  console.log(grounds[0].ground_id, 'ground details in Hroundslots screen')
  //dummy booked slots
 // const bookedSlotIds = ["5", "10", "23", "35", "25", "26", "27", "28", "29", "30"];

  //usestates
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [name, setName] = useState(""); // State for Name
  const [email, setEmail] = useState(""); // State for Email
  const [mobile, setMobile] = useState(""); // State for Mobile
  const [price, setPrice] = useState('');
  const [prepaid, setPrepaid] = useState("");  // Prepaid Amount
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [cartVisible, setCartVisible] = useState(false);
  const remainingAmount = Number(price) - Number(prepaid || 0);
  const [groundData, setGroundData] = useState([]);

  //////it will triggere whenever we click on refresh icon
  const fetchGroundDetailsagain = async () => {
    try {
      // Convert selectedDate to 'YYYY-MM-DD' format string
      let formattedDate = "";
      const gid = grounds[0].ground_id;

      if (selectedDate instanceof Date) {
        // If selectedDate is a Date object
        formattedDate = selectedDate.toISOString().slice(0, 10);
      } else if (typeof selectedDate === "string") {
        // If it's a string (like ISO string), slice first 10 chars
        formattedDate = selectedDate.slice(0, 10);
      } else {
        throw new Error("selectedDate is not a valid Date or string");
      }

      console.log("---------------formattedDate---------------", formattedDate);

      const res = await fetch(`${BASE_URL}/ground/${gid}?date=${formattedDate}`);
      console.log(res, "API response");

      if (!res.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await res.json();
      console.log("Booked Slots:", data.slots.booked);

      setGroundData(data);
    } catch (error) {
      console.error("❌ Error fetching ground details:", error);
    }
  };
  useEffect(() => {
    const fetchGroundDetails = async () => {
      try {
        // Convert selectedDate to 'YYYY-MM-DD' format string
        let formattedDate = "";

        if (selectedDate instanceof Date) {
          // If selectedDate is a Date object
          formattedDate = selectedDate.toISOString().slice(0, 10);
        } else if (typeof selectedDate === "string") {
          // If it's a string (like ISO string), slice first 10 chars
          formattedDate = selectedDate.slice(0, 10);
        } else {
          throw new Error("selectedDate is not a valid Date or string");
        }

        //console.log("Formatted Date for API:", formattedDate);

        const res = await fetch(`${BASE_URL}/ground/${grounds[0]?.ground_id}?date=${formattedDate}`);
        console.log(grounds[0].ground_id, 'gid');
        console.log(res, "API response");

        if (!res.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await res.json();
        console.log("Booked Slots:", data.slots.booked);

        setGroundData(data);
      } catch (error) {
        console.error("❌ Error fetching ground details:", error);
      }
    };
    console.log(groundData, 'grounddata')
    if (selectedDate) {
      fetchGroundDetails();
    }
  }, [selectedDate]);

  const formatSlot = (slot) => {
    return slot; // Example: return formatted slot
  };
  const bookedslotsbydate = groundData?.slots?.booked?.map(formatSlot) || [];
  console.log(bookedslotsbydate, 'bookedslotsbydate')
  //  const availableSlots = groundData.filter((slot) => !bookedslotsbydate.includes(slot.slot)) .map((slot) => slot.slot);

  const formatTime = (floatVal) => {
    const totalMinutes = parseFloat(floatVal) * 60;
    const hour = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const isPM = hour >= 12;
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    const ampm = isPM ? 'PM' : 'AM';
    const minStr = minutes === 0 ? '00' : '30';
    return `${displayHour}:${minStr} ${ampm}`;
  };

  //this function gives time as 12:00-12:30
  const getSlotTimeRange = (slotValue) => {
    const start = parseFloat(slotValue);
    const end = start + 0.5;
    return `${formatTime(start)} - ${formatTime(end === 24 ? 0 : end)}`;
  };


  //this function check today date is true or false
  const isToday = (date) => {
    const now = new Date();
    // Convert both to local date only (ignore time part)
    const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const localNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return localDate.getTime() === localNow.getTime();
  };


  //it gives current time
  const getCurrentFloatTime = () => {
    const now = new Date();
    const hour = now.getHours();
    const minutes = now.getMinutes();
    if (minutes === 0) return hour;
    if (minutes <= 30) return hour + 0.5;
    return hour + 1;
  };

  //it converting time to as string
  const getFloatTimeFromSlotString = (slotString) => parseFloat(slotString);

  //Here we filtering the available slots
  const filteredAvailableSlots = Groundslots.filter(slot => {
    const slotTime = parseFloat(slot.slot);
  //  const isBooked = bookedSlotIds.includes(slot.id);
    // if (isBooked) return false;
    if (isToday(selectedDate)) {
      return slotTime >= getCurrentFloatTime();
    }
    return true;
  });

  //Here filtering the booked slots
  // const filteredBookedSlots = Groundslots.filter(slot => {
  //   return bookedSlotIds.includes(slot.id);
  // });

  //Omchange date function
  const onChangeDate = (event, date) => {
    setShowPicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
      setSelectedSlots([]); // Clear selected slots when date changes
    }
  };

  //Handle slot function , when user click on slot it will trigger out
  const handleSlotSelect = (slot) => {
    const slotVal = parseFloat(slot.slot);
    const isSelected = selectedSlots.some(s => s.slot === slot.slot);

    if (isSelected) {
      setSelectedSlots(prev => prev.filter(s => s.slot !== slot.slot));
      return;
    }

    if (selectedSlots.length === 0) {
      setSelectedSlots([slot]);
      return;
    }

    const sortedValues = selectedSlots.map(s => parseFloat(s.slot)).sort((a, b) => a - b);
    const min = sortedValues[0];
    const max = sortedValues[sortedValues.length - 1];

    if (slotVal === min - 0.5 || slotVal === max + 0.5) {
      setSelectedSlots([...selectedSlots, slot]);
    } else {
      alert('⚠️ Please select slots in sequential order.');
    }
  };



  //it will check the past slots
  // const isPastSlot = (slot) => {
  //   const slotTime = getFloatTimeFromSlotString(slot.slot);
  //   // console.log(slotTime, 'slotTime')
  //   return isToday(selectedDate) && slotTime < getCurrentFloatTime();
  // };

const isPastSlot = (slot) => {
  const now = new Date();

  const slotHour = Math.floor(parseFloat(slot.slot));
  const slotMinute = (parseFloat(slot.slot) % 1) * 60;

  const slotTime = new Date(selectedDate);
  slotTime.setHours(slotHour, slotMinute, 0, 0);

  return slotTime < now;
};


  //It return the selected slots duration
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

    return `${formatTime(startSlot)} - ${formatTime(endSlot)} (${durationStr.trim()})`;
  };
  //handleBooking
  const handleBooking = async (gid, selectSlots, selectDate) => {
    if (selectedSlots.length === 0 || !name || !mobile) {
      alert('Please fill all required fields and select slots.');
      return;
    }
    const storedUser = await AsyncStorage.getItem('userData');
    const user = storedUser ? JSON.parse(storedUser) : null;
    const user_id = user.user.id;
    formattedDate = selectDate.toISOString().slice(0, 10);
    const payload = {
      ground_id: gid,              // replace with your actual ground id variable
      slots: selectSlots.map(s => s.slot),
      date: formattedDate,
      name: name,
      // email: userEmail || "",
      mobile: mobile.replace(/\D/g, ''),
      comboPack: false,
      price: price,
      user_id: user_id || "",
    };
    console.log(payload, 'payload')
    try {
      const response = await fetch(`${BASE_URL}/booking/book-slot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log(data)
      if (response.ok) {
        alert('✅ Booking successful! Your slots have been reserved.');
        setCartVisible(false);
        // navigation.navigate('Slots');

        // Reset form and selection if needed
        setSelectedSlots([]);
        setName('');
        setMobile('');
        setPrice('');
        setPrepaid('');
        setPaymentStatus('pending');
      } else {
        alert('Booking failed: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.log(error);
      alert('Error booking slots: ' + error.message);
    }
  };
const checkIfAnyPastSlot = () => {
  return selectedSlots.some(slot => isPastSlot(slot));
};

const handleCartPress = () => {
  if (checkIfAnyPastSlot()) {
    Alert.alert(
      "⚠️ Past Slot Booking",
      "Some selected slots are in the past. Are you sure you want to continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Proceed",
          onPress: () => setCartVisible(true)
        }
      ]
    );
  } else {
    setCartVisible(true);
  }
};


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button mode="text" onPress={() => navigation.goBack()}>
          ← Back
        </Button>
      </View>
      <View style={styles.dateRow}>

        <View style={styles.datepickerfield}>
          {(
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={onChangeDate}
            />
          )}
          <TouchableOpacity onPress={() => setShowPicker(true)}>
            <Text style={styles.dateText}>Selected Date: {selectedDate.toDateString()}</Text>
          </TouchableOpacity>
        </View>
        <View>
          <TouchableOpacity onPress={fetchGroundDetailsagain} style={styles.refreshButton}>
            <Icon name="refresh" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.column}>
          <Text style={styles.subtitle}>Available</Text>
          <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
            {filteredAvailableSlots.length ? (
              filteredAvailableSlots
                .filter(slot => !bookedslotsbydate.includes(slot.slot)) // Exclude booked
                .map((slot) => {
                  const timeRange = getSlotTimeRange(slot.slot);
                  const isSelected = selectedSlots.some(s => s.slot === slot.slot); // ✅ Fix here

                  return (
                    <View key={slot.slot} style={styles.slotWrapper}>
                      <Button
                        mode="contained"
                        style={[
                          isSelected
    ? { backgroundColor: '#006849' }     // Selected - Dark Green
    : isPastSlot(slot)
      ? styles.pastSlot                  // Past - Grey
      : styles.availableSlot            // Available - Green
                        ]}
                        onPress={() => handleSlotSelect(slot)}
                        labelStyle={styles.buttonText}
                      >
                        {timeRange}
                      </Button>
                    </View>
                  );
                })
            ) : (
              <Text style={styles.noSlots}>No available slots for this date/time.</Text>
            )}
          </ScrollView>


        </View>

        <View style={styles.column}>
          <Text style={styles.subtitle}>Booked</Text>
          <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
            {bookedslotsbydate.length ? (
              bookedslotsbydate.map((slot, index) => {
                // slot is string like "18.5"
                const timeRange = ConvertSlotToTimeRange(slot);
                return (
                  <View key={index} style={styles.slotWrapper}>
                    <Text style={styles.bookedSlot}>{timeRange}</Text>
                  </View>
                );
              })
            ) : (
              <Text style={styles.noSlots}>No booked slots for this date/time.</Text>
            )}

          </ScrollView>
        </View>
      </View>


      {selectedSlots.length > 0 && (
        <TouchableOpacity
          style={styles.cartButton}
         // onPress={() => setCartVisible(true)}
          onPress={handleCartPress}
        >
          <View style={styles.shadowWrapper}>
            <View style={styles.cartCircle}>
              <Image
                source={require('../assets/shopping-cart.png')}
                style={styles.cartIcon}
              />
            </View>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{selectedSlots.length}</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* <Modal
        visible={cartVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCartVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selected Slots</Text>
            <Text style={{ marginVertical: 10, fontWeight: '600', fontSize: 16 }}>
              {formatSelectedSlotsDuration(selectedSlots)}
            </Text>
           
            <Button mode="contained" onPress={() => setCartVisible(false)} style={styles.buttoncolor}>Close</Button>
          </View>
        </View>
        isPastSlot
      </Modal> */}
      
      <Modal
        visible={cartVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCartVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
          keyboardVerticalOffset={100}
        >
          <ScrollView
            contentContainerStyle={styles.modalContent}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.modalTitle}>Booking Your Slot</Text>

            <Text style={styles.subHeading}>
              {formatSelectedSlotsDuration(selectedSlots)}
            </Text>

            {/* Input Fields */}
            <View style={styles.form}>
              {/* Name Input */}
              <View style={styles.inputGroup}>
                <Icon name="user" size={20} color="#006849" style={styles.icon} />
                <TextInput
                  placeholder="Enter your Name"
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                />
              </View>

              {/* Mobile Input */}
              <View style={styles.inputGroup}>
                <Icon name="phone" size={20} color="#006849" style={styles.icon} />
                <TextInput
                  placeholder="Enter your Mobile Number"
                  style={styles.input}
                  keyboardType="phone-pad"
                  maxLength={13}
                  value={mobile}
                  onChangeText={(text) => {
                    let cleaned = text.replace(/\D/g, '');
                    if (cleaned.startsWith('91')) {
                      setMobile(`+${cleaned.slice(0, 12)}`);
                    } else {
                      setMobile(`+91${cleaned.slice(0, 10)}`);
                    }
                  }}
                />
              </View>

              {/* Total Amount */}
              <View style={styles.inputGroup}>
                <Icon name="money" size={20} color="#006849" style={styles.icon} />
                <TextInput
                  placeholder="Total Amount"
                  style={styles.input}
                  keyboardType="numeric"
                  value={price}
                  onChangeText={setPrice}
                />
              </View>

              {/* Prepaid Amount */}
              <View style={styles.inputGroup}>
                <Icon name="rupee" size={20} color="#006849" style={styles.icon} />
                <TextInput
                  placeholder="Prepaid Amount"
                  style={styles.input}
                  keyboardType="numeric"
                  value={prepaid}
                  onChangeText={setPrepaid}
                />
              </View>
            </View>

            {/* Remaining Amount */}
            <Text style={styles.remaining}>
              Remaining Amount: ₹ {remainingAmount > 0 ? remainingAmount : 0}
            </Text>

            {/* Payment Status */}
            <Text style={styles.label}>Payment Status:</Text>
            <View style={styles.radioGroup}>
              {['pending', 'success', 'failed'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={styles.radioOption}
                  onPress={() => setPaymentStatus(status)}
                >
                  <View style={styles.radioCircle}>
                    {paymentStatus === status && <View style={styles.radioDot} />}
                  </View>
                  <Text style={styles.radioLabel}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Buttons */}
            <View style={styles.buttonGroup}>
              <Button
                mode="contained"
                onPress={() => setCartVisible(false)}
                style={[styles.buttonSecondary, styles.buttonSpacing]}
              >
                Close
              </Button>
              <Button
                mode="contained"
                onPress={() => handleBooking(grounds[0].ground_id, selectedSlots, selectedDate)}
                disabled={selectedSlots.length === 0 || !name || !mobile}
                style={styles.buttonPrimary}
              >
                Confirm
              </Button>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 10, backgroundColor: '#fff' },
  header: { position: 'absolute', top: -40, right: 10, zIndex: 1 },
  dateText: { fontSize: 14, fontWeight: '400', margin: 10 },
  subtitle: { fontSize: 16, fontWeight: '600', textAlign: 'center', marginBottom: 8 },
  row: { flex: 1, flexDirection: 'row' },
  column: { width: '50%', paddingHorizontal: 10 },
  grid: { alignItems: 'center', paddingBottom: 20 },
  slotWrapper: { width: '100%', marginBottom: 10, alignItems: 'center' },
  availableSlot: { backgroundColor: '#28a745', width: '100%' },
  buttonText: { color: 'white' },
  buttoncolor: { backgroundColor: '#006849' },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  refreshButton: {
    marginLeft: 10,
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#006849',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
    color: '#006849',
    textAlign: 'center',
  },
  subHeading: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 20,
    textAlign: 'center',
  },
  form: {
    marginBottom: 10,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 15,
    color: '#333',
  },
  remaining: {
    fontSize: 15,
    fontWeight: '600',
    marginVertical: 10,
    textAlign: 'center',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 5,
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#006849',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  radioDot: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: '#006849',
  },
  radioLabel: {
    fontSize: 14,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  buttonSecondary: {
    flex: 1,
    backgroundColor: '#ccc',
  },
  buttonPrimary: {
    flex: 1,
    backgroundColor: '#006849',
  },
  buttonSpacing: {
    marginRight: 10,
  },

  bookedSlot: {
    backgroundColor: '#dc3545',
    color: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    textAlign: 'center',
    width: '100%',
    fontWeight: '500',
  },
  noSlots: { textAlign: 'center', color: '#999', marginTop: 20 },
  datepickerfield: { margin: 10 },
  cartButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 30,
    elevation: 5,
  },

  cartIcon: {
    width: 30,
    height: 30,
    tintColor: '#006849', // optional: tint the icon green
  },

  badge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#006849',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  shadowWrapper: {
    // This is the outer wrapper without overflow: 'hidden'
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  // cartButton: {
  //   position: 'absolute',
  //   bottom: 20,
  //   right: 20,
  //   backgroundColor: '#007bff',
  //   borderRadius: 30,
  //   padding: 15,
  // },
  cartText: { color: '#fff', fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: '#000000aa', justifyContent: 'center' },
  modalContent: { margin: 20, backgroundColor: '#fff', borderRadius: 10, padding: 20 },
  modalTitle: { fontWeight: '700', fontSize: 16, marginBottom: 10 },
 pastSlot: {
  backgroundColor: '#A9A9A9', // Dark Grey (you can change it)
},
  cartCircle: {
    width: 50,
    height: 50,
    borderRadius: 30,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5, // for Android shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },

});
