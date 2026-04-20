import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
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

export default function AddHouseScreen() {
  // --- States ---
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [address, setAddress] = useState('');
  const [rooms, setRooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState(''); // State-ka taleefanka oo muhiim ah
  
  const router = useRouter();

  // --- Functions ---

  // 1. Nadiifinta Foomka (Reset)
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPrice('');
    setAddress('');
    setRooms('');
    setBathrooms('');
    setPhone('');
    setImages([]);
  };

  // 2. Doorashada Sawirada (Multiple Selection)
  const pickImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 4 - images.length, 
      quality: 0.3, 
    });

    if (!result.canceled) {
      const selectedUris = result.assets.map(asset => asset.uri);
      setImages((prev) => [...prev, ...selectedUris].slice(0, 4));
    }
  };

  // 3. Xareynta Xogta (Submit)
  const handleAddHouse = async () => {
    // Hubinta in xogta muhiimka ah la buuxiyey
    if (!title || !price || !address || !phone || images.length === 0) {
      Alert.alert("Fadlan", "Dhameystir magaca, qiimaha, goobta, taleefanka iyo ugu yaraan hal sawir.");
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Fadlan dib u gal app-ka.");

      // A. Geli xogta aasaasiga ah ee Table-ka 'houses'
      const { data: houseData, error: houseError } = await supabase
        .from('houses')
        .insert([{
          owner_id: user.id,
          title,
          description,
          price: parseFloat(price),
          address,
          owner_phone: phone, // Column-kii aan hadda ku darnay DB
          rooms: parseInt(rooms) || 0,
          bathrooms: parseInt(bathrooms) || 0,
          is_available: true
        }])
        .select()
        .single();

      if (houseError) throw houseError;

      // B. Upload sawirada mid-mid
      for (const imgUri of images) {
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
        const formData = new FormData();
        
        // @ts-ignore
        formData.append('file', {
          uri: imgUri,
          name: fileName,
          type: 'image/jpeg',
        });

        const { error: uploadError } = await supabase.storage
          .from('house-images')
          .upload(fileName, formData);

        if (uploadError) continue;

        const { data: { publicUrl } } = supabase.storage
          .from('house-images')
          .getPublicUrl(fileName);

        // C. Geli URL-ka table-ka 'house_images'
        await supabase.from('house_images').insert([{
          house_id: houseData.id,
          image_url: publicUrl
        }]);
      }

      Alert.alert(
        "Guul!", 
        "Gurigaaga si guul ah ayaa loo soo xareeyay.",
        [{ text: "OK", onPress: () => {
          resetForm();
          router.replace('/(tabs)');
        }}]
      );

    } catch (error: any) {
      Alert.alert("Cillad", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>Guri Cusub</Text>
          <Text style={styles.headerSub}>Ku soo kordhi guri cusub suuqa HoyRaad</Text>
        </View>

        {/* Image Selection Area */}
        <View style={styles.section}>
          <Text style={styles.label}>Sawirrada Guriga ({images.length}/4)</Text>
          <View style={styles.imageGrid}>
            {images.map((img, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri: img }} style={styles.imageThumb} />
                <TouchableOpacity 
                  style={styles.removeBadge} 
                  onPress={() => setImages(images.filter((_, i) => i !== index))}
                >
                  <Ionicons name="close" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
            
            {images.length < 4 && (
              <TouchableOpacity style={styles.addBtn} onPress={pickImages}>
                <Ionicons name="camera" size={30} color="#1A237E" />
                <Text style={styles.addBtnText}>Ku dar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          <Text style={styles.sectionLabel}>Macluumaadka Guriga</Text>
          
          <TextInput 
            placeholder="Magaca Guriga (Title)" 
            style={styles.input} 
            value={title} 
            onChangeText={setTitle} 
          />
          
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <TextInput 
                placeholder="Qiimaha ($)" 
                style={styles.input} 
                keyboardType="numeric" 
                value={price} 
                onChangeText={setPrice} 
              />
            </View>
            <View style={{ flex: 1 }}>
              <TextInput 
                placeholder="Address-ka" 
                style={styles.input} 
                value={address} 
                onChangeText={setAddress} 
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <TextInput 
                placeholder="Qolalka" 
                style={styles.input} 
                keyboardType="numeric" 
                value={rooms} 
                onChangeText={setRooms} 
              />
            </View>
            <View style={{ flex: 1 }}>
              <TextInput 
                placeholder="Suuliyada" 
                style={styles.input} 
                keyboardType="numeric" 
                value={bathrooms} 
                onChangeText={setBathrooms} 
              />
            </View>
          </View>

          {/* Taleefanka - Meel gooni ah oo weyn si uusan u dhuuman */}
          <TextInput 
            placeholder="Lambarka Taleefanka (tsh: 61xxxxxxx)" 
            style={styles.input} 
            keyboardType="phone-pad" 
            value={phone} 
            onChangeText={setPhone} 
          />

          <TextInput 
            placeholder="Faahfaahin dheeraad ah..." 
            style={[styles.input, { height: 100, textAlignVertical: 'top' }]} 
            multiline 
            value={description} 
            onChangeText={setDescription} 
          />

          <TouchableOpacity 
            style={[styles.submitBtn, loading && { opacity: 0.7 }]} 
            onPress={handleAddHouse} 
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>Daah-fur Guriga</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FD' },
  headerSection: { 
    padding: 25, 
    paddingTop: 60, 
    backgroundColor: '#1A237E', 
    borderBottomLeftRadius: 30, 
    borderBottomRightRadius: 30 
  },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  headerSub: { color: '#C5CAE9', marginTop: 5, fontSize: 14 },
  section: { padding: 20 },
  label: { fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 12 },
  imageGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  imageWrapper: { 
    width: (width - 70) / 4, 
    height: 80, 
    marginRight: 10, 
    marginBottom: 10, 
    borderRadius: 12, 
    overflow: 'hidden', 
    position: 'relative',
    borderWidth: 1,
    borderColor: '#eee'
  },
  imageThumb: { width: '100%', height: '100%' },
  removeBadge: { 
    position: 'absolute', 
    top: 2, 
    right: 2, 
    backgroundColor: 'rgba(255,0,0,0.8)', 
    borderRadius: 10, 
    padding: 2 
  },
  addBtn: { 
    width: (width - 70) / 4, 
    height: 80, 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderStyle: 'dashed', 
    borderWidth: 1.5, 
    borderColor: '#1A237E' 
  },
  addBtnText: { fontSize: 11, color: '#1A237E', marginTop: 3, fontWeight: 'bold' },
  formCard: { 
    backgroundColor: '#fff', 
    marginHorizontal: 20, 
    marginBottom: 30, 
    borderRadius: 25, 
    padding: 20, 
    shadowColor: '#000', 
    shadowOpacity: 0.05, 
    shadowRadius: 10, 
    elevation: 3 
  },
  sectionLabel: { fontSize: 16, fontWeight: 'bold', color: '#1A237E', marginBottom: 15 },
  input: { 
    backgroundColor: '#F3F6FF', 
    padding: 15, 
    borderRadius: 12, 
    marginBottom: 15, 
    borderWidth: 1, 
    borderColor: '#E1E8F5', 
    fontSize: 15 
  },
  row: { flexDirection: 'row' },
  submitBtn: { 
    backgroundColor: '#1A237E', 
    padding: 18, 
    borderRadius: 15, 
    alignItems: 'center', 
    marginTop: 10 
  },
  submitBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});