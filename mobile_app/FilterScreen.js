import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

const FilterScreen = ({ navigation, route }) => {
  // Get current filters from route params or set defaults
  const { currentFilters = {} } = route.params || {};
  
  // Initialize state with current filters or defaults
  // Added useEffect to ensure proper initialization
  const [searchText, setSearchText] = useState('');
  const [quietFilter, setQuietFilter] = useState('all');
  const [capacityFilter, setCapacityFilter] = useState('all');
  const [bathroomFilter, setBathroomFilter] = useState('all');

  // Initialize filters from route params when component mounts
  useEffect(() => {
    console.log("Filter screen received currentFilters:", currentFilters);
    setSearchText(currentFilters.searchText || '');
    setQuietFilter(currentFilters.quietFilter || 'all');
    setCapacityFilter(currentFilters.capacityFilter || 'all');
    setBathroomFilter(currentFilters.bathroomFilter || 'all');
  }, []);

  // Apply filters and return to main screen
  const applyFilters = () => {
    const filters = {
      searchText,
      quietFilter,
      capacityFilter,
      bathroomFilter,
      isFiltered: true // Making sure this is explicitly set to true
    };
    
    // Add debug logging
    console.log("Applying filters:", filters);
    
    // Navigate back with the updated filters
    navigation.navigate('Home', {
      filters,
      timestamp: new Date().getTime() // Add timestamp to ensure params are seen as "new"
    });
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchText('');
    setQuietFilter('all');
    setCapacityFilter('all');
    setBathroomFilter('all');
  };

  // Cancel and go back without applying filters
  const cancelFilters = () => {
    console.log("Canceling filter changes");
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Filter Houses</Text>
        </View>

        {/* Search Input */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>Search by Address</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Enter street name..."
            value={searchText}
            onChangeText={setSearchText}
            clearButtonMode="while-editing"
          />
        </View>

        {/* Quiet Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>Quiet Street</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={quietFilter}
              onValueChange={(value) => setQuietFilter(value)}
              style={styles.picker}
            >
              <Picker.Item label="All Houses" value="all" />
              <Picker.Item label="Quiet Streets Only" value="quiet" />
              <Picker.Item label="Non-Quiet Streets Only" value="loud" />
            </Picker>
          </View>
        </View>

        {/* Capacity Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>Number of Rooms (Capacity)</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={capacityFilter}
              onValueChange={(value) => setCapacityFilter(value)}
              style={styles.picker}
            >
              <Picker.Item label="All Capacities" value="all" />
              <Picker.Item label="1 Person" value="1" />
              <Picker.Item label="2 People" value="2" />
              <Picker.Item label="3 People" value="3" />
              <Picker.Item label="4 People" value="4" />
              <Picker.Item label="5 People" value="5" />
              <Picker.Item label="6 People" value="6" />
            </Picker>
          </View>
        </View>

        {/* Bathroom Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>Number of Bathrooms</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={bathroomFilter}
              onValueChange={(value) => setBathroomFilter(value)}
              style={styles.picker}
            >
              <Picker.Item label="All Bathrooms" value="all" />
              <Picker.Item label="1 Bathroom" value="1" />
              <Picker.Item label="1.5 Bathrooms" value="1.5" />
              <Picker.Item label="2 Bathrooms" value="2" />
              <Picker.Item label="2.5 Bathrooms" value="2.5" />
            </Picker>
          </View>
        </View>

        {/* Button Group */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={resetFilters}
          >
            <Text style={styles.resetButtonText}>Reset Filters</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.applyButton}
            onPress={applyFilters}
          >
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
        
        {/* Added Cancel Button */}
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={cancelFilters}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    padding: 20,
  },
  headerContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  filterSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  picker: {
    height: 50,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  applyButton: {
    backgroundColor: '#0066cc',
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginLeft: 5,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resetButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginRight: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  resetButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  // Added Cancel Button Style
  cancelButton: {
    marginTop: 15,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default FilterScreen;