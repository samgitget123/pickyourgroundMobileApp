import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Modal,
  Image
} from 'react-native';
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Groundslots } from '../Helpers/GroundslotSchedules';

export default function GroundSlots() {
  const navigation = useNavigation();

  //dummy booked slots
  const bookedSlotIds = ["5", "10", "23", "35", "25", "26", "27", "28", "29", "30"];

  //usestates
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [cartVisible, setCartVisible] = useState(false);

  //this function converts slot number to as time formats with 30 minutes interval with AM/PM
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

  // const isToday = (date) => {
  //   const now = new Date();
  //   return (
  //     date.getDate() === now.getDate() &&
  //     date.getMonth() === now.getMonth() &&
  //     date.getFullYear() === now.getFullYear()
  //   );
  // };

  //this function check today date is true or false
  const isToday = (date) => {
    const now = new Date();
    // Convert both to local date only (ignore time part)
    const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const localNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return localDate.getTime() === localNow.getTime();
  };


  // const getCurrentFloatTime = () => {
  //   const now = new Date();
  //   const hour = now.getHours();
  //   const minutes = now.getMinutes();
  //   if (minutes === 0) return hour;
  //   if (minutes <= 30) return hour + 0.5;
  //   return hour + 1;
  // };

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

  // const getFloatTimeFromSlotString = (slotTimeString) => {
  //   const d = new Date(slotTimeString);
  //   const h = d.getHours();
  //   const m = d.getMinutes();
  //   return h + (m >= 30 ? 0.5 : 0);
  // };

//Here we filtering the available slots
  const filteredAvailableSlots = Groundslots.filter(slot => {
    const slotTime = parseFloat(slot.slot);
    const isBooked = bookedSlotIds.includes(slot.id);
    if (isBooked) return false;
    if (isToday(selectedDate)) {
      return slotTime >= getCurrentFloatTime();
    }
    return true;
  });

  //Here filtering the booked slots
  const filteredBookedSlots = Groundslots.filter(slot => {
    return bookedSlotIds.includes(slot.id);
  });

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
    const isSelected = selectedSlots.some(s => s.id === slot.id);

    if (isSelected) {
      setSelectedSlots(prev => prev.filter(s => s.id !== slot.id));
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
  // const isPastSlot = (slot) => {

  //   const slotTime = parseFloat(slot.slot);
  //     console.log(selectedDate, 'pastslot')
  //   return isToday(selectedDate) && slotTime < getCurrentFloatTime();
  // };

  //it will check the past slots
  const isPastSlot = (slot) => {
    const slotTime = getFloatTimeFromSlotString(slot.slot);
    // console.log(slotTime, 'slotTime')
    return isToday(selectedDate) && slotTime < getCurrentFloatTime();
  };

  //format all slots as time period
  // const formatslot = (selectedSlots) => {
  //   // console.log(selectedSlots.slot , 'timeformat')
  //   if (!Array.isArray(selectedSlots) || selectedSlots.length === 0) return "";

  //   const formatTime = (hours, minutes) => {
  //     const period = hours >= 12 ? "PM" : "AM";
  //     const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
  //     return `${formattedHours}:${minutes} ${period}`;
  //   };

  //   const firstSlot = String(selectedSlots[0]);
  //   const lastSlot = String(selectedSlots[selectedSlots.length - 1]);

  //   const isValidSlot = (slot) => /^(\d+(\.\d+)?)$/.test(slot);

  //   if (!isValidSlot(firstSlot) || !isValidSlot(lastSlot)) {
  //     console.error("Invalid slot format detected.");
  //     return "Invalid slot format";
  //   }

  //   const [startHours, startHalf] = firstSlot.split(".").map(Number);
  //   const startMinutes = startHalf === 0 ? "00" : "30";
  //   const startTime = formatTime(startHours, startMinutes);

  //   const [endHours, endHalf] = lastSlot.split(".").map(Number);
  //   const endTime = formatTime(
  //     endHours + (endHalf === 0 ? 0 : 1),
  //     endHalf === 0 ? "30" : "00"
  //   );

  //   return `${startTime} - ${endTime}`;
  // };

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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button mode="text" onPress={() => navigation.goBack()}>
          ← Back
        </Button>
      </View>

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

      <View style={styles.row}>
        <View style={styles.column}>
          <Text style={styles.subtitle}>Available</Text>
          <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
            {filteredAvailableSlots.length ? (
              filteredAvailableSlots.map((slot) => {
                const timeRange = getSlotTimeRange(slot.slot);
                const isSelected = selectedSlots.some(s => s.id === slot.id);
                return (
                  <View key={slot.id} style={styles.slotWrapper}>
                    <Button
                      mode="contained"
                      style={[
                        isSelected
                          ? { backgroundColor: '#00EE64' }  // selected
                          : isPastSlot(slot) == true
                            ? styles.pastSlot                 // past slots (blue)
                            : styles.availableSlot            // available slots (green)
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
            {filteredBookedSlots.length ? (
              filteredBookedSlots.map((slot) => {
                const timeRange = getSlotTimeRange(slot.slot);
                return (
                  <View key={slot.id} style={styles.slotWrapper}>
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

      {/* {selectedSlots.length > 0 && (
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => setCartVisible(true)}
        >
          <Text style={styles.cartText}>Cart ({selectedSlots.length})</Text>
        </TouchableOpacity>
      )} */}
{selectedSlots.length > 0 && (
  <TouchableOpacity
    style={styles.cartButton}
    onPress={() => setCartVisible(true)}
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

      <Modal
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
            {/* {selectedSlots
              .sort((a, b) => parseFloat(a.slot) - parseFloat(b.slot))
              .map((s, idx) => (
                <Text key={idx} style={{ marginVertical: 5 }}>
                  {getSlotTimeRange(s.slot)}
                </Text>
              ))} */}
            <Button mode="contained" onPress={() => setCartVisible(false)} style={styles.buttoncolor}>Close</Button>
          </View>
        </View>
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
    backgroundColor: '#007bff', // blue for past slots today
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
