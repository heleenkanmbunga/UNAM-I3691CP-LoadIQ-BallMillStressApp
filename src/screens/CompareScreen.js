// CompareScreen.js
// Comparative stress analysis across all 4 materials simultaneously
// Load IQ | UNAM I3691CP | Semester 1, 2026

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { MATERIALS, calculateStress, classifyStress } from '../utils/stressCalculator';

export default function CompareScreen() {
  const [mass, setMass] = useState('');
  const [area, setArea] = useState('');
  const [results, setResults] = useState(null);

  function handleCompare() {
    const m = parseFloat(mass);
    const a = parseFloat(area);

    if (!mass || !area || isNaN(m) || isNaN(a)) {
      Alert.alert('Input Error', 'Please enter valid numeric values.');
      return;
    }
    if (m <= 0 || a <= 0) {
      Alert.alert('Input Error', 'Values must be greater than 0.');
      return;
    }

    const { force, stressMPa } = calculateStress(m, a);
    const comparisons = Object.keys(MATERIALS).map(material => {
      const { status, color } = classifyStress(stressMPa, material);
      const mat = MATERIALS[material];
      const safetyMargin = ((mat.yieldStrength - stressMPa) / mat.yieldStrength * 100).toFixed(1);
      return { material, status, color, stressMPa, safetyMargin, mat };
    });

    setResults({ force, stressMPa, comparisons });
  }

  function handleReset() {
    setMass('');
    setArea('');
    setResults(null);
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>⚖️ Compare Materials</Text>
        <Text style={styles.subtitle}>
          Enter load and area once to compare stress across all 4 materials simultaneously
        </Text>

        <Text style={styles.label}>Load Mass (kg)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 5000"
          placeholderTextColor="#aaa"
          value={mass}
          onChangeText={setMass}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Cross-sectional Area (m²)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 0.05"
          placeholderTextColor="#aaa"
          value={area}
          onChangeText={setArea}
          keyboardType="numeric"
        />

        <TouchableOpacity style={styles.button} onPress={handleCompare}>
          <Text style={styles.buttonText}>⚖️ Compare All Materials</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>

        {results && (
          <View>
            <View style={styles.summaryCard}>
              <Text style={styles.cardTitle}>Input Summary</Text>
              <Row label="Load Mass" value={`${mass} kg`} />
              <Row label="Area" value={`${area} m²`} />
              <Row label="Force (F = m × g)" value={`${results.force.toFixed(2)} N`} />
              <Row label="Stress (σ = F / A)" value={`${results.stressMPa.toFixed(4)} MPa`} />
            </View>

            <Text style={styles.sectionTitle}>Material Comparison Results</Text>

            {results.comparisons.map((item, index) => (
              <View key={index} style={[styles.materialCard, { borderLeftColor: item.color, borderLeftWidth: 4 }]}>
                <View style={styles.materialHeader}>
                  <Text style={styles.materialName}>{item.material}</Text>
                  <View style={[styles.badge, { backgroundColor: item.color }]}>
                    <Text style={styles.badgeText}>{item.status}</Text>
                  </View>
                </View>
                <Row label="Yield Strength" value={`${item.mat.yieldStrength} MPa`} />
                <Row label="Warning Threshold" value={`${item.mat.warningThreshold} MPa`} />
                <Row label="Calculated Stress" value={`${item.stressMPa.toFixed(4)} MPa`} />
                <Row label="Safety Margin" value={`${item.safetyMargin}%`} />

                <View style={styles.barContainer}>
                  <View style={styles.barBackground}>
                    <View style={[styles.barFill, {
                      width: `${Math.min((item.stressMPa / item.mat.yieldStrength) * 100, 100)}%`,
                      backgroundColor: item.color
                    }]} />
                  </View>
                  <Text style={styles.barLabel}>
                    {Math.min((item.stressMPa / item.mat.yieldStrength) * 100, 100).toFixed(1)}% of yield strength
                  </Text>
                </View>
              </View>
            ))}

            <View style={styles.recommendationCard}>
              <Text style={styles.cardTitle}>🏆 Recommendation</Text>
              <Text style={styles.recommendationText}>
                {results.comparisons.filter(r => r.status === 'SAFE').length > 0
                  ? `For this load (${mass} kg) and area (${area} m²), the following materials are SAFE: ${results.comparisons.filter(r => r.status === 'SAFE').map(r => r.material.split('(')[0].trim()).join(', ')}.`
                  : `⚠️ No material is SAFE for this load and area combination. Consider increasing the cross-sectional area or reducing the load.`
                }
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
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
  title: { fontSize: 24, fontWeight: 'bold', color: '#FF9800', marginBottom: 4 },
  subtitle: { fontSize: 12, color: '#aaa', marginBottom: 24, lineHeight: 18 },
  label: { color: '#aaa', marginBottom: 6, fontSize: 14 },
  input: { backgroundColor: '#1E1E1E', color: '#fff', borderRadius: 8, padding: 14, marginBottom: 16, fontSize: 16, borderWidth: 1, borderColor: '#333' },
  button: { backgroundColor: '#FF9800', borderRadius: 8, padding: 16, alignItems: 'center', marginBottom: 12 },
  buttonText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
  resetButton: { borderWidth: 1, borderColor: '#555', borderRadius: 8, padding: 16, alignItems: 'center', marginBottom: 20 },
  resetText: { color: '#aaa', fontWeight: 'bold', fontSize: 16 },
  summaryCard: { backgroundColor: '#1E1E1E', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#333' },
  cardTitle: { color: '#FF9800', fontWeight: 'bold', fontSize: 15, marginBottom: 12 },
  sectionTitle: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginBottom: 12 },
  materialCard: { backgroundColor: '#1E1E1E', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#333' },
  materialHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  materialName: { color: '#fff', fontWeight: 'bold', fontSize: 13, flex: 1 },
  badge: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { color: '#fff', fontWeight: 'bold', fontSize: 11 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#2a2a2a' },
  rowLabel: { color: '#aaa', fontSize: 13 },
  rowValue: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  barContainer: { marginTop: 10 },
  barBackground: { height: 8, backgroundColor: '#2a2a2a', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4 },
  barLabel: { color: '#aaa', fontSize: 11, marginTop: 4 },
  recommendationCard: { backgroundColor: '#1E2A1E', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#4CAF50' },
  recommendationText: { color: '#ccc', fontSize: 13, lineHeight: 20 },
});