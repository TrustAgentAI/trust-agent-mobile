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

function EmptySessionView() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.noRole}>
        <View style={styles.noRoleIconWrap}>
          <Text style={styles.noRoleIcon}>{'<>'}</Text>
        </View>
        <Text style={styles.noRoleTitle}>No role selected</Text>
        <Text style={styles.noRoleText}>
          Select a role from your dashboard to start a conversation.
        </Text>
        <TouchableOpacity
          style={styles.noRoleButton}
          onPress={() => router.replace('/(tabs)/dashboard')}
          activeOpacity={0.8}
        >
          <Text style={styles.noRoleBtnText}>Go to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function ActiveSession({ hireId }: { hireId: string }) {
  const scrollRef = useRef<ScrollView>(null);
  const {
    role, status, isMicActive, isAgentSpeaking,
    agentMessages, startSession, endSession, toggleMic, sendTextMessage,
  } = useAgentSession(hireId);

  useEffect(() => {
    startSession();
    return () => { endSession(); };
  }, [hireId]);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [agentMessages.length]);

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backIcon}>{'<'}</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.roleName}>{role?.roleName ?? 'Agent'}</Text>
            {role && <Badge variant={role.trustBadge} />}
          </View>
          <ConnectionPill status={status} />
        </View>

        {/* Voice orb */}
        <View style={styles.orbSection}>
          <VoiceOrb
            isUserSpeaking={isMicActive}
            isAgentSpeaking={isAgentSpeaking}
            isConnected={status === 'connected'}
          />
          {status === 'connecting' && (
            <Text style={styles.connectingLabel}>Connecting to {role?.roleName}...</Text>
          )}
          {status === 'error' && (
            <Text style={styles.errorLabel}>Connection lost. Tap to retry.</Text>
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
                  : status === 'error'
                    ? 'Could not connect. Check your internet connection.'
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

export default function SessionScreen() {
  const { activeHireId } = useSessionStore();

  if (!activeHireId) {
    return <EmptySessionView />;
  }

  return <ActiveSession hireId={activeHireId} />;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.darkNavy },
  flex: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(30,111,255,0.2)',
    gap: 12,
  },
  backButton: { padding: 4, paddingRight: 8 },
  backIcon: { fontSize: 22, color: colors.electricBlue, fontFamily: 'Manrope_700Bold' },
  headerCenter: { flex: 1, gap: 4 },
  roleName: { ...typography.h3, color: colors.white },

  // Voice orb
  orbSection: { alignItems: 'center', paddingVertical: 24, gap: 12 },
  connectingLabel: { ...typography.body, color: colors.textMuted, fontSize: 13 },
  errorLabel: { ...typography.body, color: colors.error, fontSize: 13 },

  // Chat
  chat: { flex: 1 },
  chatContent: { paddingTop: 8, paddingBottom: 16, flexGrow: 1, justifyContent: 'flex-end' },
  emptyChat: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, minHeight: 100 },
  emptyChatText: { ...typography.body, color: colors.textMuted, textAlign: 'center', lineHeight: 24 },

  // No role selected
  noRole: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  noRoleIconWrap: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: colors.navy2,
    borderWidth: 1.5,
    borderColor: 'rgba(30,111,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  noRoleIcon: { fontSize: 22, color: colors.electricBlue, fontFamily: 'Manrope_700Bold' },
  noRoleTitle: { ...typography.h2, color: colors.white },
  noRoleText: { ...typography.body, color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
  noRoleButton: {
    backgroundColor: colors.electricBlue,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 28,
    marginTop: 8,
  },
  noRoleBtnText: { ...typography.body, color: colors.white, fontFamily: 'Manrope_600SemiBold' },
});
