// ProfileScreen.js
// User profile with calculation statistics
// Load IQ | UNAM I3691CP | Semester 1, 2026

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator, TouchableOpacity, Alert
} from 'react-native';
import { getCalculations } from '../services/firestoreService';
import { auth } from '../services/firebaseConfig';
import { logoutUser } from '../services/authService';

export default function ProfileScreen() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    try {
      const data = await getCalculations(auth.currentUser.uid);
      setRecords(data);
    } catch (e) {
      Alert.alert('Error', 'Could not load profile data.');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await logoutUser();
    } catch (e) {
      console.log(e);
    }
  }

  const safe = records.filter(r => r.status === 'SAFE').length;
  const warning = records.filter(r => r.status === 'WARNING').length;
  const critical = records.filter(r => r.status === 'CRITICAL').length;
  const total = records.length;
  const avgStress = total > 0
    ? (records.reduce((sum, r) => sum + parseFloat(r.stress), 0) / total).toFixed(4)
    : '0.0000';

  const mostUsedMaterial = total > 0
    ? Object.entries(
        records.reduce((acc, r) => {
          acc[r.material] = (acc[r.material] || 0) + 1;
          return acc;
        }, {})
      ).sort((a, b) => b[1] - a[1])[0][0]
    : 'N/A';

  if (loading) return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color="#FF9800" />
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>👤 Profile</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Account</Text>
        <Row label="Email" value={auth.currentUser?.email} />
        <Row label="User ID" value={auth.currentUser?.uid?.substring(0, 12) + '...'} />
        <Row label="Member Since" value={auth.currentUser?.metadata?.creationTime?.split(' ').slice(0,4).join(' ') || 'N/A'} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📊 Calculation Statistics</Text>
        <Row label="Total Calculations" value={total.toString()} />
        <Row label="Average Stress" value={`${avgStress} MPa`} />
        <Row label="Most Used Material" value={mostUsedMaterial} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🛡️ Safety Summary</Text>
        <View style={styles.statRow}>
          <View style={[styles.statBox, { borderColor: '#4CAF50' }]}>
            <Text style={[styles.statNumber, { color: '#4CAF50' }]}>{safe}</Text>
            <Text style={styles.statLabel}>SAFE</Text>
          </View>
          <View style={[styles.statBox, { borderColor: '#FF9800' }]}>
            <Text style={[styles.statNumber, { color: '#FF9800' }]}>{warning}</Text>
            <Text style={styles.statLabel}>WARNING</Text>
          </View>
          <View style={[styles.statBox, { borderColor: '#F44336' }]}>
            <Text style={[styles.statNumber, { color: '#F44336' }]}>{critical}</Text>
            <Text style={styles.statLabel}>CRITICAL</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>ℹ️ App Info</Text>
        <Row label="App Name" value="Load IQ" />
        <Row label="Version" value="1.0.0" />
        <Row label="Module" value="I3691CP" />
        <Row label="Institution" value="UNAM JEDS Campus" />
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  content: { padding: 24 },
  centered: { flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FF9800', marginBottom: 24 },
  card: { backgroundColor: '#1E1E1E', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#333' },
  cardTitle: { color: '#FF9800', fontWeight: 'bold', fontSize: 15, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#2a2a2a' },
  rowLabel: { color: '#aaa', fontSize: 13 },
  rowValue: { color: '#fff', fontSize: 13, fontWeight: 'bold', flex: 1, textAlign: 'right' },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  statBox: { flex: 1, margin: 4, borderWidth: 2, borderRadius: 10, padding: 12, alignItems: 'center' },
  statNumber: { fontSize: 28, fontWeight: 'bold' },
  statLabel: { color: '#aaa', fontSize: 11, marginTop: 4 },
  logoutButton: { borderWidth: 1, borderColor: '#F44336', borderRadius: 8, padding: 16, alignItems: 'center', marginBottom: 24 },
  logoutText: { color: '#F44336', fontWeight: 'bold', fontSize: 16 },
});