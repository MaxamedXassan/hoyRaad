import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { supabase } from '../lib/supabase';

export default function RootLayout() {
  const [session, setSession] = useState<any>(null);
  const [initialized, setInitialized] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // 1. Hubi qofka markuu app-ka soo fariisto
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setInitialized(true);
    };

    checkSession();

    // 2. La soco haddii qofku galo ama ka baxo
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setInitialized(true);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Sug inta initialized ay noqonayso true (Loading-ka ha dhaafo)
    if (!initialized) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      // Qof aan login ahayn -> Signin
      router.replace('/(auth)/signin' as any);
    } else if (session && inAuthGroup) {
      // Qof login ah oo raba inuu Signin aado -> Home
      router.replace('/(tabs)');
    }
  }, [session, initialized, segments]);

  // MUHIIM: Inta uu hubinayo session-ka, ha tusin wax bog ah
  if (!initialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#1A237E" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(index)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}