import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, RefreshControl
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getCalculations, deleteCalculation } from '../services/firestoreService';
import { auth } from '../services/firebaseConfig';

export default function HistoryScreen() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchRecords() {
    try {
      const data = await getCalculations(auth.currentUser.uid);
      setRecords(data);
    } catch (e) {
      Alert.alert('Error', 'Unable to load history. Check connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useFocusEffect(useCallback(() => { fetchRecords(); }, []));

  async function handleDelete(id) {
    Alert.alert('Delete', 'Are you sure you want to delete this record?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await deleteCalculation(id);
            setRecords(prev => prev.filter(r => r.id !== id));
          } catch (e) {
            Alert.alert('Error', 'Could not delete record.');
          }
        }
      }
    ]);
  }

  function statusColor(status) {
    if (status === 'SAFE') return '#4CAF50';
    if (status === 'WARNING') return '#FF9800';
    return '#F44336';
  }

  if (loading) return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color="#FF9800" />
    </View>
  );

  if (records.length === 0) return (
    <View style={styles.centered}>
      <Text style={styles.emptyText}>No calculations yet.{'\n'}Go to the Calculator tab to get started!</Text>
    </View>
  );

  return (
    <FlatList
      style={styles.container}
      data={records}
      keyExtractor={item => item.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchRecords(); }} />}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.material}>{item.material}</Text>
            <View style={[styles.badge, { backgroundColor: statusColor(item.status) }]}>
              <Text style={styles.badgeText}>{item.status}</Text>
            </View>
          </View>
          <Text style={styles.detail}>Load: {item.load} kg | Area: {item.area} m²</Text>
          <Text style={styles.detail}>Stress: {Number(item.stress).toFixed(4)} MPa</Text>
          <Text style={styles.date}>
            {item.timestamp?.toDate ? item.timestamp.toDate().toLocaleString() : 'Just now'}
          </Text>
          <TouchableOpacity onPress={() => handleDelete(item.id)}>
            <Text style={styles.delete}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 16 },
  centered: { flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#aaa', textAlign: 'center', fontSize: 16, lineHeight: 24 },
  card: {
    backgroundColor: '#1E1E1E', borderRadius: 12, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: '#333'
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  material: { color: '#fff', fontWeight: 'bold', fontSize: 15, flex: 1 },
  badge: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  detail: { color: '#aaa', fontSize: 13, marginBottom: 2 },
  date: { color: '#555', fontSize: 12, marginTop: 6 },
  delete: { color: '#F44336', marginTop: 10, fontWeight: 'bold' },
});