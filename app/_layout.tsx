import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import {
  useFonts,
  Manrope_400Regular,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import {
  JetBrainsMono_400Regular,
} from '@expo-google-fonts/jetbrains-mono';
import { useRoleStore } from '../store/roleStore';
import { useAuthStore } from '../store/authStore';
import { restoreSession } from '../lib/auth';
import { colors } from '../constants/colors';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
    JetBrainsMono_400Regular,
  });

  const { login, setLoading } = useAuthStore();
  const { loadRoles } = useRoleStore();

  useEffect(() => {
    async function init() {
      const session = await restoreSession();
      if (session) {
        login(session.token, session.userId);
        await loadRoles();
      } else {
        setLoading(false);
      }
    }
    init();
  }, []);

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.darkNavy }} />;
  }

  return (
    <>
      <StatusBar style="light" backgroundColor={colors.darkNavy} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.darkNavy } }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  );
}
