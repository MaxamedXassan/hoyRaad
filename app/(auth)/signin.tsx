import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../lib/supabase';


export default function SigninScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) Alert.alert("Cillad", error.message);
    else router.replace("/(tabs)");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ku soo dhowaw!</Text>
      <Text style={styles.subtitle}>Gali xogtaada si aad u gashid HoyRaad</Text>

      <TextInput placeholder="Email" style={styles.input} autoCapitalize="none" onChangeText={setEmail} />
      <TextInput placeholder="Password" style={styles.input} secureTextEntry onChangeText={setPassword} />

      <TouchableOpacity style={styles.mainButton} onPress={handleSignIn} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
        <Text style={styles.footerText}>Ma lihid account? <Text style={styles.linkText}>Iska diiwaangeli halkan</Text></Text>
      </TouchableOpacity>
    </View>
  );
}

// Isticmaal styles-kii sare (waa isku mid)
const styles = StyleSheet.create({
  container: { flex: 1, padding: 30, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1A237E', marginBottom: 5 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 30 },
  input: { backgroundColor: '#F5F5F5', padding: 15, borderRadius: 10, marginBottom: 15, fontSize: 16 },
  mainButton: { backgroundColor: '#1A237E', padding: 18, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  footerText: { textAlign: 'center', marginTop: 20, color: '#666' },
  linkText: { color: '#1A237E', fontWeight: 'bold' }
});