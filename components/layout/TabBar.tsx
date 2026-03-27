import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import * as Haptics from 'expo-haptics';

interface TabBarItem {
  key: string;
  label: string;
  icon: string;
}

const TAB_ITEMS: TabBarItem[] = [
  { key: 'dashboard', label: 'Roles', icon: '\u2B21' },   // hexagon
  { key: 'session',   label: 'Session', icon: '\u25CE' },  // bullseye
  { key: 'marketplace', label: 'Market', icon: '\u229E' }, // squared plus
  { key: 'settings',  label: 'Settings', icon: '\u2299' }, // circled dot
];

interface TabBarProps {
  activeTab: string;
  onTabPress: (key: string) => void;
}

export function TabBar({ activeTab, onTabPress }: TabBarProps) {
  const handlePress = async (key: string) => {
    await Haptics.selectionAsync();
    onTabPress(key);
  };

  return (
    <View style={styles.container}>
      {TAB_ITEMS.map((item) => {
        const isActive = activeTab === item.key;
        return (
          <TouchableOpacity
            key={item.key}
            style={styles.tab}
            onPress={() => handlePress(item.key)}
            accessibilityLabel={item.label}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
          >
            <Text style={[styles.icon, isActive && styles.iconActive]}>{item.icon}</Text>
            <Text style={[styles.label, isActive && styles.labelActive]}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.navy2,
    borderTopWidth: 1,
    borderTopColor: 'rgba(30,111,255,0.25)',
    height: 72,
    paddingBottom: 12,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  icon: {
    fontSize: 22,
    color: colors.textMuted,
  },
  iconActive: {
    color: colors.electricBlue,
  },
  label: {
    ...typography.label,
    fontSize: 10,
    fontFamily: 'Manrope_600SemiBold',
    color: colors.textMuted,
  },
  labelActive: {
    color: colors.electricBlue,
  },
});
