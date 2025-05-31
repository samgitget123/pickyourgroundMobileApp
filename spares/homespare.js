import React from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity } from 'react-native';
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

const groundImages = [
  { id: '1', src: require('../assets/icon.png') },
  { id: '2', src: require('../assets/sample.jpg') },
  { id: '3', src: require('../assets/adaptive-icon.png') },
];

export default function HomeScreen() {
  const navigation = useNavigation();

  const handleBookNow = () => {
    navigation.navigate('Slots'); // Make sure this screen is defined in navigation
  };

  const renderImage = ({ item }) => (
    <TouchableOpacity onPress={handleBookNow} style={styles.imageWrapper}>
      <Image source={item.src} style={styles.relatedImage} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.groundName}>Vkings SportZ Arena</Text>
      <Image source={require('../assets/sample.jpg')} style={styles.mainImage} />
      
     <View style={styles.imagessection}>
       <Text style={styles.sectionTitle}>Book Now</Text>
      <FlatList
        data={groundImages}
        keyExtractor={(item) => item.id}
        horizontal
        renderItem={renderImage}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 10 }}
      />
       <Button mode="contained" onPress={handleBookNow} style={styles.bookNowBtn}>
        Book Now
      </Button>
     </View>

     
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 20 },
  groundName: {
    fontSize: 22,
    textAlign: 'center',
    marginVertical: 10,
  },
  mainImage: {
    width: '90%',
    height: 200,
    alignSelf: 'center',
    borderRadius: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 15,
    marginBottom: 10,
    textAlign: 'center'
  },
  imagessection: {
    paddingTop: 10,
  },
  imageWrapper: {
    marginRight: 10,
  },
  relatedImage: {
    width: 120,
    height: 100,
    borderRadius: 8,
  },
  bookNowBtn: {
    marginTop: 20,
    alignSelf: 'center',
    width: 150,
    backgroundColor: '#006849',
  },
});
