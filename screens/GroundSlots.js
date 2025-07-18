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
  KeyboardAvoidingView,
  Linking,
  TouchableWithoutFeedback,
  Keyboard,
  Pressable,
  FlatList,
  ActivityIndicator
} from 'react-native';

import MaterialIcons from 'react-native-vector-icons/MaterialIcons'; // or other sets like FontAwesome, Ionicons
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Groundslots } from '../Helpers/GroundslotSchedules';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useApi } from '../src/contexts/ApiContext';
import ConvertSlotToTimeRange from '../Helpers/ConvertSlotToTimeRange';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Footer from './Footer';

export default function GroundSlots({ route }) {
  const { BASE_URL } = useApi();
  const IMAGE_BASE_URL = `http://192.168.0.143:5000/uploads`;
  // const { grounds } = route.params;
 const currentYear = new Date().getFullYear();

  //usestates
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [name, setName] = useState(""); // State for Name
  const [mobile, setMobile] = useState(""); // State for Mobile
  const [price, setPrice] = useState('');
  const [prepaid, setPrepaid] = useState("");  // Prepaid Amount
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [cartVisible, setCartVisible] = useState(false);
  const remainingAmount = Number(price) - Number(prepaid || 0);
  const [groundData, setGroundData] = useState([]);
  const [editPrice, setEditPrice] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  //////Booking details //////////
  const [bookingDetails, setBookingDetails] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [grounddetails, setGroundDetails] = useState([]);
  const [userDetails, setUserDetails] = useState([]);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    const fetchGrounds = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('userData');
        if (!storedUser) {
          console.warn('⚠️ No userData found in AsyncStorage');
          return;
        }

        const user = JSON.parse(storedUser);
        if (!user?.user?.id) {
          console.error('❌ Invalid user object structure:', user);
          return;
        }

        const user_id = user.user.id;
        setUserDetails(user.user);



        const response = await fetch(`${BASE_URL}/ground/user/grounds?userId=${user_id}`);
        if (!response.ok) {
          throw new Error('❌ Network response was not ok');
        }

        const data = await response.json();
        if (data.length > 0) {
          setGroundDetails(data[0]);
        } else {
          console.warn('⚠️ No ground data found for this user.');
        }
      } catch (error) {
        console.error('❌ Error fetching ground details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGrounds();
  }, []);


  const fetchGroundDetailsagain = async () => {
    try {
      if (!grounddetails?.ground_id) {
        console.warn("⛔ ground_id not available yet");
        return;
      }

      setLoading(true); // Start spinner
      // Convert selectedDate to 'YYYY-MM-DD' format string
      let formattedDate = "";
      const gid = grounddetails.ground_id;

      if (selectedDate instanceof Date) {
        // If selectedDate is a Date object
        formattedDate = selectedDate.toISOString().slice(0, 10);
      } else if (typeof selectedDate === "string") {
        // If it's a string (like ISO string), slice first 10 chars
        formattedDate = selectedDate.slice(0, 10);
      } else {
        throw new Error("selectedDate is not a valid Date or string");
      }



      const res = await fetch(`${BASE_URL}/ground/${grounddetails.ground_id}?date=${formattedDate}`);


      if (!res.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await res.json();


      setGroundData(data);

    } catch (error) {
      console.error("❌ Error fetching ground details:", error);
    } finally {
      setLoading(false); // Stop spinner
    }
  };
  //it ensure always trigger fetch booking details///
  useEffect(() => {
    const fetchGroundDetails = async () => {
      try {
        if (!grounddetails?.ground_id) {
          console.warn("⛔ ground_id not available yet");
          return;
        }
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



        const res = await fetch(`${BASE_URL}/ground/${grounddetails?.ground_id}?date=${formattedDate}`);


        if (!res.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await res.json();


        setGroundData(data);
      } catch (error) {
        console.error("❌ Error fetching ground details:", error);
      }
    };

    if (selectedDate) {
      fetchGroundDetails();
    }
  }, [selectedDate, grounddetails]);

  const formatSlot = (slot) => {
    return slot; // Example: return formatted slot
  };

  const bookedslotsbydate = groundData?.slots?.booked?.map(formatSlot) || [];

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

  //Omchange date function
  const onChangeDate = (event, date) => {
    setShowPicker(false);
    if (event.type === "set" && date) {
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

    if (selectedSlots?.length === 0) {
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

  const handleBooking = async (gid, selectSlots, selectDate) => {


    if (selectSlots.length === 0 || !name || !mobile) {
      alert('Please fill all required fields and select slots.');
      return;
    }


    const storedUser = await AsyncStorage.getItem('userData');
    const user = storedUser ? JSON.parse(storedUser) : null;

    if (!user || !user.user || !user.user.id) {
      alert('User not logged in or invalid user data');
      return;
    }

    const user_id = user.user.id;
    const formattedDate = selectDate.toISOString().slice(0, 10);


    const payload = {
      ground_id: gid,
      slots: selectSlots.map(s => s.slot),
      date: formattedDate,
      name,
      mobile: mobile.replace(/\D/g, ''),
      comboPack: false,
      price: Number(price),
      prepaid: Number(prepaid),
      user_id,
    };



    try {
      const response = await fetch(`${BASE_URL}/booking/book-slot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        alert('✅ Booking successful! Your slots have been reserved.');
        setCartVisible(false);
        await fetchGroundDetailsagain();
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
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => setSelectedSlots([]) // Clear selected slots
          },
          {
            text: "Yes, Proceed",
            onPress: () => setCartVisible(true) // Show cart modal
          }
        ]
      );
    } else {
      setCartVisible(true);
    }
  };

  ////closing booking modal//
  const closeBookingmodal = () => {
    setCartVisible(false);
    setSelectedSlots([]);
  }
  ///////////this funtion triggers the booking details //////////
  const fetchBookingDetails = async (slot) => {
    try {
      const formattedDate = selectedDate instanceof Date
        ? selectedDate.toISOString().slice(0, 10)
        : selectedDate;

      const response = await fetch(`${BASE_URL}/booking/bookdetails?ground_id=${grounddetails?.ground_id}&date=${formattedDate}&slot=${slot}`);
      if (!response.ok) throw new Error("Failed to fetch booking details");

      const data = await response.json();
      setBookingDetails(data); // Store the booking details

      setDetailsModalVisible(true); // Open modal
    } catch (error) {
      console.error("❌ Error fetching booking details:", error);
      Alert.alert("Error", "Could not load booking details.");
    }
  };
  /////////////////////////Share on watsapp/////////////////////////////
  const handleWhatsAppShare = (latitude, longitude, ground_name) => {
    try {
      const bookingData = bookingDetails?.data[0];
      if (!bookingData) return;

      const bookingId = bookingData?.book?.booking_id;
      const slots = formatSelectedSlotsDuration(bookingData?.slots?.map(slot => ({ slot })));
      const price = bookingData?.book?.price;
      // const prepaid = bookingData?.prepaid;
      const advance = bookingData?.prepaid || 0;
      const dueAmount = price - advance;
      const date = bookingData?.date;
      const customerName = bookingData?.name;
      const phoneNumber = `${bookingData?.mobile}`; // Make sure to include country code

      const groundLocationURL = `https://www.google.com/maps?q=${latitude},${longitude}`;

      const message = `*🎉 Booking Confirmation 🎉*\n────────────────────────\n🔹 *Booking ID:* ${bookingId}\n📅 *Date:* ${date}\n🕒 *Slots:* ${slots}\n💰 *Price:* ₹${price}/-\n💸 *Advance Paid:* ₹${advance}/-\n💳 *Due Amount:* ₹${dueAmount}/-\n────────────────────────\nDear ${customerName},\nThank you for booking with us!\n📍 *Ground Location:* ${groundLocationURL}\n\nBest Regards,\n${ground_name}`;

      const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

      Linking.openURL(whatsappURL);
    } catch (err) {
      Alert.alert('Error', 'Unable to open WhatsApp.');
      console.error(err);
    }
  };
  //////Handle edit amount//////
  const handleEditPrice = async () => {
    const bookingId = bookingDetails?.data[0]?.book?.booking_id;

    try {
      const response = await fetch(`${BASE_URL}/booking/updateprice`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          booking_id: bookingId,
          newPrice: Number(editPrice),
          comboPack: false,
        }),
      });


      const data = await response.json();



      if (data.success) {
        // Update the local bookingDetails state
        const updatedBookingDetails = {
          ...bookingDetails,
          data: [
            {
              ...bookingDetails.data[0],
              book: {
                ...bookingDetails.data[0].book,
                price: Number(editPrice),
              },
            },
          ],
        };
        setBookingDetails(updatedBookingDetails); // Update the state
        setIsEditing(false);
        Alert.alert('Success', 'Price updated successfully');
      } else {
        Alert.alert('Failed', data.message || 'Could not update price');
      }
    } catch (error) {
      console.error('Update Price Error:', error);
      Alert.alert('Error', 'Something went wrong');
    }
  };

  ///////////////Handle cancel booking/////////////////////
  const handleCancelBooking = async () => {

    try {
      const bookingId = bookingDetails?.data[0]?.book?.booking_id;
      const groundId = bookingDetails?.data[0]?.ground_id;

      const response = await fetch(
        //http://192.168.0.143:5000/api/booking/deletebooking?booking_id=BKG48HYW761X&ground_id=GNDTYMJ738ZY
        `${BASE_URL}/booking/deletebooking?booking_id=${bookingId}&ground_id=${groundId}`,
        {
          method: 'DELETE',
        }
      );

      const data = await response.json();

      if (data.success) {
        Alert.alert('Booking Cancelled', data.message || 'Booking was cancelled');
        setDetailsModalVisible(false);
        // ✅ Auto-refresh ground/slot data
        await fetchGroundDetailsagain();  // ← You must define this function
      } else {
        Alert.alert('Failed', data.message || 'Could not cancel booking');
      }
    } catch (error) {
      console.error('Cancel Booking Error:', error);
      Alert.alert('Error', 'Something went wrong');
    }
  };

  const renderImage = ({ item }) => (
    <TouchableOpacity style={styles.imageWrapper}>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.imageScrollView} // 👈 new style
      >
        {item.photo?.map((photo, index) => (
          <Image
            key={index}
            source={{ uri: `${IMAGE_BASE_URL}/${photo}` }}
            style={styles.relatedImage}
          />
        ))}
      </ScrollView>

    </TouchableOpacity>
  );
  {
    loading && (
      <View style={styles.spinnerContainer}>
        <ActivityIndicator size="large" color="#006849" />
      </View>
    )
  }

  return (
    <View style={{ flex: 1 }}>
    <View style={styles.container}>
      {/* <View style={styles.header}>

      </View> */}
    
      <View style={styles.dateRow}>

        <View style={styles.datepickerfield} >
          <TouchableOpacity style={styles.button} onPress={() => setShowPicker(true)} >
            <Text style={styles.calenderbutton}>Select Date</Text>
          </TouchableOpacity>
          {showPicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onChangeDate}
            />
          )}
          <TouchableOpacity onPress={() => setShowPicker(true)}>
            <Text style={styles.dateText}>Selected Date: {selectedDate.toDateString()}</Text>
          </TouchableOpacity>
        </View>
        <View > 
          <TouchableOpacity onPress={fetchGroundDetailsagain}  style={styles.refreshButton} >
            <Icon name="refresh" size={25} color="#fff" />
          </TouchableOpacity>
           <TouchableOpacity onPress={() => setShowPicker(true)}>
            <Text style={{marginLeft:50}}>Refresh</Text>
          </TouchableOpacity>
        </View>
        
      </View>

      <View style={styles.row}>
        <View style={styles.column}>
          <Text style={styles.subtitle}>Available</Text>
          <ScrollView contentContainerStyle={[styles.grid, { paddingBottom: 200 }]} showsVerticalScrollIndicator={false} >
            {filteredAvailableSlots?.filter(slot => !bookedslotsbydate.includes(slot.slot)).length > 0 ? (
              filteredAvailableSlots
                .filter(slot => !bookedslotsbydate.includes(slot.slot)) // Exclude booked
                .map((slot) => {
                  const timeRange = getSlotTimeRange(slot.slot);
                  console.log(timeRange,'timeRange')
                  const isSelected = selectedSlots.some(s => s.slot === slot.slot); // ✅ Fix here

                  return (
                    <View key={slot.slot} style={styles.slotWrapper}>
                      <Button
                        mode="contained"
                        style={[
                          isSelected
                            ? { backgroundColor: '#00EE64' }     // Selected - Dark Green
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
          <ScrollView contentContainerStyle={[styles.grid, { paddingBottom: 200 }]} showsVerticalScrollIndicator={false}>
            {bookedslotsbydate?.length ? (
              bookedslotsbydate.map((slot, index) => {
                // slot is string like "18.5"
                const timeRange = ConvertSlotToTimeRange(slot);
                return (
                  // <View key={index} style={styles.slotWrapper}>
                  //   <Text style={styles.bookedSlot}>{timeRange}</Text>
                  // </View>
                  <TouchableOpacity
                    key={index}
                    onPress={() => fetchBookingDetails(slot)}
                    style={styles.slotWrapper}
                  >
                    <Text style={styles.bookedSlot}>{timeRange}</Text>
                  </TouchableOpacity>
                );
              })
            ) : (
              <Text style={styles.noSlots}>No booked slots for this date/time.</Text>
            )}

          </ScrollView>
        </View>
      </View>


      {selectedSlots?.length > 0 && (
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
            <Text style={styles.badgeText}>{selectedSlots?.length}</Text>
          </View>
        </TouchableOpacity>
      )}

  

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
                  placeholderTextColor="#999"
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
                  placeholderTextColor="#999"
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
                  placeholderTextColor="#999"
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
                  placeholderTextColor="#999"
                  style={styles.input}
                  keyboardType="numeric"
                  value={prepaid}
                  onChangeText={(text) => {
                    const numeric = text.replace(/[^0-9.]/g, '');
                    setPrepaid(numeric);
                  }}
                  maxLength={6}
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
                onPress={closeBookingmodal}
                style={[styles.buttonSecondary, styles.buttonSpacing]}
              >
                Close
              </Button>
              <Button
                mode="contained"
                onPress={() => handleBooking(grounddetails?.ground_id, selectedSlots, selectedDate)}
                disabled={selectedSlots?.length === 0 || !name || !mobile}
                style={styles.buttonPrimary}
              >
                Confirm
              </Button>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>



    

      <Modal
        visible={detailsModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDetailsModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.cardContainer}>
                {bookingDetails ? (
                  <>
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardTitle}>📋 Booking Details</Text>
                    </View>

                    <View style={styles.cardBody}>
                      {/* Your Rows */}
                      <View style={styles.row}>
                        <View style={styles.detailBox}>
                          <MaterialIcons name="calendar-today" size={18} color="#006849" />
                          <Text style={styles.cardText}>Date</Text>
                          <Text style={styles.cardValue}>{bookingDetails?.data[0]?.date}</Text>
                        </View>
                        <View style={styles.detailBox}>
                          <MaterialCommunityIcons name="identifier" size={18} color="#006849" />
                          <Text style={styles.cardText}>Booking ID</Text>
                          <Text style={styles.cardValue}>{bookingDetails?.data[0]?.book?.booking_id}</Text>
                        </View>
                      </View>

                      <View style={styles.row}>
                        <View style={styles.detailBox}>
                          <MaterialIcons name="access-time" size={18} color="#006849" />
                          <Text style={styles.cardText}>Slot</Text>
                          <Text style={styles.cardValue}>
                            {formatSelectedSlotsDuration(
                              bookingDetails?.data[0]?.slots?.map(slot => ({ slot }))
                            )}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.row}>
                        <View style={styles.detailBox}>
                          <FontAwesome name="user" size={18} color="#006849" />
                          <Text style={styles.cardText}>Name</Text>
                          <Text style={styles.cardValue}>{bookingDetails?.data[0]?.name}</Text>
                        </View>
                        <View style={styles.detailBox}>
                          <FontAwesome name="rupee" size={18} color="#006849" />
                          <Text style={styles.cardText}>Price</Text>
                          <Text style={styles.cardValue}>₹{bookingDetails?.data[0]?.book?.price}</Text>
                        </View>
                      </View>

                      <View style={styles.row}>

                        <Pressable style={styles.detailBox} onPress={() => Linking.openURL(`tel:${bookingDetails?.data[0]?.mobile}`)}>
                          <FontAwesome name="phone" size={18} color="#006849" />
                          <Text style={styles.cardText}>Mobile</Text>
                          <Text style={styles.cardValue}>{bookingDetails?.data[0]?.mobile}</Text>
                        </Pressable>

                      </View>

                      <View style={styles.row}>
                        <View style={styles.detailBox}>
                          <FontAwesome name="pencil" size={18} color="#006849" />
                          <Text style={styles.cardText}>Edit Amount</Text>

                          {isEditing ? (
                            <>
                              <TextInput
                                style={{
                                  borderColor: '#ccc',
                                  borderWidth: 1,
                                  borderRadius: 5,
                                  padding: 5,
                                  marginTop: 5,
                                  width: 100,
                                }}
                                placeholder="Enter New Price"
                                value={editPrice}
                                keyboardType="numeric"
                                onChangeText={setEditPrice}
                              />
                              <Button
                                mode="contained"
                                onPress={handleEditPrice}
                                style={{ marginTop: 5, backgroundColor: '#006849' }}
                              >
                                Update
                              </Button>
                            </>
                          ) : (
                            <Button
                              mode="outlined"
                              onPress={() => {
                                setIsEditing(true);
                                setEditPrice(`${bookingDetails?.data[0]?.book?.price}`);
                              }}
                              style={{ marginTop: 5 }}
                            >
                              Edit
                            </Button>
                          )}
                        </View>

                        <View style={styles.detailBox}>
                          <FontAwesome name="trash" size={18} color="red" />
                          <Text style={styles.cardText}>Cancel Booking</Text>

                          <Button
                            mode="contained"
                            icon="delete"
                            style={{ marginTop: 5, backgroundColor: 'red' }}
                            onPress={handleCancelBooking}
                          >
                            Delete
                          </Button>
                        </View>
                      </View>
                    </View>

                    <View style={styles.cardFooter}>
                      <View style={styles.row}>
                        <Button
                          mode="contained"
                          style={{ marginTop: 10, backgroundColor: '#25D366' }}
                          onPress={() =>
                            handleWhatsAppShare(
                              grounddetails?.latitude,
                              grounddetails?.longitude,
                              grounddetails?.name
                            )
                          }
                          icon={({ size, color }) => (
                            <FontAwesome name="whatsapp" size={size} color={color} />
                          )}
                        >
                          Share on WhatsApp
                        </Button>

                        <Button
                          mode="contained"
                          style={{ marginTop: 10, marginLeft: 10, backgroundColor: '#006849' }}
                          onPress={() => setDetailsModalVisible(false)}
                        >
                          Close
                        </Button>
                      </View>
                    </View>
                  </>
                ) : (
                  <Text style={styles.loadingText}>Loading...</Text>
                )}
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View >
     <Footer/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 0, backgroundColor: '#fff' },
  header: { position: 'absolute', top: -40, right: 10, zIndex: 1 },
  dateText: { fontSize: 14, fontWeight: '400', margin: 10 },
  subtitle: { fontSize: 16, fontWeight: '600', textAlign: 'center', marginBottom: 8 },
  row: { flex: 1, flexDirection: 'row' },
  column: { width: '50%', paddingHorizontal: 10 },
  grid: { alignItems: 'center', paddingBottom: 20 },
  slotWrapper: { width: '100%', marginBottom: 10, alignItems: 'center' },
  availableSlot: { backgroundColor: '#006849', width: '100%' },
   bookedSlot: {
    backgroundColor: '#dc3545',
    color: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 0,
    borderRadius: 8,
    textAlign: 'center',
    width: '100%',
   
  ...Platform.select({
    ios: {
      // iOS-specific styles
      fontWeight: '500',
       fontSize: 16,
    },
    android: {
      // Android-specific styles
      fontWeight: '100',
      fontSize: 12,
    },
  }),
  },
  buttonText: { color: 'white',
     ...Platform.select({
    ios: {
      // iOS-specific styles
      fontSize: 16,
      fontWeight:'500'
    },
    android: {
      // Android-specific styles
      fontSize: 12,
      fontWeight:'100'
    },
  }),
   },
  calenderbutton: { color: '#fff',fontSize: 14, fontWeight: '400', marginLeft: 10 },
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
    backgroundColor: '#f9f9f9',
  },
  refreshButton: {
    marginLeft: 50,
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#006849',
    alignItems:'center'
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center"
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

 
  noSlots: { textAlign: 'center', color: '#999', marginTop: 20 },
  datepickerfield: { margin: 10 },
  cartButton: {
    position: 'absolute',
    bottom: 40,
    right: 40,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 30,
    elevation: 5,
  },

  cartIcon: {
    width: 50,
    height: 50,
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
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  cardContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
  },

  cardHeader: {
    backgroundColor: '#006849',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },

  cardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  cardBody: {
    padding: 16,
  },

  cardText: {
    fontSize: 15,
    marginBottom: 8,
    color: '#333',
  },

  cardFooter: {
    padding: 12,
    alignItems: 'center',
  },

  loadingText: {
    padding: 20,
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailBox: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  cardText: {
    fontSize: 12,
    color: '#333',
    marginTop: 4,
  },
  cardValue: {
    fontWeight: 'bold',
    fontSize: 12,
    color: '#000',
    marginTop: 2,
  },
  ////////////////Intro section/////////
  appName: {
    fontSize: 24,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 10,
    color: '#000',
  },
  mainImage: {
    width: '90%',
    height: 200,
    alignSelf: 'center',
    borderRadius: 15,
    marginVertical: 15,
  },
  imagesSection: {
    paddingVertical: 10,
    backgroundColor: '#E8E8E8',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '400',
    marginLeft: 15,
    marginBottom: 10,
    color: '#333',
    textAlign: 'center'
  },
  imageWrapper: {
    marginRight: 15,
  },
  imageScrollView: {
    width: '100%',
  },
  relatedImage: {
    width: 200,
    height: 140,
    resizeMode: 'cover',
    marginRight: 10,
    borderRadius: 8,
  },
  groundDetailsContainer: {
    alignItems: 'center',
    marginVertical: 0,
    paddingHorizontal: 0,
  },
  groundName: {
    fontSize: 24,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 10,
    color: '#000',
  },
  spinnerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999, // ensures it's above other components
  },
   button: {
    backgroundColor: '#006849', //#006849
    paddingVertical: 12 ,
    borderRadius: 8,
    alignItems: 'center',
  },


});