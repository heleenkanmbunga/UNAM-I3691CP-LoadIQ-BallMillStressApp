import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, RefreshControl, TextInput
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getCalculations, deleteCalculation } from '../services/firestoreService';
import { auth } from '../services/firebaseConfig';

export default function HistoryScreen() {
  const [records, setRecords] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');

  async function fetchRecords() {
    try {
      const data = await getCalculations(auth.currentUser.uid);
      setRecords(data);
      applyFilter(data, activeFilter, search);
    } catch (e) {
      Alert.alert('Error', 'Unable to load history. Check connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useFocusEffect(useCallback(() => { fetchRecords(); }, []));

  function applyFilter(data, filter, searchText) {
    let result = data;
    if (filter !== 'ALL') {
      result = result.filter(r => r.status === filter);
    }
    if (searchText) {
      result = result.filter(r =>
        r.material.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    setFiltered(result);
  }

  function handleFilterChange(filter) {
    setActiveFilter(filter);
    applyFilter(records, filter, search);
  }

  function handleSearch(text) {
    setSearch(text);
    applyFilter(records, activeFilter, text);
  }

  async function handleDelete(id) {
    Alert.alert('Delete', 'Are you sure you want to delete this record?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await deleteCalculation(id);
            const updated = records.filter(r => r.id !== id);
            setRecords(updated);
            applyFilter(updated, activeFilter, search);
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

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search by material..."
        placeholderTextColor="#aaa"
        value={search}
        onChangeText={handleSearch}
      />

      <View style={styles.filterRow}>
        {['ALL', 'SAFE', 'WARNING', 'CRITICAL'].map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, activeFilter === f && styles.filterBtnActive]}
            onPress={() => handleFilterChange(f)}
          >
            <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.countText}>{filtered.length} record{filtered.length !== 1 ? 's' : ''} found</Text>

      {filtered.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No calculations match your filter.{'\n'}Try a different search or filter!</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 16 },
  centered: { flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#aaa', textAlign: 'center', fontSize: 16, lineHeight: 24 },
  searchInput: {
    backgroundColor: '#1E1E1E', color: '#fff', borderRadius: 8,
    padding: 12, marginBottom: 12, fontSize: 14, borderWidth: 1, borderColor: '#333'
  },
  filterRow: { flexDirection: 'row', marginBottom: 8, gap: 8 },
  filterBtn: {
    flex: 1, padding: 8, borderRadius: 6, borderWidth: 1,
    borderColor: '#333', alignItems: 'center'
  },
  filterBtnActive: { backgroundColor: '#FF9800', borderColor: '#FF9800' },
  filterText: { color: '#aaa', fontSize: 11, fontWeight: 'bold' },
  filterTextActive: { color: '#000' },
  countText: { color: '#555', fontSize: 12, marginBottom: 8 },
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