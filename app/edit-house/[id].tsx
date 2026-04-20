import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { supabase } from '../../lib/supabase';

const { width } = Dimensions.get('window');

export default function EditHouseScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  // --- States ---
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [rooms, setRooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // 1. Soo qaado xogta hadda jirta markii bogga la furo
  useEffect(() => {
    fetchOriginalData();
  }, [id]);

  const fetchOriginalData = async () => {
    try {
      const { data, error } = await supabase
        .from('houses')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setTitle(data.title);
        setDescription(data.description || '');
        setPrice(data.price.toString());
        setAddress(data.address);
        setPhone(data.owner_phone || '');
        setRooms(data.rooms?.toString() || '0');
        setBathrooms(data.bathrooms?.toString() || '0');
      }
    } catch (error: any) {
      Alert.alert("Cillad", "Ma suurtagalin in la soo aqriyo xogta guriga.");
    } finally {
      setFetching(false);
    }
  };

  // 2. Dir xogta cusub (Update)
  const handleUpdate = async () => {
    if (!title || !price || !address || !phone) {
      Alert.alert("Fadlan", "Buuxi dhammaan meelaha muhiimka ah.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('houses')
        .update({
          title,
          description,
          price: parseFloat(price),
          address,
          owner_phone: phone,
          rooms: parseInt(rooms) || 0,
          bathrooms: parseInt(bathrooms) || 0,
        })
        .eq('id', id);

      if (error) throw error;

      Alert.alert("Guul", "Xogta gurigaaga waa la cusboonaysiiyey!", [
        { text: "OK", onPress: () => router.replace('/(tabs)/profile') }
      ]);
    } catch (error: any) {
      Alert.alert("Cillad", error.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1A237E" />
        <Text style={{marginTop: 10}}>Xogta ayaa la soo rarayaa...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={{ flex: 1, backgroundColor: '#fff' }}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Custom Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={28} color="#1A237E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Beddel Guriga</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.inputLabel}>Magaca Guriga</Text>
          <TextInput 
            style={styles.input} 
            value={title} 
            onChangeText={setTitle} 
            placeholder="Tusaale: Guri dabaq ah oo dhameystiran"
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.inputLabel}>Qiimaha ($)</Text>
              <TextInput 
                style={styles.input} 
                keyboardType="numeric" 
                value={price} 
                onChangeText={setPrice} 
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Taleefanka</Text>
              <TextInput 
                style={styles.input} 
                keyboardType="phone-pad" 
                value={phone} 
                onChangeText={setPhone} 
              />
            </View>
          </View>

          <Text style={styles.inputLabel}>Goobta (Address)</Text>
          <TextInput 
            style={styles.input} 
            value={address} 
            onChangeText={setAddress} 
            placeholder="Dagmada / Jidka"
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.inputLabel}>Qolal</Text>
              <TextInput 
                style={styles.input} 
                keyboardType="numeric" 
                value={rooms} 
                onChangeText={setRooms} 
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Musqul</Text>
              <TextInput 
                style={styles.input} 
                keyboardType="numeric" 
                value={bathrooms} 
                onChangeText={setBathrooms} 
              />
            </View>
          </View>

          <Text style={styles.inputLabel}>Faahfaahin dheeraad ah</Text>
          <TextInput 
            style={[styles.input, { height: 120, textAlignVertical: 'top' }]} 
            multiline 
            value={description} 
            onChangeText={setDescription} 
            placeholder="Ka sheekey waxyaabaha u gaarka ah guriga..."
          />

          <TouchableOpacity 
            style={[styles.updateBtn, loading && { opacity: 0.7 }]} 
            onPress={handleUpdate} 
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="save-outline" size={20} color="#fff" style={{marginRight: 10}} />
                <Text style={styles.updateBtnText}>Cusboonaysii Xogta</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 20, 
    paddingTop: 60, 
    backgroundColor: '#fff' 
  },
  backBtn: { padding: 5 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#1A237E', marginLeft: 15 },
  formContainer: { padding: 20 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 8, marginLeft: 5 },
  input: { 
    backgroundColor: '#F5F7FF', 
    padding: 16, 
    borderRadius: 15, 
    marginBottom: 20, 
    borderWidth: 1, 
    borderColor: '#E1E8F5',
    fontSize: 15
  },
  row: { flexDirection: 'row' },
  updateBtn: { 
    backgroundColor: '#1A237E', 
    padding: 18, 
    borderRadius: 18, 
    flexDirection: 'row',
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 10,
    elevation: 4,
    shadowColor: '#1A237E',
    shadowOpacity: 0.3,
    shadowRadius: 10
  },
  updateBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});