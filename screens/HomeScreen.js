import React from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity } from 'react-native';
import { Button, Card } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

const groundImages = [
  { id: '1', src: require('../assets/sample.jpg') },
  { id: '2', src: require('../assets/icon.png') },
  { id: '3', src: require('../assets/adaptive-icon.png') },
];

export default function HomeScreen() {
  const navigation = useNavigation();

  const handleBookNow = () => {
    navigation.navigate('Slots');
  };

  const renderImage = ({ item }) => (
    <TouchableOpacity onPress={handleBookNow} style={styles.imageWrapper}>
      <Card style={styles.card}>
        <Image source={item.src} style={styles.relatedImage} />
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.groundName}>🏏 Vkings SportZ Arena</Text>
      <Image source={require('../assets/sample.jpg')} style={styles.mainImage} />

      <View style={styles.imagesSection}>
        <Text style={styles.sectionTitle}>Available Grounds</Text>
        <FlatList
          data={groundImages}
          keyExtractor={(item) => item.id}
          horizontal
          renderItem={renderImage}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 15 }}
        />
        <Button mode="contained" onPress={handleBookNow} style={styles.bookNowBtn}>
          Book Now
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  groundName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 25,
    color: '#006849',
  },
  mainImage: {
    width: '90%',
    height: 200,
    alignSelf: 'center',
    borderRadius: 15,
    marginVertical: 15,
  },
  imagesSection: {
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 15,
    marginBottom: 10,
    color: '#333',
  },
  imageWrapper: {
    marginRight: 12,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
  },
  relatedImage: {
    width: 140,
    height: 100,
  },
  bookNowBtn: {
    marginTop: 30,
    alignSelf: 'center',
    width: 160,
    backgroundColor: '#006849',
  },
});
