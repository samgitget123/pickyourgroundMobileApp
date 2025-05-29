import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Groundslots } from '../Helpers/GroundslotSchedules';

export default function GroundSlots() {
  const navigation = useNavigation();

  const bookedSlotIds = ["2", "5", "10", "23", "35"];

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

  const availableSlots = Groundslots.filter(slot => !bookedSlotIds.includes(slot.id));
  const bookedSlots = Groundslots.filter(slot => bookedSlotIds.includes(slot.id));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button mode="text" onPress={() => navigation.goBack()}>
          ← Back
        </Button>
      </View>

      <Text style={styles.title}>Slot Overview</Text>

      <View style={styles.row}>
        {/* Available Slots Column */}
        <View style={styles.column}>
          <Text style={styles.subtitle}>Available</Text>
          <ScrollView
            contentContainerStyle={styles.grid}
            showsVerticalScrollIndicator={true}
          >
            {availableSlots.map((slot) => {
              const timeRange = getSlotTimeRange(slot.slot);
              return (
                <View key={slot.id} style={styles.slotWrapper}>
                  <Button
                    mode="contained"
                    style={styles.availableSlot}
                    onPress={() => alert(`Booking ${timeRange}`)}
                    labelStyle={styles.buttonText}
                  >
                    {timeRange}
                  </Button>
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* Booked Slots Column */}
        <View style={styles.column}>
          <Text style={styles.subtitle}>Booked</Text>
          <ScrollView
            contentContainerStyle={styles.grid}
            showsVerticalScrollIndicator={true}
          >
            {bookedSlots.map((slot) => {
              const timeRange = getSlotTimeRange(slot.slot);
              return (
                <View key={slot.id} style={styles.slotWrapper}>
                  <Text style={styles.bookedSlot}>{timeRange}</Text>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40, backgroundColor: '#fff' },
  header: { position: 'absolute', top: 20, left: 10, zIndex: 1 },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
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
    flex: 1,
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
});
