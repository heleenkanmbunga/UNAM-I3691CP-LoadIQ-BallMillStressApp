import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ScrollView
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
      Alert.alert('Input Error', 'Please enter valid numeric values.');
      return;
    }
    if (a <= 0) {
      Alert.alert('Input Error', 'Area must be greater than 0.');
      return;
    }

    const { force, stressMPa } = calculateStress(m, a);
    const { status, color } = classifyStress(stressMPa, material);

    navigation.navigate('Result', {
      material, mass: m, area: a, force, stressMPa, status, color
    });
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Stress Calculator</Text>

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

      <TouchableOpacity style={styles.button} onPress={handleCalculate}>
        <Text style={styles.buttonText}>Calculate</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  content: { padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FF9800', marginBottom: 24 },
  label: { color: '#aaa', marginBottom: 6, fontSize: 14 },
  pickerWrapper: {
    backgroundColor: '#1E1E1E', borderRadius: 8, marginBottom: 16,
    borderWidth: 1, borderColor: '#333'
  },
  picker: { color: '#fff' },
  input: {
    backgroundColor: '#1E1E1E', color: '#fff', borderRadius: 8,
    padding: 14, marginBottom: 16, fontSize: 16, borderWidth: 1, borderColor: '#333'
  },
  button: { backgroundColor: '#FF9800', borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
});