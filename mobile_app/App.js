import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, Image, ActivityIndicator } from 'react-native';

const App = () => {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch houses data from your API
  const fetchHouses = async () => {
    try {
      const response = await fetch('http://10.0.2.2/wesshacks/api/houses.php');
      const json = await response.json();
      if (json.status === 'success') {
        setHouses(json.data); // Set the houses data to state
      }
    } catch (error) {
      console.error('Error fetching houses data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Call fetchHouses when the component mounts
  useEffect(() => {
    fetchHouses();
  }, []);

  // Render each house item in the FlatList
  const renderHouse = ({ item }) => {
    return (
      <View style={styles.houseContainer}>
        <Text style={styles.houseTitle}>{item.street_address}</Text>
        <Text style={styles.houseInfo}>Capacity: {item.capacity}</Text>
        <Text style={styles.houseInfo}>Avg Rating: {item.avg_rating} ⭐</Text>
        <Text style={styles.houseInfo}>Reviews: {item.reviews_count}</Text>
        <Text style={styles.houseInfo}>
          Quiet Street: {item.is_quiet ? 'Yes' : 'No'}
        </Text>
      </View>
    );
  };

  // If loading, show a loading indicator
  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading houses...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Houses on Campus</Text>
      <FlatList
        data={houses}
        renderItem={renderHouse}
        keyExtractor={(item) => item.street_address.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  houseContainer: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    elevation: 2,
  },
  houseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  houseInfo: {
    fontSize: 14,
    color: '#555',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;


/*
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, SafeAreaView } from 'react-native';

export default function App() {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://10.0.2.2/wesshacks/api/houses.php')
      .then((res) => res.json())
      .then((data) => {
        setHouses(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#000" />
        <Text>Loading houses...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Houses</Text>
      <FlatList
        data={houses}
        keyExtractor={(item) => item.street_address}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.address}>{item.street_address}</Text>
            <Text>Capacity: {item.capacity}</Text>
            <Text>Bathrooms: {item.bathrooms}</Text>
            <Text>Quiet Street: {item.is_quiet == 1 ? 'Yes' : 'No'}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  card: { padding: 15, backgroundColor: '#f2f2f2', borderRadius: 10, marginBottom: 10 },
  address: { fontWeight: 'bold', fontSize: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
*/ 