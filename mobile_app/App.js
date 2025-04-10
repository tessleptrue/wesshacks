import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from './AuthContext';

const App = ({ navigation }) => {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout, getAuthHeader } = useAuth();

  // Fetch houses data from your API
  const fetchHouses = async () => {
    try {
      // Include auth headers in the request
      const headers = {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      };

      const response = await fetch('http://10.0.2.2/wesshacks/api/houses.php', {
        headers
      });
      
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

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      // Navigation is handled automatically by the Navigation component
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Navigate to house details
  const handleViewHouse = (house) => {
    navigation.navigate('HouseDetail', { house });
  };

  // Render each house item in the FlatList
  const renderHouse = ({ item }) => {
    return (
      <TouchableOpacity onPress={() => handleViewHouse(item)}>
        <View style={styles.houseContainer}>
          <Text style={styles.houseTitle}>{item.street_address}</Text>
          <Text style={styles.houseInfo}>Capacity: {item.capacity}</Text>
          <Text style={styles.houseInfo}>Bathrooms: {item.bathrooms}</Text>
          <Text style={styles.houseInfo}>Avg Rating: {item.avg_rating} ⭐</Text>
          <Text style={styles.houseInfo}>Reviews: {item.reviews_count}</Text>
          <Text style={styles.houseInfo}>
            Quiet Street: {item.is_quiet == 1 ? 'Yes' : 'No'}
          </Text>
          <View style={styles.viewDetailsContainer}>
            <Text style={styles.viewDetailsText}>Tap to view details & reviews</Text>
          </View>
        </View>
      </TouchableOpacity>
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
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Houses on Campus</Text>
        <View style={styles.userContainer}>
          <Text style={styles.welcome}>Welcome, {user?.username || 'User'}</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
      
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
  headerContainer: {
    marginBottom: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  userContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  welcome: {
    fontSize: 16,
    color: '#333',
  },
  logoutButton: {
    backgroundColor: '#ff6b6b',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold',
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
  viewDetailsContainer: {
    marginTop: 10,
    alignItems: 'flex-end',
  },
  viewDetailsText: {
    color: '#0066cc',
    fontSize: 14,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;