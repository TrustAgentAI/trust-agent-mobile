import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';

function TabIcon({ icon, label, focused }: { icon: string; label: string; focused: boolean }) {
  return (
    <View style={styles.tabItem}>
      <Text style={[styles.icon, focused && styles.iconActive]}>{icon}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="~" label="Home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="session"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="o" label="Chat" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="marketplace"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="+" label="Marketplace" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="*" label="Settings" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.navy2,
    borderTopWidth: 1,
    borderTopColor: 'rgba(30,111,255,0.25)',
    height: 72,
    paddingBottom: 12,
  },
  tabItem: { alignItems: 'center', gap: 4 },
  icon: { fontSize: 22, color: colors.textMuted, fontFamily: 'Manrope_700Bold' },
  iconActive: { color: colors.ionCyan },
  tabLabel: { fontSize: 10, fontFamily: 'Manrope_600SemiBold', color: colors.textMuted },
  tabLabelActive: { color: colors.ionCyan },
});
