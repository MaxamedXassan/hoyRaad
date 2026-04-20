import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase'; // Hubi halka uu kuu jiro

const { width } = Dimensions.get('window');

interface HouseProps {
  house: any;
  onPress: () => void;
  userRole?: string; // Waxaan ku ogaanaynaa inuu yahay kireyste
}

export default function HouseCard({ house, onPress, userRole = 'renter' }: HouseProps) {
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  // Marka card-ka uu load gareeyo, hubi haddii uu hore u 'liked' u ahaa
  useEffect(() => {
    if (userRole === 'renter') {
      checkIfLiked();
    }
  }, []);

  const checkIfLiked = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', user.id)
      .eq('house_id', house.id)
      .single();

    if (data) setLiked(true);
  };

  const toggleLike = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (liked) {
      // Ka saar favorites
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('house_id', house.id);
      setLiked(false);
    } else {
      // Ku dar favorites
      await supabase.from('favorites').insert([{ user_id: user.id, house_id: house.id }]);
      setLiked(true);
    }
    setLoading(false);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.95}>
      {/* Sawirka Guriga */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: house.display_image }} style={styles.image} />
        
        {/* Badanka Like-ka (Kaliya Kireystaha) */}
        {userRole === 'renter' && (
          <TouchableOpacity 
            style={styles.heartButton} 
            onPress={toggleLike}
            disabled={loading}
          >
            <Ionicons 
              name={liked ? "heart" : "heart-outline"} 
              size={24} 
              color={liked ? "#FF5252" : "#fff"} 
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Xogta Guriga */}
      <View style={styles.info}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>{house.title}</Text>
          <Text style={styles.priceText}>${house.price}<Text style={styles.perMonth}>/mo</Text></Text>
        </View>
        
        <View style={styles.locationRow}>
          <Ionicons name="location" size={14} color="#666" />
          <Text style={styles.address} numberOfLines={1}>{house.address}</Text>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Ionicons name="bed-outline" size={16} color="#1A237E" />
            <Text style={styles.detailText}>{house.rooms} Qol</Text>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="water-outline" size={16} color="#1A237E" />
            <Text style={styles.detailText}>{house.bathrooms} Musqul</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 25,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
    overflow: 'hidden'
  },
  imageContainer: {
    width: '100%',
    height: 220,
    position: 'relative'
  },
  image: { width: '100%', height: '100%' },
  heartButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 8,
    borderRadius: 20,
  },
  info: { padding: 18 },
  headerRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 6
  },
  title: { fontSize: 19, fontWeight: 'bold', color: '#1A1A1A', flex: 1, marginRight: 10 },
  priceText: { fontSize: 20, fontWeight: '800', color: '#1A237E' },
  perMonth: { fontSize: 12, color: '#666', fontWeight: '400' },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  address: { color: '#666', marginLeft: 4, fontSize: 14 },
  detailsRow: { 
    flexDirection: 'row', 
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0'
  },
  detailItem: { flexDirection: 'row', alignItems: 'center', marginRight: 25 },
  detailText: { color: '#444', fontSize: 14, marginLeft: 6, fontWeight: '500' }
});