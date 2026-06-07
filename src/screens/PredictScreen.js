// PredictScreen.js
// AI-powered stress prediction using on-device linear regression
// Load IQ | UNAM I3691CP | Semester 1, 2026

import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator, Alert
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getCalculations } from '../services/firestoreService';
import { auth } from '../services/firebaseConfig';
import { trainModel, predict, getPredictionStatus } from '../utils/mlPredictor';
import { MATERIALS } from '../utils/stressCalculator';

export default function PredictScreen() {
  const [material, setMaterial] = useState('Mild Steel (S235)');
  const [mass, setMass] = useState('');
  const [area, setArea] = useState('');
  const [model, setModel] = useState(null);
  const [trainingData, setTrainingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [prediction, setPrediction] = useState(null);

  useEffect(() => {
    loadAndTrain();
  }, []);

  async function loadAndTrain() {
    setLoading(true);
    try {
      const records = await getCalculations(auth.currentUser.uid);
      setTrainingData(records);
      const trainedModel = trainModel(records);
      setModel(trainedModel);
    } catch (e) {
      Alert.alert('Error', 'Could not load training data.');
    } finally {
      setLoading(false);
    }
  }

  function handlePredict() {
    const m = parseFloat(mass);
    const a = parseFloat(area);

    if (!mass || !area || isNaN(m) || isNaN(a)) {
      Alert.alert('Input Error', 'Please enter valid numeric values.');
      return;
    }
    if (a <= 0 || m <= 0) {
      Alert.alert('Input Error', 'Values must be greater than 0.');
      return;
    }
    if (!model) {
      Alert.alert('Not enough data', 'You need at least 2 saved calculations to use AI prediction. Go to the Calculator tab and save some calculations first!');
      return;
    }

    const result = predict(model, m, a);
    const status = getPredictionStatus(result.predictedStress, material, MATERIALS);
    setPrediction({ ...result, ...status, material, mass: m, area: a });
  }

  function handleReset() {
    setMass('');
    setArea('');
    setPrediction(null);
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF9800" />
        <Text style={styles.loadingText}>Training AI model on your data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>🤖 AI Stress Predictor</Text>
      <Text style={styles.subtitle}>
        Powered by on-device linear regression trained on your calculation history
      </Text>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Model Status</Text>
        <Text style={styles.infoText}>
          {model
            ? `✅ Model trained on ${trainingData.length} calculations`
            : `⚠️ Not enough data — save at least 2 calculations first`}
        </Text>
      </View>

      <Text style={styles.label}>Support Material</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={material}
          onValueChange={setMaterial}
          style={styles.picker}
          dropdownIconColor="#FF9800"
        >
          {Object.keys(MATERIALS).map(m => (
            <Picker.Item key={m} label={m} value={m} color="#fff" />
          ))}
        </Picker>
      </View>

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

      <TouchableOpacity style={styles.button} onPress={handlePredict}>
        <Text style={styles.buttonText}>🤖 Predict Stress</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
        <Text style={styles.resetText}>Reset</Text>
      </TouchableOpacity>

      {prediction && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>AI Prediction Result</Text>
          <View style={[styles.statusBadge, { backgroundColor: prediction.color }]}>
            <Text style={styles.statusText}>{prediction.status}</Text>
            <Text style={styles.statusSub}>Predicted outcome</Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Predicted Stress</Text>
            <Text style={styles.resultValue}>{prediction.predictedStress.toFixed(4)} MPa</Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Model Confidence</Text>
            <Text style={styles.resultValue}>{prediction.confidence}%</Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Training Samples</Text>
            <Text style={styles.resultValue}>{trainingData.length} calculations</Text>
          </View>
          <Text style={styles.disclaimer}>
            ⚠️ This is an AI prediction based on historical data. Always verify with a full calculation before making engineering decisions.
          </Text>
        </View>
      )}

      <TouchableOpacity style={styles.retrain} onPress={loadAndTrain}>
        <Text style={styles.retrainText}>🔄 Retrain Model</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  content: { padding: 24 },
  centered: { flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#aaa', marginTop: 16, fontSize: 14 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FF9800', marginBottom: 4 },
  subtitle: { fontSize: 12, color: '#aaa', marginBottom: 20, lineHeight: 18 },
  infoCard: { backgroundColor: '#1E1E1E', borderRadius: 10, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: '#333' },
  infoTitle: { color: '#FF9800', fontWeight: 'bold', marginBottom: 6, fontSize: 14 },
  infoText: { color: '#ccc', fontSize: 13 },
  label: { color: '#aaa', marginBottom: 6, fontSize: 14 },
  pickerWrapper: { backgroundColor: '#1E1E1E', borderRadius: 8, marginBottom: 16, borderWidth: 1, borderColor: '#333' },
  picker: { color: '#fff' },
  input: { backgroundColor: '#1E1E1E', color: '#fff', borderRadius: 8, padding: 14, marginBottom: 16, fontSize: 16, borderWidth: 1, borderColor: '#333' },
  button: { backgroundColor: '#FF9800', borderRadius: 8, padding: 16, alignItems: 'center', marginBottom: 12 },
  buttonText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
  resetButton: { borderWidth: 1, borderColor: '#555', borderRadius: 8, padding: 16, alignItems: 'center', marginBottom: 20 },
  resetText: { color: '#aaa', fontWeight: 'bold', fontSize: 16 },
  resultCard: { backgroundColor: '#1E1E1E', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#333' },
  resultTitle: { color: '#FF9800', fontWeight: 'bold', fontSize: 16, marginBottom: 12 },
  statusBadge: { borderRadius: 10, padding: 16, alignItems: 'center', marginBottom: 16 },
  statusText: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  statusSub: { fontSize: 12, color: '#fff', opacity: 0.9, marginTop: 4 },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#2a2a2a' },
  resultLabel: { color: '#aaa', fontSize: 14 },
  resultValue: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  disclaimer: { color: '#888', fontSize: 11, marginTop: 12, lineHeight: 16 },
  retrain: { borderWidth: 1, borderColor: '#FF9800', borderRadius: 8, padding: 14, alignItems: 'center', marginBottom: 20 },
  retrainText: { color: '#FF9800', fontWeight: 'bold' },
});