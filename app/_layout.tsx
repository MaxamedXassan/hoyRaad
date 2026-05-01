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
    if (!initialized) return;

    // Segments waxay kuu sheegaysaa folder-ka aad ku jirto
    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      // Haddii uusan login ahayn, geey Signin
      router.replace('/(auth)/signin');
    } else if (session && inAuthGroup) {
      // Haddii uu login yahay oo uu rabo inuu galo Signin, geey Home-ka
      router.replace('/(tabs)');
    }
  }, [session, initialized, segments]);

  if (!initialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#1A237E" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Halkan waa meesha ciladu ahayd. 
         Kaliya ku qor magacyada folder-adaada (groups).
      */}
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
      {/* Haddii aad rabto inaad Modal ama wax kale ku darto, halkan geli */}
    </Stack>
  );
}