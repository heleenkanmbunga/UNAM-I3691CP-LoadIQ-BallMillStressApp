import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { registerUser } from '../services/authService';

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!email || !password || !confirm) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await registerUser(email, password);
    } catch (e) {
      Alert.alert('Registration Failed', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.title}>⚙️ Load IQ</Text>
      <Text style={styles.subtitle}>Create your account</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#aaa"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        placeholderTextColor="#aaa"
        value={confirm}
        onChangeText={setConfirm}
        secureTextEntry
      />

      {loading ? (
        <ActivityIndicator size="large" color="#FF9800" />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Already have an account? Log In</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', justifyContent: 'center', padding: 24 },
  title: { fontSize: 36, fontWeight: 'bold', color: '#FF9800', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#aaa', textAlign: 'center', marginBottom: 32 },
  input: {
    backgroundColor: '#1E1E1E', color: '#fff', borderRadius: 8,
    padding: 14, marginBottom: 16, fontSize: 16, borderWidth: 1, borderColor: '#333'
  },
  button: { backgroundColor: '#FF9800', borderRadius: 8, padding: 16, alignItems: 'center', marginBottom: 16 },
  buttonText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
  link: { color: '#FF9800', textAlign: 'center', marginTop: 8 },
});