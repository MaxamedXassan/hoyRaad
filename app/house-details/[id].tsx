import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { supabase } from '../../lib/supabase';

const { width } = Dimensions.get('window');

export default function HouseDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [house, setHouse] = useState<any>(null);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    if (id) {
      fetchHouseDetails();
    }
  }, [id]);

  const fetchHouseDetails = async () => {
    setLoading(true);
    try {
      // 1. Soo qaado xogta qofka hadda isticmaalaya App-ka
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      // 2. Soo aqri xogta guriga
      const { data: houseData, error: houseError } = await supabase
        .from('houses')
        .select('*')
        .eq('id', id)
        .single();

      if (houseError) throw houseError;

      // 3. Soo aqri sawirada gurigan
      const { data: imageData } = await supabase
        .from('house_images')
        .select('image_url')
        .eq('house_id', id);

      if (houseData) {
        setImages(imageData || []);
        
        // --- LOGIC-GA VIEWS-KA (RPC) ---
        // Kaliya haddii qofka eegaya uusan ahayn milkiilihii guriga lahaa
        if (currentUser && currentUser.id !== houseData.owner_id) {
          // Waxaan u wacaynaa Function-ka SQL-ka aan dhisnay
          const { error: rpcError } = await supabase.rpc('increment_views', { house_id: id });
          
          if (!rpcError) {
            // UI-ga u cusboonaysii hal view oo dheeraad ah
            setHouse({ ...houseData, views: (houseData.views || 0) + 1 });
          } else {
            console.error("RPC View Error:", rpcError.message);
            setHouse(houseData);
          }
        } else {
          // Haddii uu milkiilaha yahay, iska muuji xogta sidooda
          setHouse(houseData);
        }
      }
    } catch (error: any) {
      console.error("Fetch Error:", error.message);
      Alert.alert("Cillad", "Laguma guulaysan soo aqrinta xogta guriga.");
    } finally {
      setLoading(false);
    }
  };

  const getFormattedPhone = () => {
    if (!house?.owner_phone) return null;
    let phone = house.owner_phone.replace(/\s/g, ''); 
    if (phone.startsWith('0')) {
        phone = '252' + phone.substring(1);
    } else if (!phone.startsWith('252') && !phone.startsWith('+')) {
        phone = '252' + phone;
    }
    return phone.replace('+', '');
  };

  const handleWhatsApp = () => {
    const cleanPhone = getFormattedPhone();
    if (!cleanPhone) {
      Alert.alert("Cillad", "Milkiiluhu ma soo gelin lambar taleefan.");
      return;
    }
    const message = `Asc, waxaan xiisaynayaa guriga: ${house.title}. Ma heli karaa faahfaahin dheeraad ah?`;
    Linking.openURL(`whatsapp://send?phone=${cleanPhone}&text=${message}`);
  };

  const handleCall = () => {
    const cleanPhone = getFormattedPhone();
    if (!cleanPhone) {
      Alert.alert("Cillad", "Lambarka taleefanka lama heli karo.");
      return;
    }
    Linking.openURL(`tel:+${cleanPhone}`);
  };

  if (loading) return (
    <View style={styles.center}><ActivityIndicator size="large" color="#1A237E" /></View>
  );
  
  if (!house) return (
    <View style={styles.center}><Text>Guriga lama helin!</Text></View>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* 1. Image Slider */}
        <View style={styles.imageContainer}>
          <ScrollView 
            horizontal 
            pagingEnabled 
            onScroll={(e) => {
              const slide = Math.round(e.nativeEvent.contentOffset.x / width);
              if (slide !== activeImg) setActiveImg(slide);
            }}
            scrollEventThrottle={16}
            showsHorizontalScrollIndicator={false}
          >
            {images.length > 0 ? (
              images.map((img, index) => (
                <Image key={index} source={{ uri: img.image_url }} style={styles.mainImage} />
              ))
            ) : (
              <Image source={{ uri: 'https://via.placeholder.com/400' }} style={styles.mainImage} />
            )}
          </ScrollView>
          
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>

          <View style={styles.dotContainer}>
            {images.map((_, i) => (
              <View key={i} style={[styles.dot, { 
                width: i === activeImg ? 20 : 8,
                backgroundColor: i === activeImg ? '#fff' : 'rgba(255,255,255,0.5)' 
              }]} />
            ))}
          </View>
        </View>

        {/* 2. Info Section */}
        <View style={styles.detailsBox}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{house.title}</Text>
            <View style={styles.priceTag}>
              <Text style={styles.priceText}>${house.price}<Text style={{fontSize: 12, fontWeight: '400'}}> /mo</Text></Text>
            </View>
          </View>

          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={18} color="#666" />
            <Text style={styles.address}>{house.address}</Text>
          </View>

          {/* Views Display */}
          <View style={styles.viewsContainer}>
            <Ionicons name="eye-outline" size={16} color="#888" />
            <Text style={styles.viewsText}>{house.views || 0} views</Text>
          </View>

          <View style={styles.featuresRow}>
            <View style={styles.featureItem}>
              <View style={styles.iconCircle}><Ionicons name="bed-outline" size={20} color="#1A237E" /></View>
              <Text style={styles.featureText}>{house.rooms} Qol</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.iconCircle}><Ionicons name="water-outline" size={20} color="#1A237E" /></View>
              <Text style={styles.featureText}>{house.bathrooms} Musqul</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Faahfaahin</Text>
          <Text style={styles.description}>{house.description || "Ma jiro faahfaahin laga bixiyay gurigan."}</Text>
          
          <View style={{height: 120}} />
        </View>
      </ScrollView>

      {/* 3. Footer Actions */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.callBtn} onPress={handleCall}>
          <Ionicons name="call" size={22} color="#1A237E" />
          <Text style={styles.callBtnText}>Wac</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.waBtn} onPress={handleWhatsApp}>
          <Ionicons name="logo-whatsapp" size={22} color="#fff" />
          <Text style={styles.waBtnText}>WhatsApp</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  imageContainer: { position: 'relative', height: 380 },
  mainImage: { width: width, height: 380, resizeMode: 'cover' },
  backBtn: { position: 'absolute', top: 50, left: 20, backgroundColor: '#fff', padding: 10, borderRadius: 15, elevation: 5 },
  dotContainer: { position: 'absolute', bottom: 30, flexDirection: 'row', alignSelf: 'center' },
  dot: { height: 8, borderRadius: 4, marginHorizontal: 4 },
  detailsBox: { padding: 25, borderTopLeftRadius: 35, borderTopRightRadius: 35, marginTop: -30, backgroundColor: '#fff' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1A1A1A', flex: 1, marginRight: 10 },
  priceTag: { backgroundColor: '#F0F2FF', padding: 12, borderRadius: 15 },
  priceText: { color: '#1A237E', fontWeight: '800', fontSize: 20 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  address: { color: '#777', marginLeft: 5, fontSize: 16 },
  viewsContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  viewsText: { color: '#888', fontSize: 13, marginLeft: 5 },
  featuresRow: { flexDirection: 'row', marginBottom: 30 },
  featureItem: { flexDirection: 'row', alignItems: 'center', marginRight: 25 },
  iconCircle: { backgroundColor: '#F5F6FA', padding: 8, borderRadius: 12, marginRight: 10 },
  featureText: { fontSize: 16, color: '#444', fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 12 },
  description: { fontSize: 15, color: '#666', lineHeight: 24 },
  footer: { 
    position: 'absolute', 
    bottom: 0, 
    flexDirection: 'row', 
    padding: 20, 
    paddingBottom: 35, 
    backgroundColor: '#fff', 
    borderTopWidth: 1, 
    borderColor: '#F0F0F0',
    width: '100%'
  },
  callBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#1A237E', borderRadius: 18, marginRight: 15, height: 60 },
  callBtnText: { marginLeft: 10, color: '#1A237E', fontWeight: 'bold', fontSize: 16 },
  waBtn: { flex: 2, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#25D366', borderRadius: 18, height: 60, elevation: 4 },
  waBtnText: { marginLeft: 10, color: '#fff', fontWeight: 'bold', fontSize: 16 },
});