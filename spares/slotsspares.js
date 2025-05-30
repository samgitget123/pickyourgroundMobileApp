import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Modal,
} from 'react-native';
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Groundslots } from '../Helpers/GroundslotSchedules';

export default function GroundSlots() {
  const navigation = useNavigation();
  const bookedSlotIds = ["5", "10", "23", "35", "25", "26", "27", "28", "29", "30"];

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [cartVisible, setCartVisible] = useState(false);

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

  const getSlotTimeRange = (slotValue) => {
    const start = parseFloat(slotValue);
    const end = start + 0.5;
    return `${formatTime(start)} - ${formatTime(end === 24 ? 0 : end)}`;
  };

  const isToday = (date) => {
    const now = new Date();
    return (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  };

  const getCurrentFloatTime = () => {
    const now = new Date();
    const hour = now.getHours();
    const minutes = now.getMinutes();
    if (minutes === 0) return hour;
    if (minutes <= 30) return hour + 0.5;
    return hour + 1;
  };

  const filteredAvailableSlots = Groundslots.filter(slot => {
    const slotTime = parseFloat(slot.slot);
    const isBooked = bookedSlotIds.includes(slot.id);
    if (isBooked) return false;
    if (isToday(selectedDate)) {
      return slotTime >= getCurrentFloatTime();
    }
    return true;
  });

  const filteredBookedSlots = Groundslots.filter(slot => {
    return bookedSlotIds.includes(slot.id);
  });

  const onChangeDate = (event, date) => {
    setShowPicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
      setSelectedSlots([]); // Clear selected slots when date changes
    }
  };

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
  const isPastSlot = (slot) => {
  
    const slotTime = parseFloat(slot.slot);
      console.log(selectedDate, 'pastslot')
    return isToday(selectedDate) && slotTime < getCurrentFloatTime();
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
            isPastSlot(slot) ? styles.pastSlot : styles.availableSlot,
            isSelected && { backgroundColor: '#00EE64' },
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

      {selectedSlots.length > 0 && (
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => setCartVisible(true)}
        >
          <Text style={styles.cartText}>Cart ({selectedSlots.length})</Text>
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
            {selectedSlots
              .sort((a, b) => parseFloat(a.slot) - parseFloat(b.slot))
              .map((s, idx) => (
                <Text key={idx} style={{ marginVertical: 5 }}>
                  {getSlotTimeRange(s.slot)}
                </Text>
              ))}
            <Button mode="contained" onPress={() => setCartVisible(false)}>Close</Button>
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
    bottom: 20,
    right: 20,
    backgroundColor: '#007bff',
    borderRadius: 30,
    padding: 15,
  },
  cartText: { color: '#fff', fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: '#000000aa', justifyContent: 'center' },
  modalContent: { margin: 20, backgroundColor: '#fff', borderRadius: 10, padding: 20 },
  modalTitle: { fontWeight: '700', fontSize: 16, marginBottom: 10 },
pastSlot: {
  backgroundColor: '#007bff', // blue for past slots today
},


});
