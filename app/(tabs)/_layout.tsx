import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function TabLayout() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserRole();
  }, []);

  async function getUserRole() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (data) {
          setRole(data.role);
          // console.log("Qofka doorkiisu waa:", data.role); // Kani waa tijaabo (Debug)
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Inta ay xogtu imanayso, ha tusin Tabs-ka si uusan qalad u dhicin
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1A237E" />
      </View>
    );
  }

  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#1A237E' }}>
      
      {/* Home - Qof kasta waa u furan yahay */}
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
          title: 'HoyRaad',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }}
      />

      {/* favorites - Kireystaha oo KALIYA (renter) */}
      <Tabs.Screen
        name="favorites"
        options={{
          headerShown: false,
          title: 'Baar Guryaha',
          tabBarLabel: 'Favorites',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "heart" : "heart-outline"} size={24} color={color} />
          ),
          // Halkan ayaa ah sirta: Haddii uu yahay owner, qari tab-kan
          href: role === 'renter' ? '/favorites' : null,
        }}
      />

      {/* Add House - Milkiilaha oo KALIYA (owner) */}
      <Tabs.Screen
        name="add-house"
        options={{
          title: 'Guri Ku Dar',
          tabBarLabel: 'Add',
          tabBarIcon: ({ color }) => <Ionicons name="add-circle" size={28} color={color} />,
          // Halkan ayaa ah sirta: Haddii uu yahay renter, qari tab-kan
          href: role === 'owner' ? '/add-house' : null,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}