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
