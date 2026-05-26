import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, ScrollView
} from 'react-native';
import { saveCalculation } from '../services/firestoreService';
import { auth } from '../services/firebaseConfig';
import { MATERIALS } from '../utils/stressCalculator';

export default function ResultScreen({ route, navigation }) {
  const { material, mass, area, force, stressMPa, status, color } = route.params;
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const matInfo = MATERIALS[material];
  const safetyMargin = matInfo ? ((matInfo.yieldStrength - stressMPa) / matInfo.yieldStrength * 100).toFixed(1) : null;

  async function handleSave() {
    setSaving(true);
    try {
      await saveCalculation(auth.currentUser.uid, {
        material, load: mass, area, force,
        stress: stressMPa, status,
      });
      setSaved(true);
      Alert.alert('Saved!', 'Calculation saved to your history.');
    } catch (e) {
      Alert.alert('Error', 'Could not save. Check your connection.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Result</Text>

      <View style={[styles.statusBadge, { backgroundColor: color }]}>
        <Text style={styles.statusText}>{status}</Text>
        <Text style={styles.statusSub}>
          {status === 'SAFE' ? 'Structure is safe to operate' :
           status === 'WARNING' ? 'Monitor closely — approaching limit' :
           'Immediate action required!'}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Calculation Breakdown</Text>
        <Row label="Material" value={material} />
        <Row label="Load Mass" value={`${mass} kg`} />
        <Row label="Area" value={`${area} m²`} />
        <Row label="Force (F = m × g)" value={`${force.toFixed(2)} N`} />
        <Row label="Stress (σ = F / A)" value={`${stressMPa.toFixed(4)} MPa`} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Material Thresholds</Text>
        <Row label="Warning Threshold" value={`${matInfo.warningThreshold} MPa`} />
        <Row label="Yield Strength" value={`${matInfo.yieldStrength} MPa`} />
        <Row label="Safety Margin" value={`${safetyMargin}%`} />
      </View>

      {saving ? (
        <ActivityIndicator size="large" color="#FF9800" style={{ marginTop: 24 }} />
      ) : (
        <TouchableOpacity
          style={[styles.button, saved && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={saved}
        >
          <Text style={styles.buttonText}>{saved ? '✓ Saved to History' : 'Save to History'}</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.outlineButton} onPress={() => navigation.navigate('Calculate')}>
        <Text style={styles.outlineButtonText}>New Calculation</Text>
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
  title: { fontSize: 24, fontWeight: 'bold', color: '#FF9800', marginBottom: 24 },
  statusBadge: {
    borderRadius: 12, padding: 20, alignItems: 'center', marginBottom: 24
  },
  statusText: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  statusSub: { fontSize: 13, color: '#fff', marginTop: 4, opacity: 0.9 },
  card: {
    backgroundColor: '#1E1E1E', borderRadius: 12, padding: 16,
    marginBottom: 16, borderWidth: 1, borderColor: '#333'
  },
  cardTitle: { color: '#FF9800', fontWeight: 'bold', fontSize: 15, marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#2a2a2a' },
  rowLabel: { color: '#aaa', fontSize: 14 },
  rowValue: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  button: { backgroundColor: '#FF9800', borderRadius: 8, padding: 16, alignItems: 'center', marginBottom: 12 },
  buttonDisabled: { backgroundColor: '#4CAF50' },
  buttonText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
  outlineButton: { borderWidth: 1, borderColor: '#FF9800', borderRadius: 8, padding: 16, alignItems: 'center' },
  outlineButtonText: { color: '#FF9800', fontWeight: 'bold', fontSize: 16 },
});