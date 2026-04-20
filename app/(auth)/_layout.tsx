import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Ma rabo inuu madax sare (header) yeesho
        contentStyle: { backgroundColor: '#fff' }, // Midabka guud ee bogagga auth
      }}
    >
      <Stack.Screen name="signin" />
      <Stack.Screen name="signup" />
    </Stack>
  );
}