import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View
} from 'react-native';
// Halkan ka eeg: Waxaan isticmaalaynaa SafeAreaView-ga cusub
import { SafeAreaView } from 'react-native-safe-area-context';
import HouseCard from '../../components/HouseCard';
import { supabase } from '../../lib/supabase';

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('favorites')
        .select(`
          id,
          houses (
            *,
            house_images (image_url)
          )
        `)
        .eq('user_id', user.id);
        // Haddii aad SQL-ka kor ku xusay aad socodsiisay, markaas dib u soo celi koodhkan hoose:
        // .order('created_at', { ascending: false });

      if (error) {
        console.error("Supabase Error:", error.message);
        return;
      }

      if (data) {
        const formattedData = data
          .filter((item: any) => item.houses !== null) // Hubi in guriga wali jiro (aan la tirtirin)
          .map((item: any) => ({
            ...item.houses,
            display_image: item.houses.house_images?.[0]?.image_url || 'https://via.placeholder.com/400'
          }));
        setFavorites(formattedData);
      }
    } catch (error: any) {
      console.error("Catch Error:", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchFavorites();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1A237E" />
      </View>
    );
  }

  return (
    // SafeAreaView-gan cusub wuxuu si fiican u maamulayaa notch-ka taleefanka
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Favorites</Text>
        <Text style={styles.subtitle}>Guryaha aad calaamadsatay</Text>
      </View>

      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <HouseCard 
            house={item} 
            onPress={() => router.push(`/house-details/${item.id}`)}
          />
        )}
        contentContainerStyle={{ padding: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-dislike-outline" size={80} color="#DDD" />
            <Text style={styles.emptyText}>Wali guri ma aadan jeclaysan.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FD' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1A237E' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 4 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#999', marginTop: 15, fontSize: 16 }
});