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

const App = ({ navigation, route }) => {
  const [houses, setHouses] = useState([]);
  const [filteredHouses, setFilteredHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [localSearchText, setLocalSearchText] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    searchText: '',
    quietFilter: 'all',
    capacityFilter: 'all',
    bathroomFilter: 'all',
    isFiltered: false
  });
  const { user, getAuthHeader } = useAuth();

  // Handle filter changes when returning from the filter screen
  // Changed dependency array to ensure all route param changes are detected
  useEffect(() => {
    if (route.params?.filters) {
      console.log("Received filters:", route.params.filters);
      setActiveFilters(route.params.filters);
      setLocalSearchText(route.params.filters.searchText || '');
    }
  }, [route.params]); // Changed from [route.params?.filters] to [route.params]

  // Fetch houses data from your API with filter support
  const fetchHouses = async (filters = {}) => {
    try {
      setLoading(true);
      console.log("Fetching houses with filters:", filters);
      
      // Build query parameters
      let queryParams = new URLSearchParams();
      
      // Add capacity filter
      if (filters.capacityFilter && filters.capacityFilter !== 'all') {
        queryParams.append('capacity', filters.capacityFilter);
      }
      
      // Add quiet/loud filter
      if (filters.quietFilter && filters.quietFilter !== 'all') {
        queryParams.append('noise', filters.quietFilter);
      }
      
      // Add search filter
      if (filters.searchText && filters.searchText.trim() !== '') {
        queryParams.append('search', filters.searchText.trim());
      }
      
      // Add bathroom filter
      if (filters.bathroomFilter && filters.bathroomFilter !== 'all') {
        queryParams.append('bathroom', filters.bathroomFilter);
      }
      
      // Create URL with query parameters
      const url = `http://10.0.2.2/wesshacks/api/houses.php${
        queryParams.toString() ? `?${queryParams.toString()}` : ''
      }`;
      
      // Include auth headers in the request if user is logged in
      const headers = user ? {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      } : {
        'Content-Type': 'application/json'
      };

      const response = await fetch(url, {
        headers
      });
      
      const json = await response.json();
      if (json.status === 'success') {
        setHouses(json.data);
        setFilteredHouses(json.data);
        console.log(`Fetched ${json.data.length} houses`);
      }
    } catch (error) {
      console.error('Error fetching houses data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Call fetchHouses when the component mounts or filters change
  useEffect(() => {
    fetchHouses(activeFilters);
  }, [activeFilters]);

  // Refresh data when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      console.log("Screen focused, refreshing with current filters:", activeFilters);
      fetchHouses(activeFilters);
      return () => {
        // Cleanup function if needed
        console.log("Screen unfocused");
      };
    }, [activeFilters]) // Added activeFilters as dependency
  );

  // Filter houses by local search text (quick search without API call)
  useEffect(() => {
    if (localSearchText.trim() === '') {
      setFilteredHouses(houses);
    } else {
      const filtered = houses.filter(house => 
        house.street_address.toLowerCase().includes(localSearchText.toLowerCase())
      );
      setFilteredHouses(filtered);
    }
  }, [localSearchText, houses]);

  // Navigate to filter screen
  const handleOpenFilter = () => {
    navigation.navigate('Filter', { currentFilters: activeFilters });
  };

  // Navigate to house details
  const handleViewHouse = (house) => {
    navigation.navigate('HouseDetail', { house });
  };

  // Clear all filters
  const handleClearFilters = () => {
    console.log("Clearing all filters");
    const clearedFilters = {
      searchText: '',
      quietFilter: 'all',
      capacityFilter: 'all',
      bathroomFilter: 'all',
      isFiltered: false
    };
    setActiveFilters(clearedFilters);
    setLocalSearchText('');
    
    // Reload houses with cleared filters
    fetchHouses(clearedFilters);
  };

  // Handle saving a house
  const handleSaveHouse = async (house) => {
    if (!user) {
      // If not logged in, prompt to go to profile tab to login
      Alert.alert(
        'Login Required',
        'You need to be logged in to save houses. Please go to the Profile tab to login.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Go to Profile',
            onPress: () => navigation.navigate('Profile'),
          },
        ]
      );
      return;
    }

    try {
      const response = await fetch('http://10.0.2.2/wesshacks/api/saved_houses.php', {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          house_address: house.street_address
        })
      });
      
      const json = await response.json();
      
      if (json.status === 'success') {
        // Update the local state to reflect the saved status
        const updatedHouses = houses.map(h => {
          if (h.street_address === house.street_address) {
            return { ...h, is_saved: true };
          }
          return h;
        });
        
        setHouses(updatedHouses);
        
        // Also update filtered houses
        const updatedFiltered = filteredHouses.map(h => {
          if (h.street_address === house.street_address) {
            return { ...h, is_saved: true };
          }
          return h;
        });
        
        setFilteredHouses(updatedFiltered);
        
        Alert.alert('Success', 'House saved to your profile');
      } else {
        Alert.alert('Error', json.message || 'Failed to save house');
      }
    } catch (error) {
      console.error('Error saving house:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  // Handle unsaving a house
  const handleUnsaveHouse = async (house) => {
    try {
      const response = await fetch(`http://10.0.2.2/wesshacks/api/saved_houses.php?house=${encodeURIComponent(house.street_address)}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });
      
      const json = await response.json();
      
      if (json.status === 'success') {
        // Update the local state to reflect the unsaved status
        const updatedHouses = houses.map(h => {
          if (h.street_address === house.street_address) {
            return { ...h, is_saved: false };
          }
          return h;
        });
        
        setHouses(updatedHouses);
        
        // Also update filtered houses
        const updatedFiltered = filteredHouses.map(h => {
          if (h.street_address === house.street_address) {
            return { ...h, is_saved: false };
          }
          return h;
        });
        
        setFilteredHouses(updatedFiltered);
        
        Alert.alert('Success', 'House removed from your saved list');
      } else {
        Alert.alert('Error', json.message || 'Failed to unsave house');
      }
    } catch (error) {
      console.error('Error unsaving house:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  // Generate a label for active filters
  const getActiveFiltersLabel = () => {
    const filters = [];
    
    if (activeFilters.quietFilter !== 'all') {
      filters.push(activeFilters.quietFilter === 'quiet' ? 'Quiet' : 'Non-Quiet');
    }
    
    if (activeFilters.capacityFilter !== 'all') {
      filters.push(`${activeFilters.capacityFilter} Rooms`);
    }
    
    if (activeFilters.bathroomFilter !== 'all') {
      filters.push(`${activeFilters.bathroomFilter} Baths`);
    }
    
    if (activeFilters.searchText) {
      filters.push(`"${activeFilters.searchText}"`);
    }
    
    return filters.length > 0 ? `Filters: ${filters.join(', ')}` : '';
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Houses on Campus</Text>
        </View>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Quick search by address..."
            value={localSearchText}
            onChangeText={setLocalSearchText}
            clearButtonMode="while-editing"
          />
          
          <TouchableOpacity 
            style={styles.filterButton} 
            onPress={handleOpenFilter}
          >
            <Text style={styles.filterButtonText}>Filters</Text>
          </TouchableOpacity>
        </View>
        
        {/* Display active filters if any */}
        {activeFilters.isFiltered && (
          <View style={styles.activeFiltersContainer}>
            <Text style={styles.activeFiltersText}>
              {getActiveFiltersLabel()}
            </Text>
            
            <TouchableOpacity onPress={handleClearFilters}>
              <Text style={styles.clearFiltersText}>Clear All</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Show filtered count */}
        <Text style={styles.resultsCount}>
          {filteredHouses.length} {filteredHouses.length === 1 ? 'house' : 'houses'} found
        </Text>
        
        <FlatList
          data={filteredHouses}
          renderItem={renderHouse}
          keyExtractor={(item) => item.street_address}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No houses match your filters</Text>
              <TouchableOpacity 
                style={styles.resetButton}
                onPress={handleClearFilters}
              >
                <Text style={styles.resetButtonText}>Reset Filters</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
  
  // Render each house item in the FlatList
  function renderHouse({ item }) {
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
        </TouchableOpacity>
        
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={styles.viewDetailsButton}
            onPress={() => handleViewHouse(item)}
          >
            <Text style={styles.viewDetailsText}>View Details</Text>
          </TouchableOpacity>
          
          {user && (
            <TouchableOpacity 
              style={[
                styles.saveButton,
                item.is_saved ? styles.unsaveButton : styles.saveButton
              ]}
              onPress={() => item.is_saved ? handleUnsaveHouse(item) : handleSaveHouse(item)}
            >
              <Text style={styles.saveButtonText}>
                {item.is_saved ? 'Unsave' : 'Save'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };
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
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
  },
  filterButton: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  filterButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  activeFiltersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    marginBottom: 10,
  },
  activeFiltersText: {
    fontSize: 14,
    color: '#555',
    flex: 1,
  },
  clearFiltersText: {
    color: '#0066cc',
    fontWeight: 'bold',
    fontSize: 14,
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
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  viewDetailsButton: {
    backgroundColor: '#0066cc',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
    alignItems: 'center',
  },
  viewDetailsText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
    alignItems: 'center',
  },
  unsaveButton: {
    backgroundColor: '#ff6b6b',
  },
  saveButtonText: {
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
  resetButton: {
    backgroundColor: '#0066cc',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  resetButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default App;