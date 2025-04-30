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
  Platform
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
  const { user, logout, getAuthHeader } = useAuth();

  // Handle filter changes when returning from the filter screen
  useEffect(() => {
    if (route.params?.filters) {
      setActiveFilters(route.params.filters);
      setLocalSearchText(route.params.filters.searchText || '');
    }
  }, [route.params?.filters]);

  // Fetch houses data from your API with filter support
  const fetchHouses = async (filters = {}) => {
    try {
      setLoading(true);
      
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
      
      // Create URL with query parameters
      const url = `http://10.0.2.2/wesshacks/api/houses.php${
        queryParams.toString() ? `?${queryParams.toString()}` : ''
      }`;
      
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
        let housesData = json.data;
        
        // Apply bathroom filter client-side (if API doesn't support it)
        if (filters.bathroomFilter && filters.bathroomFilter !== 'all') {
          housesData = housesData.filter(house => house.bathrooms === filters.bathroomFilter);
        }
        
        setHouses(housesData);
        setFilteredHouses(housesData);
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
      fetchHouses(activeFilters);
    }, [])
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

  // Clear all filters
  const handleClearFilters = () => {
    setActiveFilters({
      searchText: '',
      quietFilter: 'all',
      capacityFilter: 'all',
      bathroomFilter: 'all',
      isFiltered: false
    });
    setLocalSearchText('');
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
          <View style={styles.userContainer}>
            <Text style={styles.welcome}>Welcome, {user?.username || 'User'}</Text>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
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