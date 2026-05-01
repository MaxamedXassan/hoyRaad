import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { supabase } from '../../lib/supabase';

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [myHouses, setMyHouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    await getProfile();
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (user) {
      await getProfile();
    }
    setRefreshing(false);
  };

  async function getProfile() {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      setUser(authUser);
      const { data } = await supabase.from('profiles').select('*').eq('id', authUser.id).single();
      if (data) {
        setProfile(data);
        if (data.role === 'owner') await fetchMyHouses(authUser.id);
      }
    }
  }

  async function fetchMyHouses(userId: string) {
    const { data } = await supabase.from('houses').select('*, house_images(image_url)').eq('owner_id', userId).order('created_at', { ascending: false });
    if (data) setMyHouses(data);
  }

  const handleLogout = async () => {
    Alert.alert("Ka bixid", "Ma hubtaa inaad ka baxayso app-ka?", [
      { text: "Maya" },
      { text: "Haa", onPress: async () => { await supabase.auth.signOut(); router.replace('/(auth)/signin'); }}
    ]);
  };

  const contactViaWhatsApp = () => {
    const phoneNumber = "252615940572";
    const message = "Asc HoyRaad, waxaan u baahnaa caawinaad.";
    Linking.openURL(`whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`).catch(() => {
        Alert.alert("Error", "WhatsApp kuma rakibna taleefankaaga.");
    });
  };

  const deleteHouse = (id: string) => {
    Alert.alert("Hubi", "Ma hubtaa inaad tirtirayso gurigan?", [
      { text: "Maya" },
      { text: "Haa", onPress: async () => {
        const { error } = await supabase.from('houses').delete().eq('id', id);
        if (!error) setMyHouses(prev => prev.filter(h => h.id !== id));
      }}
    ]);
  };

  const isOwner = profile?.role === 'owner';
  const totalViews = myHouses.reduce((sum, house) => sum + (house.views || 0), 0);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1A237E" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.infoText}>
            <Text style={styles.emailText} numberOfLines={1}>{profile?.full_name || user?.email}</Text>
            <View style={[styles.roleBadge, { backgroundColor: isOwner ? '#E8EAF6' : '#E8F5E9' }]}>
                <Text style={[styles.userRole, { color: isOwner ? '#1A237E' : '#2E7D32' }]}>{isOwner ? 'Milkiile' : 'Kireyste'}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
          </TouchableOpacity>
        </View>

        {isOwner && (
          <View style={styles.statsRow}>
            <View style={styles.statItem}><Text style={styles.statNum}>{myHouses.length}</Text><Text style={styles.statLabel}>Guryahayga</Text></View>
            <View style={[styles.statItem, { borderLeftWidth: 1, borderColor: '#eee' }]}><Text style={styles.statNum}>{totalViews}</Text><Text style={styles.statLabel}>(Views)</Text></View>
          </View>
        )}
      </View>

      <ScrollView 
        style={styles.listSection}
        showsVerticalScrollIndicator={false}
        // PADDING-KA HOOSE OO LA KORDHIYEY SI WHATSAPP UU U SOO MUUQDO
        contentContainerStyle={{ paddingBottom: 150 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {isOwner ? (
          <>
            <Text style={styles.sectionTitle}>Maamul Guryahaaga</Text>
            {myHouses.length === 0 ? (
              <View style={styles.emptyState}><Ionicons name="home-outline" size={60} color="#ccc" /><Text style={styles.emptyText}>Wali guri ma aadan soo gelin.</Text></View>
            ) : (
              myHouses.map((item) => (
                <View key={item.id} style={styles.houseCard}>
                  <Image source={{ uri: item.house_images?.[0]?.image_url || 'https://via.placeholder.com/150' }} style={styles.houseImg} />
                  <View style={styles.houseDetails}>
                    <View>
                      <Text style={styles.houseTitle} numberOfLines={1}>{item.title}</Text>
                      <View style={styles.viewRow}><Ionicons name="eye-outline" size={14} color="#666" /><Text style={styles.viewCount}>{item.views || 0} views</Text></View>
                    </View>
                    <View style={styles.cardFooter}>
                      <Text style={styles.housePrice}>${item.price}/mo</Text>
                      <View style={styles.actionButtons}>
                        <TouchableOpacity onPress={() => router.push(`/edit-house/${item.id}`)} style={styles.iconBtn}><Ionicons name="create-outline" size={20} color="#1A237E" /></TouchableOpacity>
                        <TouchableOpacity onPress={() => deleteHouse(item.id)} style={[styles.iconBtn, { marginLeft: 15 }]}><Ionicons name="trash-outline" size={20} color="#FF3B30" /></TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              ))
            )}
          </>
        ) : (
          <View style={styles.customerView}>
             <Text style={styles.sectionTitle}>Xulashada Kireystaha</Text>
             <TouchableOpacity style={styles.menuItem} onPress={() => router.push('./favorites')}>
                <View style={[styles.menuIcon, { backgroundColor: '#FFF0F0' }]}><Ionicons name="heart" size={22} color="#FF3B30" /></View>
                <Text style={styles.menuText}>Guryaha aan jeclaystay</Text>
                <Ionicons name="chevron-forward" size={20} color="#CCC" />
             </TouchableOpacity>
             <TouchableOpacity style={styles.menuItem}>
                <View style={[styles.menuIcon, { backgroundColor: '#F0F4FF' }]}><Ionicons name="settings" size={22} color="#1A237E" /></View>
                <Text style={styles.menuText}>Beddel Profile-ka</Text>
                <Ionicons name="chevron-forward" size={20} color="#CCC" />
             </TouchableOpacity>
          </View>
        )}

        <View style={{ marginTop: 20 }}>
            <Text style={styles.sectionTitle}>Caawinaad & Taageero</Text>
            <TouchableOpacity style={styles.menuItem} onPress={contactViaWhatsApp}>
                <View style={[styles.menuIcon, { backgroundColor: '#E8F5E9' }]}><Ionicons name="logo-whatsapp" size={22} color="#2E7D32" /></View>
                <Text style={styles.menuText}>Nala soo xiriir (WhatsApp)</Text>
                <Ionicons name="chevron-forward" size={20} color="#CCC" />
            </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FD' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#fff', padding: 25, borderBottomLeftRadius: 35, borderBottomRightRadius: 35, elevation: 3 },
  profileInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#1A237E', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  infoText: { flex: 1, marginLeft: 15 },
  emailText: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
  roleBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginTop: 5 },
  userRole: { fontSize: 12, fontWeight: 'bold' },
  logoutBtn: { padding: 10, backgroundColor: '#FFF5F5', borderRadius: 12 },
  statsRow: { flexDirection: 'row', backgroundColor: '#F9FAFB', borderRadius: 20, padding: 15 },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 20, fontWeight: 'bold', color: '#1A237E' },
  statLabel: { fontSize: 12, color: '#666' },
  listSection: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 15 },
  houseCard: { backgroundColor: '#fff', borderRadius: 20, padding: 10, flexDirection: 'row', marginBottom: 15, elevation: 2 },
  houseImg: { width: 85, height: 85, borderRadius: 15 },
  houseDetails: { flex: 1, marginLeft: 12, justifyContent: 'space-between' },
  houseTitle: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  viewRow: { flexDirection: 'row', alignItems: 'center' },
  viewCount: { fontSize: 12, color: '#888', marginLeft: 4 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  housePrice: { color: '#1A237E', fontWeight: '800', fontSize: 14 },
  actionButtons: { flexDirection: 'row' },
  iconBtn: { padding: 5 },
  emptyState: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: '#999', marginTop: 10 },
  customerView: { marginTop: 10 },
  menuItem: { backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 15, marginBottom: 10, elevation: 1 },
  menuIcon: { width: 45, height: 45, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  menuText: { flex: 1, marginLeft: 15, fontSize: 16, color: '#333', fontWeight: '500' }
});