import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert
} from 'react-native';
import { useAuth } from './AuthContext';
import { useFocusEffect } from '@react-navigation/native';

const SavedHousesScreen = ({ navigation }) => {
  const [savedHouses, setSavedHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, getAuthHeader } = useAuth();

  // Fetch saved houses from API
  const fetchSavedHouses = async () => {
    try {
      setLoading(true);
      
      const url = 'http://10.0.2.2/wesshacks/api/saved_houses.php';
      
      // Include auth headers in the request
      const headers = {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      };

      const response = await fetch(url, {
        headers
      });
      
      const json = await response.json();
      if (json.status === 'success') {
        setSavedHouses(json.data);
      } else {
        console.error('Error fetching saved houses:', json.message);
      }
    } catch (error) {
      console.error('Error fetching saved houses:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh data when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      fetchSavedHouses();
    }, [])
  );

  // Navigate to house details
  const handleViewHouse = (house) => {
    navigation.navigate('HouseDetail', { house });
  };

  // Unsave a house
  const handleUnsaveHouse = async (house) => {
    Alert.alert(
      "Remove Saved House",
      `Are you sure you want to remove ${house.street_address} from your saved houses?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              const url = `http://10.0.2.2/wesshacks/api/saved_houses.php?house=${encodeURIComponent(house.street_address)}`;
              
              const response = await fetch(url, {
                method: 'DELETE',
                headers: getAuthHeader()
              });
              
              const json = await response.json();
              
              if (json.status === 'success') {
                // Remove the house from the list
                setSavedHouses(currentHouses => 
                  currentHouses.filter(item => item.street_address !== house.street_address)
                );
              } else {
                Alert.alert('Error', json.message || 'Failed to remove house');
              }
            } catch (error) {
              console.error('Error removing saved house:', error);
              Alert.alert('Error', 'Something went wrong. Please try again.');
            }
          }
        }
      ]
    );
  };

  // Render each house item in the FlatList
  const renderHouse = ({ item }) => {
    return (
      <View style={styles.houseContainer}>
        <TouchableOpacity onPress={() => handleViewHouse(item)}>
          <Text style={styles.houseTitle}>{item.street_address}</Text>
          <Text style={styles.houseInfo}>Capacity: {item.capacity}</Text>
          <Text style={styles.houseInfo}>Bathrooms: {item.bathrooms}</Text>
          <Text style={styles.houseInfo}>Avg Rating: {item.avg_rating} ⭐</Text>
          <Text style={styles.houseInfo}>Reviews: {item.reviews_count}</Text>
          <Text style={styles.houseInfo}>
            Quiet Street: {item.is_quiet == 1 ? 'Yes' : 'No'}
          </Text>
          <Text style={styles.savedDate}>Saved on: {new Date(item.saved_at).toLocaleDateString()}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.unsaveButton}
          onPress={() => handleUnsaveHouse(item)}
        >
          <Text style={styles.unsaveButtonText}>Remove</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // If loading, show a loading indicator
  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading saved houses...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Saved Houses</Text>
        </View>
        
        {/* Show saved houses count */}
        <Text style={styles.resultsCount}>
          {savedHouses.length} {savedHouses.length === 1 ? 'house' : 'houses'} saved
        </Text>
        
        <FlatList
          data={savedHouses}
          renderItem={renderHouse}
          keyExtractor={(item) => item.street_address}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>You haven't saved any houses yet</Text>
              <TouchableOpacity 
                style={styles.browseButton}
                onPress={() => navigation.navigate('Home')}
              >
                <Text style={styles.browseButtonText}>Browse Houses</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    paddingTop: 10,
    paddingHorizontal: 20,
  },
  headerContainer: {
    marginBottom: 15,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resultsCount: {
    marginBottom: 10,
    fontSize: 14,
    color: '#666',
  },
  listContainer: {
    paddingBottom: 20,
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
    marginBottom: 5,
  },
  houseInfo: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
  },
  savedDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
    fontStyle: 'italic',
  },
  unsaveButton: {
    backgroundColor: '#ff6b6b',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignSelf: 'flex-end',
    marginTop: 10,
  },
  unsaveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  browseButton: {
    backgroundColor: '#0066cc',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  browseButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default SavedHousesScreen;