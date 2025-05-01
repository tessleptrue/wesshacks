import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert
} from 'react-native';
import { useAuth } from './AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ProfileScreen = ({ navigation }) => {
  const [savedHouses, setSavedHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filteredHouses, setFilteredHouses] = useState([]);
  const { user, getAuthHeader, logout } = useAuth();

  // Fetch saved houses from API
  const fetchSavedHouses = async () => {
    try {
      setLoading(true);
      
      // Get auth header
      const headers = {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      };

      const response = await fetch('http://10.0.2.2/wesshacks/api/saved_houses.php', {
        headers
      });
      
      const json = await response.json();
      if (json.status === 'success') {
        setSavedHouses(json.data);
        setFilteredHouses(json.data);
      } else {
        console.error('Error fetching saved houses:', json.message);
      }
    } catch (error) {
      console.error('Error fetching saved houses:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get data when the component mounts and when it's focused
  useEffect(() => {
    fetchSavedHouses();
  }, []);

  // Refresh data when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      fetchSavedHouses();
    }, [])
  );

  // Filter houses by search text
  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredHouses(savedHouses);
    } else {
      const filtered = savedHouses.filter(house => 
        house.street_address.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredHouses(filtered);
    }
  }, [searchText, savedHouses]);

  // Navigate to house details
  const handleViewHouse = (house) => {
    navigation.navigate('HouseDetail', { house });
  };

  // Handle logging out
  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          onPress: async () => {
            try {
              await logout();
              // Navigation to login is handled by the Navigation component
            } catch (error) {
              console.error('Error logging out:', error);
              Alert.alert('Error', 'Something went wrong. Please try again.');
            }
          }
        }
      ]
    );
  };

  // Handle unsaving a house
  const handleUnsaveHouse = async (house) => {
    Alert.alert(
      "Unsave House",
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
              const response = await fetch(`http://10.0.2.2/wesshacks/api/saved_houses.php?house=${encodeURIComponent(house.street_address)}`, {
                method: 'DELETE',
                headers: getAuthHeader()
              });
              
              const json = await response.json();
              
              if (json.status === 'success') {
                // Remove from state
                setSavedHouses(prevHouses => 
                  prevHouses.filter(h => h.street_address !== house.street_address)
                );
              } else {
                Alert.alert('Error', json.message || 'Failed to unsave house');
              }
            } catch (error) {
              console.error('Error unsaving house:', error);
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
        <Text style={styles.houseTitle}>{item.street_address}</Text>
        <Text style={styles.houseInfo}>Capacity: {item.capacity}</Text>
        <Text style={styles.houseInfo}>Bathrooms: {item.bathrooms}</Text>
        <Text style={styles.houseInfo}>Avg Rating: {item.avg_rating} ⭐</Text>
        <Text style={styles.houseInfo}>Reviews: {item.reviews_count}</Text>
        <Text style={styles.houseInfo}>
          Quiet Street: {item.is_quiet == 1 ? 'Yes' : 'No'}
        </Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.viewButton}
            onPress={() => handleViewHouse(item)}
          >
            <Text style={styles.viewButtonText}>View Details</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.unsaveButton}
            onPress={() => handleUnsaveHouse(item)}
          >
            <Text style={styles.unsaveButtonText}>Unsave</Text>
          </TouchableOpacity>
        </View>
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
        {/* Header with Logout Button in Top Right */}
        <View style={styles.headerContainer}>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.header}>Your Profile</Text>
            <Text style={styles.welcome}>Hello, {user?.username || 'User'}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <MaterialCommunityIcons name="logout" size={18} color="white" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search saved houses..."
            value={searchText}
            onChangeText={setSearchText}
            clearButtonMode="while-editing"
          />
        </View>
        
        <Text style={styles.savedHousesTitle}>
          Saved Houses ({filteredHouses.length})
        </Text>
        
        {filteredHouses.length > 0 ? (
          <FlatList
            data={filteredHouses}
            renderItem={renderHouse}
            keyExtractor={(item) => item.street_address}
            contentContainerStyle={styles.listContainer}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {savedHouses.length > 0 
                ? 'No houses match your search' 
                : 'You haven\'t saved any houses yet'}
            </Text>
            {savedHouses.length === 0 && (
              <TouchableOpacity 
                style={styles.browseButton}
                onPress={() => navigation.navigate('Home')}
              >
                <Text style={styles.browseButtonText}>Browse Houses</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerTitleContainer: {
    flex: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  welcome: {
    fontSize: 16,
    color: '#333',
  },
  logoutButton: {
    backgroundColor: '#ff6b6b',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 4,
  },
  savedHousesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
  },
  searchContainer: {
    marginBottom: 15,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  viewButton: {
    backgroundColor: '#0066cc',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
    alignItems: 'center',
  },
  viewButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  unsaveButton: {
    backgroundColor: '#ff6b6b',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
    alignItems: 'center',
  },
  unsaveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  browseButton: {
    backgroundColor: '#0066cc',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  browseButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ProfileScreen;