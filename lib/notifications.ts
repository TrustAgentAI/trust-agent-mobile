import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Type-safe notification data
export interface TaskNotificationData {
  type: 'task_complete' | 'agent_message' | 'session_update';
  taskId?: string;
  agentName?: string;
  message?: string;
}

// Configure how notifications appear when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Request notification permissions on first launch
export async function registerForPushNotifications(): Promise<string | null> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Push notification permission not granted');
    return null;
  }

  // Android requires a notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Trust Agent',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1E6FFF',
    });
  }

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: undefined, // Set to your Expo project ID in production
    });
    return tokenData.data;
  } catch (e) {
    console.warn('Failed to get push token:', e);
    return null;
  }
}

// Handle an incoming notification while the app is running
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
): Notifications.Subscription {
  return Notifications.addNotificationReceivedListener(callback);
}

// Handle when a user taps on a notification
export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

// Schedule a local notification for task completion
export async function scheduleTaskCompleteNotification(
  agentName: string,
  taskSummary: string,
  taskId: string
): Promise<string> {
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: `${agentName} - Task Complete`,
      body: taskSummary,
      data: {
        type: 'task_complete',
        taskId,
        agentName,
        message: taskSummary,
      } satisfies TaskNotificationData,
      sound: true,
    },
    trigger: null, // Fire immediately
  });

  return id;
}

// Schedule a delayed local notification
export async function scheduleDelayedNotification(
  title: string,
  body: string,
  data: TaskNotificationData,
  delaySeconds: number
): Promise<string> {
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: data as unknown as Record<string, unknown>,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: delaySeconds,
    },
  });

  return id;
}

// Cancel a scheduled notification
export async function cancelNotification(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

// Cancel all scheduled notifications
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// Get the badge count
export async function getBadgeCount(): Promise<number> {
  return Notifications.getBadgeCountAsync();
}

// Set the badge count
export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}
