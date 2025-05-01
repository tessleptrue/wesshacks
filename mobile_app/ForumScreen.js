import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, Alert, ScrollView, ActivityIndicator
} from 'react-native';
import { useAuth } from './AuthContext';

const ForumScreen = () => {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState('');
  const [contact, setContact] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, getAuthHeader } = useAuth();

  const fetchPosts = async () => {
    try {
      const res = await fetch('http://10.0.2.2/wesshacks/api/forum.php');
      const json = await res.json();
      if (json.status === 'success') setPosts(json.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async () => {
    if (!title || !contact || !content) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to post.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://10.0.2.2/wesshacks/api/forum.php', {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          contact_info: contact,
          content,
          username: user.username
        })
      });
      const json = await res.json();
      if (json.status === 'success') {
        setTitle('');
        setContact('');
        setContent('');
        fetchPosts();
        Alert.alert('Success', 'Your post has been submitted.');
      } else {
        Alert.alert('Error', 'Failed to submit post.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const renderPost = ({ item }) => (
    <View style={styles.post}>
      <Text style={styles.postTitle}>{item.title}</Text>
      <Text style={styles.postUser}>Posted by: {item.username}</Text>
      <Text>{item.content}</Text>
      <Text style={styles.postContact}>Contact: {item.contact_info}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Find a Housing Group</Text>

      <TextInput
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />
      <TextInput
        placeholder="Your Contact Info"
        value={contact}
        onChangeText={setContact}
        style={styles.input}
      />
      <TextInput
        placeholder="What are you looking for?"
        value={content}
        onChangeText={setContent}
        style={[styles.input, { height: 100 }]}
        multiline
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Posting...' : 'Post'}</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Recent Posts</Text>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPost}
        scrollEnabled={false}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff' },
  heading: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  input: {
    borderWidth: 1, borderColor: '#ccc', padding: 10,
    marginBottom: 10, borderRadius: 6
  },
  button: {
    backgroundColor: '#0066cc', padding: 12, borderRadius: 6,
    alignItems: 'center', marginBottom: 20
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 10 },
  post: {
    padding: 12, borderWidth: 1, borderColor: '#ddd',
    borderRadius: 6, marginBottom: 10
  },
  postTitle: { fontWeight: 'bold', marginBottom: 4 },
  postUser: { fontStyle: 'italic', color: '#666' },
  postContact: { marginTop: 6, fontWeight: '600' }
});

export default ForumScreen;