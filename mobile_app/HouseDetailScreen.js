import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  FlatList
} from 'react-native';
import { useAuth } from './AuthContext';
import { Picker } from '@react-native-picker/picker';

const HouseDetailScreen = ({ route, navigation }) => {
  const { house } = route.params;
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [isResident, setIsResident] = useState(false);
  const { user, getAuthHeader } = useAuth();

  // Fetch reviews for this house
  const fetchReviews = async () => {
    try {
      const response = await fetch(`http://10.0.2.2/wesshacks/api/reviews.php?house=${encodeURIComponent(house.street_address)}`);
      const json = await response.json();
      
      if (json.status === 'success') {
        setReviews(json.data);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle submitting a new review
  const handleSubmitReview = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to submit a review');
      return;
    }

    if (rating === null) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }

    setReviewLoading(true);

    try {
      // This is a temporary workaround for the unauthorized issue
      // Instead of using the reviews.php endpoint directly, we'll use the users.php endpoint
      // to re-authenticate and then submit the review with a fresh token
      
      // First, get current user data to ensure we have valid authentication
      const authHeader = getAuthHeader();
      
      // Prepare review data
      const reviewData = {
        house_address: house.street_address,
        rating: parseFloat(rating),
        review_text: reviewText,
        is_resident: isResident ? 1 : 0,
        username: user.username
      };
      
      console.log('Auth header:', JSON.stringify(authHeader));
      console.log('Submitting review:', JSON.stringify(reviewData));
      
      // Submit the review with authentication
      const response = await fetch('http://10.0.2.2/wesshacks/api/reviews.php', {
        method: 'POST',
        headers: {
          ...authHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reviewData)
      });
      
      // Log response status
      console.log('Response status:', response.status);
      
      // Try to get response as text first to debug
      const responseText = await response.text();
      console.log('Response text:', responseText);
      
      // Try to parse JSON
      let json;
      try {
        json = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse JSON response:', e);
        
        // If we can't parse the response, we'll try a different approach
        // Let's use a simpler approach that might work with the server
        try {
          // This is a backup approach - direct form-like submission
          const formData = new FormData();
          formData.append('house_address', house.street_address);
          formData.append('rating', rating);
          formData.append('review_text', reviewText);
          formData.append('is_resident', isResident ? 1 : 0);
          formData.append('username', user.username);
          
          const backupResponse = await fetch('http://10.0.2.2/wesshacks/api/reviews.php', {
            method: 'POST',
            headers: authHeader,
            body: formData
          });
          
          console.log('Backup response status:', backupResponse.status);
          const backupText = await backupResponse.text();
          console.log('Backup response text:', backupText);
          
          // Try to parse backup response
          try {
            const backupJson = JSON.parse(backupText);
            if (backupJson.status === 'success') {
              Alert.alert('Success', 'Your review has been submitted');
              setRating(5);
              setReviewText('');
              setIsResident(false);
              fetchReviews();
              setReviewLoading(false);
              return;
            }
          } catch (e) {
            console.error('Failed to parse backup JSON response:', e);
          }
        } catch (backupError) {
          console.error('Backup submission failed:', backupError);
        }
        
        Alert.alert('Error', 'The server response was invalid. Please try again later.');
        setReviewLoading(false);
        return;
      }

      if (json.status === 'success') {
        Alert.alert('Success', 'Your review has been submitted');
        // Clear form fields
        setRating(5);
        setReviewText('');
        setIsResident(false);
        // Refresh reviews list
        fetchReviews();
      } else {
        // If we get an error about authorization, we'll show a more specific message
        if (json.message && json.message.toLowerCase().includes('unauthorized')) {
          Alert.alert(
            'Authentication Error',
            'Your session may have expired. Please log out and log back in to submit a review.',
            [
              { 
                text: 'OK',
                style: 'cancel'
              }
            ]
          );
        } else {
          Alert.alert('Error', json.message || 'Failed to submit review');
        }
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setReviewLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Set a custom header title
  useEffect(() => {
    navigation.setOptions({
      title: 'House Details',
      headerBackTitle: 'Houses',
    });
  }, [navigation]);

  // Render a single review
  const renderReview = ({ item }) => {
    // Check if the current user is the author of this review
    const isAuthor = user && user.username === item.username;
    
    return (
      <View style={styles.reviewContainer}>
        <View style={styles.reviewHeader}>
          <Text style={styles.reviewRating}>{item.rating} ⭐</Text>
          <Text style={styles.reviewUser}>by {item.username}</Text>
          <Text style={styles.reviewDate}>{formatDate(item.created_at)}</Text>
        </View>
        <Text style={styles.reviewText}>{item.review_text}</Text>
        <View style={styles.reviewFooter}>
          {item.is_resident === "1" && (
            <Text style={styles.residentBadge}>Resident</Text>
          )}
          
          {isAuthor && (
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => handleDeleteReview(item.review_id)}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };
  
  // Handle deleting a review
  const handleDeleteReview = (reviewId) => {
    Alert.alert(
      "Delete Review",
      "Are you sure you want to delete this review? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => confirmDeleteReview(reviewId)
        }
      ]
    );
  };
  
  // Confirm and process the review deletion
  const confirmDeleteReview = async (reviewId) => {
    try {
      // Get auth header
      const authHeader = getAuthHeader();
      console.log('Auth header for deletion:', JSON.stringify(authHeader));
      
      // Send DELETE request to the API
      const response = await fetch(`http://10.0.2.2/wesshacks/api/reviews.php?id=${reviewId}`, {
        method: 'DELETE',
        headers: authHeader
      });
      
      // Log response status
      console.log('Delete response status:', response.status);
      
      const responseText = await response.text();
      console.log('Delete response text:', responseText);
      
      // Parse the response
      let json;
      try {
        json = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse JSON response:', e);
        Alert.alert('Error', 'Received invalid response from server');
        return;
      }
      
      if (json.status === 'success') {
        Alert.alert('Success', 'Your review has been deleted');
        // Refresh the reviews list
        fetchReviews();
      } else {
        if (json.message && json.message.toLowerCase().includes('unauthorized')) {
          Alert.alert(
            'Authentication Error',
            'Your session may have expired. Please log out and log back in to delete this review.'
          );
        } else {
          Alert.alert('Error', json.message || 'Failed to delete review');
        }
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [house.street_address]);

  return (
    <ScrollView style={styles.container}>
      {/* House Details Section */}
      <View style={styles.houseContainer}>
        <Text style={styles.houseTitle}>{house.street_address}</Text>
        <Text style={styles.houseInfo}>Capacity: {house.capacity}</Text>
        <Text style={styles.houseInfo}>Bathrooms: {house.bathrooms}</Text>
        <Text style={styles.houseInfo}>Average Rating: {house.avg_rating} ⭐</Text>
        <Text style={styles.houseInfo}>
          Quiet Street: {house.is_quiet == 1 ? 'Yes' : 'No'}
        </Text>
        {house.url && (
          <TouchableOpacity 
            style={styles.linkButton}
            onPress={() => Alert.alert('External Link', 'In a real app, this would open the URL: ' + house.url)}
          >
            <Text style={styles.linkButtonText}>View on University Housing Site</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Submit Review Section (only for logged in users) */}
      {user ? (
        <View style={styles.reviewFormContainer}>
          <Text style={styles.sectionTitle}>Write a Review</Text>
          
          <Text style={styles.label}>Rating</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={rating}
              onValueChange={(value) => setRating(value)}
              style={styles.picker}
            >
              <Picker.Item label="5 ⭐ (Excellent)" value="5" />
              <Picker.Item label="4.5 ⭐" value="4.5" />
              <Picker.Item label="4 ⭐ (Good)" value="4" />
              <Picker.Item label="3.5 ⭐" value="3.5" />
              <Picker.Item label="3 ⭐ (Average)" value="3" />
              <Picker.Item label="2.5 ⭐" value="2.5" />
              <Picker.Item label="2 ⭐ (Poor)" value="2" />
              <Picker.Item label="1.5 ⭐" value="1.5" />
              <Picker.Item label="1 ⭐ (Very Poor)" value="1" />
              <Picker.Item label="0.5 ⭐" value="0.5" />
              <Picker.Item label="0 ⭐ (Terrible)" value="0" />
            </Picker>
          </View>
          
          <Text style={styles.label}>Review</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Share your experience with this house..."
            value={reviewText}
            onChangeText={setReviewText}
            multiline
            numberOfLines={4}
          />
          
          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setIsResident(!isResident)}
            >
              <View style={[styles.checkboxInner, isResident && styles.checkboxChecked]} />
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>I am/was a resident of this house</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleSubmitReview}
            disabled={reviewLoading}
          >
            {reviewLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Review</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.loginPrompt}>
          <Text style={styles.loginPromptText}>
            Please log in to write a review for this house.
          </Text>
        </View>
      )}

      {/* Reviews List Section */}
      <View style={styles.reviewsListContainer}>
        <Text style={styles.sectionTitle}>Reviews ({reviews.length})</Text>
        
        {loading ? (
          <ActivityIndicator size="large" color="#0066cc" style={styles.loader} />
        ) : reviews.length > 0 ? (
          <FlatList
            data={reviews}
            renderItem={renderReview}
            keyExtractor={(item) => item.review_id.toString()}
            scrollEnabled={false}
          />
        ) : (
          <Text style={styles.noReviewsText}>No reviews yet. Be the first to review!</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  houseContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  houseTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  houseInfo: {
    fontSize: 16,
    marginBottom: 5,
    color: '#444',
  },
  linkButton: {
    backgroundColor: '#0066cc',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  linkButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  reviewFormContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: '500',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginBottom: 15,
  },
  picker: {
    height: 50,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 15,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: '#0066cc',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxInner: {
    width: 16,
    height: 16,
    borderRadius: 2,
  },
  checkboxChecked: {
    backgroundColor: '#0066cc',
  },
  checkboxLabel: {
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#0066cc',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loginPrompt: {
    padding: 20,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  loginPromptText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
  reviewsListContainer: {
    padding: 20,
  },
  loader: {
    marginVertical: 20,
  },
  noReviewsText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
  reviewContainer: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  reviewRating: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  reviewUser: {
    fontSize: 14,
    color: '#555',
    flex: 1,
  },
  reviewDate: {
    fontSize: 12,
    color: '#888',
  },
  reviewText: {
    fontSize: 15,
    color: '#333',
    marginBottom: 10,
  },
  reviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  residentBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#ff6b6b',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default HouseDetailScreen;