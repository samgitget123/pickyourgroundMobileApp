import React from 'react';
import { View, StyleSheet, Image, Dimensions } from 'react-native';
import Swiper from 'react-native-swiper';
import { Button, Text } from 'react-native-paper';

const { width } = Dimensions.get('window');

const slides = [
  {
    key: '1',
    title: 'Book Grounds Easily',
    text: 'Find and book sports grounds near you in seconds.',
    image: require('../assets/icon.png'),
  },
  {
    key: '2',
    title: 'Secure Your Slot',
    text: 'Select your date and time and pay securely in-app.',
    image: require('../assets/splash-icon.png'),
  },
  {
    key: '3',
    title: 'Play with Confidence',
    text: 'Get confirmation and enjoy your game hassle-free.',
    image: require('../assets/adaptive-icon.png'),
  },
];

export default function WelcomeScreen({ navigation }) {
  const renderSlide = (item, index) => (
    <View style={styles.slide} key={item.key}>
      <Image source={item.image} style={styles.image} />
      <Text variant="headlineSmall" style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.text}</Text>

      {index === slides.length - 1 ? (
        <Button mode="contained" onPress={() => navigation.replace('Login')} style={styles.button}>
          Get Started
        </Button>
      ) : null}
    </View>
  );

  return (
    <View style={styles.container}>
      <Swiper
        loop={false}
        showsPagination={true}
        dotColor="#ccc"
        activeDotColor="#6200ee"
        showsButtons={true}
        nextButton={<Text style={styles.navBtn}>›</Text>}
        prevButton={<Text style={styles.navBtn}>‹</Text>}
      >
        {slides.map(renderSlide)}
      </Swiper>
      <Button onPress={() => navigation.replace('Login')} style={styles.skipButton}>
        Skip to Login
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  image: {
    width: width * 0.7,
    height: width * 0.7,
    resizeMode: 'contain',
    marginBottom: 30,
  },
  title: { marginBottom: 10, textAlign: 'center' },
  description: { textAlign: 'center', marginBottom: 30, color: '#666' },
  button: { marginTop: 10, width: 200 },
  skipButton: {
    position: 'absolute',
    top: 40,
    right: 20,
  },
  navBtn: {
    fontSize: 30,
    color: '#6200ee',
    fontWeight: 'bold',
    paddingHorizontal: 15,
  },
  skipButton: {
  position: 'absolute',
  top: 50,
  right: 20,
  backgroundColor: '#eee',
  paddingHorizontal: 15,
  paddingVertical: 6,
  borderRadius: 10,
},

});
