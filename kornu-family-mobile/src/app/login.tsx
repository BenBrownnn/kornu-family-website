import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert('Missing information', 'Please enter your email and password.');
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        Alert.alert('Sign in failed', error.message);
        return;
      }

      router.replace('/');
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert(
        'Sign in failed',
        'Something went wrong while signing in.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>K</Text>
        </View>

        <Text style={styles.title}>Welcome Back</Text>

        <Text style={styles.subtitle}>
          Sign in to access your family portal.
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />

          <Text style={styles.label}>Password</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={[
              styles.button,
              loading && styles.buttonDisabled,
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          Kornu Family
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },

  logo: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#0077B6',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },

  logoText: {
    color: '#FFFFFF',
    fontSize: 38,
    fontWeight: '800',
  },

  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
  },

  subtitle: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    color: '#6B7280',
    textAlign: 'center',
  },

  form: {
    marginTop: 32,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },

  input: {
    height: 52,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#111827',
    marginBottom: 18,
  },

  button: {
    height: 52,
    borderRadius: 12,
    backgroundColor: '#0077B6',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  footer: {
    marginTop: 30,
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 13,
  },
});