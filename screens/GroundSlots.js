import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker'; // make sure you installed this
import { Groundslots } from '../Helpers/GroundslotSchedules';

export default function GroundSlots() {
  const navigation = useNavigation();

  const bookedSlotIds = ["2", "5", "10", "23", "35"];

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  // Format float hours to AM/PM string
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

  // Slot time range string
  const getSlotTimeRange = (slotValue) => {
    const start = parseFloat(slotValue);
    const end = start + 0.5;
    return `${formatTime(start)} - ${formatTime(end === 24 ? 0 : end)}`;
  };

  // Check if selected date is today
  const isToday = (date) => {
    const now = new Date();
    return (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  };

  // Get current time as float hours for filtering past slots
  // const getCurrentFloatTime = () => {
  //   const now = new Date();
  //   return now.getHours() + (now.getMinutes() >= 30 ? 0.5 : 0);
  // };
const getCurrentFloatTime = () => {
  const now = new Date();
  const hour = now.getHours();
  const minutes = now.getMinutes();

  if (minutes === 0) return hour;
  if (minutes <= 30) return hour + 0.5;
  // If minutes > 30, round up to next hour
  return hour + 1;
};

  // Filter slots by availability, booked status, and date/time
  const filteredAvailableSlots = Groundslots.filter(slot => {
    const slotTime = parseFloat(slot.slot);
    const isBooked = bookedSlotIds.includes(slot.id);
    if (isBooked) return false;

    if (isToday(selectedDate)) {
      // For today, show only future slots
      return slotTime >= getCurrentFloatTime();
    }
    return true;
  });

  const filteredBookedSlots = Groundslots.filter(slot => {
    const slotTime = parseFloat(slot.slot);
    const isBooked = bookedSlotIds.includes(slot.id);
    if (!isBooked) return false;

    if (isToday(selectedDate)) {
      return slotTime >= getCurrentFloatTime();
    }
    return true;
  });

  // Date picker change handler
  const onChangeDate = (event, date) => {
    setShowPicker(Platform.OS === 'ios');
    if (date) setSelectedDate(date);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button mode="text" onPress={() => navigation.goBack()}>
          ← Back
        </Button>
      </View>


      {/* Date Picker input */}
    

     <View style={styles.datepickerfield}>
       {showPicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={onChangeDate}
          minimumDate={new Date()}
        />
      )}
        <TouchableOpacity  onPress={() => setShowPicker(true)}>
        <Text style={styles.dateText}>Selected Date: {selectedDate.toDateString()}</Text>
      </TouchableOpacity>
     </View>

      {/* Slots display side by side */}
      <View style={styles.row}>
        {/* Available Slots Column */}
        <View style={styles.column}>
          <Text style={styles.subtitle}>Available</Text>
          <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator>
            {filteredAvailableSlots.length ? (
              filteredAvailableSlots.map((slot) => {
                const timeRange = getSlotTimeRange(slot.slot);
                return (
                  <View key={slot.id} style={styles.slotWrapper}>
                    <Button
                      mode="contained"
                      style={styles.availableSlot}
                      onPress={() => alert(`Booking ${timeRange} on ${selectedDate.toDateString()}`)}
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

        {/* Booked Slots Column */}
        <View style={styles.column}>
          <Text style={styles.subtitle}>Booked</Text>
          <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    paddingTop: 40, 
    backgroundColor: '#fff' 
  },
  header: { 
    position: 'absolute', 
    top: 10, 
    left: 10, 
    zIndex: 1 
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  dateInput: {
    alignSelf: 'center',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 6,
    marginBottom: 15,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  column: {
    width: '50%',
    paddingHorizontal: 10,
  },
  grid: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  slotWrapper: {
    width: '100%',
    marginBottom: 10,
    alignItems: 'center',
  },
  availableSlot: {
    backgroundColor: '#28a745', // Green
    width: '100%',
  },
  buttonText: {
    color: 'white',
  },
  bookedSlot: {
    backgroundColor: '#dc3545', // Red
    color: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    textAlign: 'center',
    width: '100%',
    fontWeight: '500',
  },
  noSlots: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
  },
  datepickerfield:{
    margin: 20
  }
});
