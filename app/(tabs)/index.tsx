import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,

    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HouseCard from '../../components/HouseCard';
import { supabase } from '../../lib/supabase';

export default function HomeScreen() {
    const [houses, setHouses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchHouses = async () => {
        try {
            const { data, error } = await supabase
                .from('houses')
                .select(`
                  *,
                  house_images (
                    image_url
                  )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                const formattedData = data.map((house: any) => ({
                    ...house,
                    display_image: house.house_images?.[0]?.image_url || 'https://via.placeholder.com/400x300?text=No+Image'
                }));
                setHouses(formattedData);
            }
        } catch (error: any) {
            console.error("Error fetching houses:", error.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchHouses();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchHouses();
    };

    // Filtered list based on search
    const filteredHouses = houses.filter(h => 
        h.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        h.address.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#1A237E" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={filteredHouses}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <HouseCard 
                        house={item} 
                        onPress={() => router.push(`./house-details/${item.id}`)}
                    />
                )}
                contentContainerStyle={{ padding: 20 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListHeaderComponent={
                    <View style={styles.headerSection}>
                        {/* 1. Header Text */}
                        <View style={styles.headerTextContainer}>
                            <View>
                                <Text style={styles.welcomeText}>Waad Heli karta</Text>
                                <Text style={styles.mainTitle}>Guriga Aad Jeceshahay</Text>
                            </View>
                            <TouchableOpacity style={styles.notificationBtn}>
                                <Ionicons name="notifications-outline" size={24} color="#1A237E" />
                            </TouchableOpacity>
                        </View>

                        {/* 2. Pro Search Bar */}
                        <View style={styles.searchSection}>
                            <View style={styles.searchBar}>
                                <Ionicons name="search-outline" size={20} color="#999" style={styles.searchIcon} />
                                <TextInput 
                                    placeholder="Raadi guri ama xaafad..."
                                    style={styles.searchInput}
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                />
                            </View>
                            <TouchableOpacity style={styles.filterBtn}>
                                <Ionicons name="options-outline" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                        
                        <Text style={styles.sectionLabel}>Guryihii ugu dambeeyay</Text>
                    </View>
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="search-outline" size={60} color="#DDD" />
                        <Text style={styles.emptyText}>Ma jiraan guryo u dhigma raadintaada.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FD' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    headerSection: { marginBottom: 15 },
    headerTextContainer: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 25,
        marginTop: 10
    },
    welcomeText: { fontSize: 16, color: '#777', fontWeight: '500' },
    mainTitle: { fontSize: 26, fontWeight: 'bold', color: '#1A237E' },
    notificationBtn: { 
        backgroundColor: '#fff', 
        padding: 10, 
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4
    },
    searchSection: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginBottom: 20 
    },
    searchBar: { 
        flex: 1, 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: '#fff', 
        height: 55, 
        borderRadius: 15, 
        paddingHorizontal: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.05,
        shadowRadius: 5
    },
    searchIcon: { marginRight: 10 },
    searchInput: { flex: 1, fontSize: 16, color: '#333' },
    filterBtn: { 
        backgroundColor: '#1A237E', 
        width: 55, 
        height: 55, 
        borderRadius: 15, 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginLeft: 12,
        elevation: 4
    },
    sectionLabel: { fontSize: 18, fontWeight: 'bold', color: '#1A237E', marginTop: 10 },
    emptyContainer: { alignItems: 'center', marginTop: 50 },
    emptyText: { color: '#999', marginTop: 10, fontSize: 16 }
});