import React, { useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView,
  KeyboardAvoidingView, Platform, TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { VoiceOrb } from '../../components/agent/VoiceOrb';
import { ChatBubble } from '../../components/agent/ChatBubble';
import { ChatInput } from '../../components/agent/ChatInput';
import { ConnectionPill } from '../../components/layout/ConnectionPill';
import { Badge } from '../../components/ui/Badge';
import { useAgentSession } from '../../hooks/useAgentSession';
import { useSessionStore } from '../../store/sessionStore';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';

export default function SessionScreen() {
  const { activeHireId } = useSessionStore();
  const scrollRef = useRef<ScrollView>(null);

  // If no role selected, go back to dashboard
  if (!activeHireId) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.noRole}>
          <Text style={styles.noRoleText}>No role selected.</Text>
          <TouchableOpacity onPress={() => router.replace('/(tabs)/dashboard')}>
            <Text style={styles.noRoleLink}>Back to roles</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const {
    role, status, isMicActive, isAgentSpeaking,
    agentMessages, startSession, endSession, toggleMic, sendTextMessage,
  } = useAgentSession(activeHireId);

  useEffect(() => {
    startSession();
    return () => { endSession(); };
  }, [activeHireId]);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [agentMessages.length]);

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backIcon}>{'<-'}</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.roleName}>{role?.roleName ?? 'Agent'}</Text>
            {role && <Badge variant={role.trustBadge} />}
          </View>
          <ConnectionPill status={status} />
        </View>

        {/* Voice orb - centred at top of chat */}
        <View style={styles.orbSection}>
          <VoiceOrb
            isUserSpeaking={isMicActive}
            isAgentSpeaking={isAgentSpeaking}
            isConnected={status === 'connected'}
          />
          {status === 'connecting' && (
            <Text style={styles.connectingLabel}>Connecting to {role?.roleName}...</Text>
          )}
        </View>

        {/* Chat messages */}
        <ScrollView
          ref={scrollRef}
          style={styles.chat}
          contentContainerStyle={styles.chatContent}
          keyboardShouldPersistTaps="handled"
        >
          {agentMessages.length === 0 ? (
            <View style={styles.emptyChat}>
              <Text style={styles.emptyChatText}>
                {status === 'connected'
                  ? `${role?.roleName ?? 'Your agent'} is ready. Speak or type to begin.`
                  : 'Establishing connection...'}
              </Text>
            </View>
          ) : (
            agentMessages.map(msg => <ChatBubble key={msg.id} message={msg} />)
          )}
        </ScrollView>

        {/* Input */}
        <ChatInput
          onSend={sendTextMessage}
          onMicPress={toggleMic}
          isMicActive={isMicActive}
          disabled={status === 'connecting' || status === 'error'}
        />

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.darkNavy },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(30,111,255,0.2)',
    gap: 12,
  },
  backButton: { padding: 4 },
  backIcon: { ...typography.h2, color: colors.electricBlue, fontSize: 22 },
  headerCenter: { flex: 1, gap: 4 },
  roleName: { ...typography.h3, color: colors.white },
  orbSection: { alignItems: 'center', paddingVertical: 24, gap: 12 },
  connectingLabel: { ...typography.mono, color: colors.textMuted, fontSize: 12 },
  chat: { flex: 1 },
  chatContent: { paddingTop: 8, paddingBottom: 16, flexGrow: 1, justifyContent: 'flex-end' },
  emptyChat: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, minHeight: 100 },
  emptyChatText: { ...typography.body, color: colors.textMuted, textAlign: 'center', lineHeight: 24 },
  noRole: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  noRoleText: { ...typography.body, color: colors.textMuted },
  noRoleLink: { ...typography.body, color: colors.electricBlue },
});
