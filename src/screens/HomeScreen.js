import React from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, ScrollView
} from 'react-native';
import { logoutUser } from '../services/authService';
import { auth } from '../services/firebaseConfig';

export default function HomeScreen({ navigation }) {
  async function handleLogout() {
    try {
      await logoutUser();
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>⚙️ Load IQ</Text>
      <Text style={styles.subtitle}>Ball Mill Stress Analysis</Text>
      <Text style={styles.welcome}>👋 Welcome, {auth.currentUser?.email}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📋 What is this app?</Text>
        <Text style={styles.cardText}>
          Load IQ helps metallurgical engineers and technicians estimate
          compressive stress on ball mill support structures in real time.
          Select a material, enter the load and area, and get an instant
          colour-coded safety classification.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🛡️ Safety Classifications</Text>
        <View style={styles.row}>
          <View style={[styles.dot, { backgroundColor: '#4CAF50' }]} />
          <Text style={styles.cardText}>SAFE — stress below warning threshold</Text>
        </View>
        <View style={styles.row}>
          <View style={[styles.dot, { backgroundColor: '#FF9800' }]} />
          <Text style={styles.cardText}>WARNING — approaching yield strength</Text>
        </View>
        <View style={styles.row}>
          <View style={[styles.dot, { backgroundColor: '#F44336' }]} />
          <Text style={styles.cardText}>CRITICAL — at or beyond yield strength</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>⚠️ Important Notice</Text>
        <Text style={styles.cardText}>
          This app is designed for static compressive load estimation only.
          Dynamic, cyclic, and fatigue loads are out of scope. Always consult
          a qualified engineer for structural safety decisions.
        </Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Main', { screen: 'Calculate' })}>
        <Text style={styles.buttonText}>Start Calculating →</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>Load IQ v1.0 | UNAM I3691CP | Semester 1, 2026</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  content: { padding: 24 },
  title: { fontSize: 36, fontWeight: 'bold', color: '#FF9800', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#aaa', textAlign: 'center', marginBottom: 8 },
  welcome: { fontSize: 13, color: '#666', textAlign: 'center', marginBottom: 32 },
  card: {
    backgroundColor: '#1E1E1E', borderRadius: 12, padding: 16,
    marginBottom: 16, borderWidth: 1, borderColor: '#333'
  },
  cardTitle: { color: '#FF9800', fontWeight: 'bold', fontSize: 16, marginBottom: 8 },
  cardText: { color: '#ccc', fontSize: 14, lineHeight: 22 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
  button: { backgroundColor: '#FF9800', borderRadius: 8, padding: 16, alignItems: 'center', marginBottom: 12 },
  buttonText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
  logoutButton: { borderWidth: 1, borderColor: '#F44336', borderRadius: 8, padding: 16, alignItems: 'center', marginBottom: 16 },
  logoutText: { color: '#F44336', fontWeight: 'bold', fontSize: 16 },
  footer: { color: '#333', textAlign: 'center', fontSize: 11, marginBottom: 8 },
});