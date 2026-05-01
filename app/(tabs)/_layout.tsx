import { Ionicons } from '@expo/vector-icons';
import * as NavigationBar from 'expo-navigation-bar'; // Kani waa kan qarinaya badhamada hoose
import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, StatusBar, View } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function TabLayout() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserRole();

    // 1. Qari Saacadda Sare
    StatusBar.setHidden(true);

    // 2. Qari Badhamada Hoose (Samsung/Android Navigation Bar)
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync("hidden"); // Wuu qarinayaa
      NavigationBar.setBehaviorAsync("inset-touch"); // Markuu qofka taabto ayuu soo baxayaa, ka dibna iskiis u qarsoomayaa
    }
  }, []);

  async function getUserRole() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        if (data) setRole(data.role);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#1A237E" />
      </View>
    );
  }

  return (
    <Tabs 
      screenOptions={{ 
        tabBarActiveTintColor: '#1A237E',
        headerShown: false,
        tabBarStyle: { 
          height: 65,
          paddingBottom: 10,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          position: 'absolute' // Waxay ka dhigaysaa inuu kor ka yimaado background-ka
        } 
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="favorites"
        options={{
          tabBarLabel: 'Favorites',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "heart" : "heart-outline"} size={24} color={color} />
          ),
          href: role === 'renter' ? '/favorites' : null,
        }}
      />

      <Tabs.Screen
        name="add-house"
        options={{
          tabBarLabel: '', // Magaca waan ka saaray si badhanka u weynaado
          tabBarIcon: ({ color }) => (
            <View style={{
              backgroundColor: '#1A237E',
              width: 50,
              height: 50,
              borderRadius: 25,
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: -15, // Kor u yara qaad badhanka
              borderWidth: 4,
              borderColor: '#F8F9FD', // Midabka background-ka app-kaaga
            }}>
              <Ionicons name="add" size={35} color="#FFF" />
            </View>
          ),
          href: role === 'owner' ? '/add-house' : null,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}