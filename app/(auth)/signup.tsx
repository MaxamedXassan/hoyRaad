import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'renter' | 'owner'>('renter');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async () => {
    if (!email || !password || !fullName) {
      Alert.alert("Fadlan", "Dhammaan meelaha maran buuxi.");
      return;
    }

    setLoading(true);
    
    // 1. Create Auth User (Maadaama confirmation uu OFF yahay, session-ka halkan ayuu imaanayaa)
    const { data, error: authError } = await supabase.auth.signUp({ email, password });

    if (authError) {
      Alert.alert("Cillad", authError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // 2. Insert into Profiles Table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{ id: data.user.id, full_name: fullName, role: role }]);

      if (profileError) {
        Alert.alert("Cillad Profile", profileError.message);
        setLoading(false);
      } else {
        // MAADAAMA EMAIL CONFIRMATION UU OFF YAHAY:
        Alert.alert("Guul!", "Account-kaaga waa la sameeyay.");
        
        // Toos ugu dir Home-ka (Tabs)
        router.replace("/(tabs)");
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ku soo dhowaw HoyRaad</Text>
      <Text style={styles.subtitle}>Abuur account si aad u bilowdo</Text>

      <TextInput 
        placeholder="Magacaaga oo buuxa" 
        style={styles.input} 
        onChangeText={setFullName} 
      />
      <TextInput 
        placeholder="Email" 
        style={styles.input} 
        autoCapitalize="none" 
        onChangeText={setEmail} 
      />
      <TextInput 
        placeholder="Password" 
        style={styles.input} 
        secureTextEntry 
        onChangeText={setPassword} 
      />

      <Text style={styles.label}>Ma waxaad tahay?</Text>
      <View style={styles.roleRow}>
        <TouchableOpacity 
          style={[styles.roleBox, role === 'renter' && styles.activeRole]} 
          onPress={() => setRole('renter')}
        >
          <Text style={[styles.roleText, role === 'renter' && styles.activeRoleText]}>Kireyste</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.roleBox, role === 'owner' && styles.activeRole]} 
          onPress={() => setRole('owner')}
        >
          <Text style={[styles.roleText, role === 'owner' && styles.activeRoleText]}>Milkiile</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.mainButton} onPress={handleSignUp} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Abuur Account</Text>}
      </TouchableOpacity>

      {/* Fadlan hubi router-ka halkan: looma baahna .tsx */}
      <TouchableOpacity onPress={() => router.push("/(auth)/signin" as any)}>
        <Text style={styles.footerText}>
            Horay miyaad u lahayd account? <Text style={styles.linkText}>Gasho (Login)</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// Styles-kaagu waa sax, iska daa siday yihiin.
const styles = StyleSheet.create({
  container: { flex: 1, padding: 30, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1A237E', marginBottom: 5 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 30 },
  input: { backgroundColor: '#F5F5F5', padding: 15, borderRadius: 10, marginBottom: 15, fontSize: 16 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 10, color: '#333' },
  roleRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  roleBox: { flex: 0.48, padding: 12, borderWidth: 1, borderColor: '#DDD', borderRadius: 10, alignItems: 'center' },
  activeRole: { backgroundColor: '#1A237E', borderColor: '#1A237E' },
  roleText: { fontSize: 14, color: '#333' },
  activeRoleText: { color: '#fff', fontWeight: 'bold' },
  mainButton: { backgroundColor: '#1A237E', padding: 18, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  footerText: { textAlign: 'center', marginTop: 20, color: '#666' },
  linkText: { color: '#1A237E', fontWeight: 'bold' }
});