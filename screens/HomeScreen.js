import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { Button, Card } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useApi } from '../src/contexts/ApiContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
// ✅ Define your constants properly
//const BASE_URL = 'http://localhost:5000/api';
//const userId = 'fad51424-d5db-43f4-aa66-b0b75e2a233c';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [grounds, setGrounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [grounddetails, setGroundDetails] = useState([]);
  const { BASE_URL } = useApi();
  const IMAGE_BASE_URL = `http://192.168.1.3:5000/uploads`;


  useEffect(() => {
    const fetchGrounds = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('userData');
        const user = storedUser ? JSON.parse(storedUser) : null;
        if (!user || !user.user) {
          console.error('User ID not found in AsyncStorage');
          return;
        }
        const grounddetails = user.user;
        setGroundDetails(grounddetails);
        console.log(grounddetails, 'groundetails')
        const user_id = user.user.id;
        //console.log(user_id , 'user_id')
        const response = await fetch(`${BASE_URL}/ground/user/grounds?userId=${user_id}`);
        console.log(response, '--------------------res-------------------------')
        const data = await response.json();
       // console.log(data[0].slots, '----------data----------')
        setGrounds(data);
      } catch (error) {
        console.error('Error fetching grounds:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGrounds();
  }, []);

  const handleBookNow = () => {
    navigation.navigate('Slots', { grounds: grounds });
  };

  const renderImage = ({ item }) => (
    <TouchableOpacity onPress={handleBookNow} style={styles.imageWrapper}>

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

  // const renderImage = ({ item }) => (
  //   <TouchableOpacity onPress={handleBookNow} style={styles.imageWrapper}>
  //     <Card style={styles.card}>
  //       {item.photo?.map((photo, index) => (
  //         <Image
  //           source={{ uri: `${IMAGE_BASE_URL}/${photo}` }}
  //           style={styles.relatedImage}
  //         />

  //       ))}
  //     </Card>
  //   </TouchableOpacity>
  // );


  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.appName}>🏏 Pick Your Ground</Text>

      {grounds.length > 0 && grounds[0].photo?.length > 0 && (

        <Image
          source={{ uri: `${IMAGE_BASE_URL}/${grounds[0].photo[0]}` }}
          style={styles.mainImage}
          resizeMode="cover"
        />
      )}


      <View style={styles.imagesSection}>
        <Text style={styles.sectionTitle}>Pick Your Slot</Text>
        <FlatList
          data={grounds}
          keyExtractor={(item) => item._id}
          horizontal
          renderItem={renderImage}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 15 }}
        />
       <View style={styles.groundDetailsContainer}>
  <Text style={styles.groundName}>
    {grounds.length > 0 ? grounds[0].name : 'No Ground Found'}
  </Text>
  <Text style={styles.groundCity}>
    {grounds.length > 0 ? grounds[0].city : ''}
  </Text>
</View>


        <Button mode="contained" onPress={handleBookNow} style={styles.bookNowBtn}>
          Book Now
        </Button>
       
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
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
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    width: 400, // keep this or change as per design
    height: 140,
    backgroundColor: '#fff',
  },

  bookNowBtn: {
    marginTop: 10,
    alignSelf: 'center',
    width: 160,
    backgroundColor: '#006849',
  },
});
