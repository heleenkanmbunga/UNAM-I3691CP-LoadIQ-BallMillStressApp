import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MATERIALS, calculateStress, classifyStress } from '../utils/stressCalculator';

export default function CalculateScreen({ navigation }) {
  const [material, setMaterial] = useState('Mild Steel (S235)');
  const [mass, setMass] = useState('');
  const [area, setArea] = useState('');

  function handleCalculate() {
    const m = parseFloat(mass);
    const a = parseFloat(area);

    if (!mass || !area || isNaN(m) || isNaN(a)) {
      Alert.alert('Input Error', 'Please enter valid numeric values for both fields.');
      return;
    }
    if (m <= 0) {
      Alert.alert('Input Error', 'Load mass must be greater than 0 kg.');
      return;
    }
    if (a <= 0) {
      Alert.alert('Input Error', 'Area must be greater than 0 m².');
      return;
    }

    const { force, stressMPa } = calculateStress(m, a);
    const { status, color } = classifyStress(stressMPa, material);

    navigation.navigate('Result', {
      material, mass: m, area: a, force, stressMPa, status, color
    });
  }

  function handleReset() {
    setMass('');
    setArea('');
    setMaterial('Mild Steel (S235)');
  }

  const matInfo = MATERIALS[material];

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Stress Calculator</Text>
        <Text style={styles.subtitle}>Enter the parameters below to calculate compressive stress</Text>

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

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>Yield Strength: {matInfo.yieldStrength} MPa</Text>
          <Text style={styles.infoText}>Warning Threshold: {matInfo.warningThreshold} MPa</Text>
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

        <TouchableOpacity style={styles.button} onPress={handleCalculate}>
          <Text style={styles.buttonText}>⚙️ Calculate Stress</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetText}>Reset Fields</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  content: { padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FF9800', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#aaa', marginBottom: 24 },
  label: { color: '#aaa', marginBottom: 6, fontSize: 14 },
  pickerWrapper: {
    backgroundColor: '#1E1E1E', borderRadius: 8, marginBottom: 8,
    borderWidth: 1, borderColor: '#333'
  },
  picker: { color: '#fff' },
  infoBox: {
    backgroundColor: '#2a2a2a', borderRadius: 8, padding: 10,
    marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between'
  },
  infoText: { color: '#FF9800', fontSize: 12 },
  input: {
    backgroundColor: '#1E1E1E', color: '#fff', borderRadius: 8,
    padding: 14, marginBottom: 16, fontSize: 16, borderWidth: 1, borderColor: '#333'
  },
  button: { backgroundColor: '#FF9800', borderRadius: 8, padding: 16, alignItems: 'center', marginBottom: 12 },
  buttonText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
  resetButton: { borderWidth: 1, borderColor: '#555', borderRadius: 8, padding: 16, alignItems: 'center' },
  resetText: { color: '#aaa', fontWeight: 'bold', fontSize: 16 },
});