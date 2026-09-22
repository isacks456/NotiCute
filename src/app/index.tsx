import * as Device from 'expo-device';
import { Platform, StyleSheet, Image, TextInput, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnimatedIcon } from '@/components/animated-icon';
import { HintRow } from '@/components/hint-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WebBadge } from '@/components/web-badge';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { StackScreen } from 'expo-router/build/layouts/stack-utils';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';
import React, { useEffect, useState } from 'react';
import { Alert, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';




function getDevMenuHint() {
  if (Platform.OS === 'web') {
    return <ThemedText type="small">use browser devtools</ThemedText>;
  }
  if (Device.isDevice) {
    return (
      <ThemedText type="small">
        shake device or press <ThemedText type="code">m</ThemedText> in terminal
      </ThemedText>
    );
  }
  const shortcut = Platform.OS === 'android' ? 'cmd+m (or ctrl+m)' : 'cmd+d';
  return (
    <ThemedText type="small">
      press <ThemedText type="code">{shortcut}</ThemedText>
    </ThemedText>
  );
}

Notifications.setNotificationHandler({
  handleNotification: async () => {
    return Promise.resolve({
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    });
  },
});

export default function HomeScreen() {
  const [reminderText, setReminderText] = useState('');
  const [endDate, setEndDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [remindersList, setRemindersList] = useState<{id: string, text: string, days: number}[]>([]); 
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    const turnOnDailyReminder = async () => {
    try {
      const today = new Date();
      const todayReset = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endReset = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
      
      const differenceInTime = endReset.getTime() - todayReset.getTime();
      const daysLeft = Math.ceil(differenceInTime / (1000 * 3600 * 24));

      if (daysLeft < 0) {
        Alert.alert("Error", "Please choose a future date!");
        return;
      }

      await Notifications.cancelAllScheduledNotificationsAsync();

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🌸 NotiCute Reminder",
          body: `${reminderText || "Your event"} — ${daysLeft} days left!`,
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 10,    
          minute: 0,
        },
      });

      const newReminder = {
        id: Date.now().toString(), 
        text: reminderText || "My Event",
        days: daysLeft
      };
      
      setRemindersList([...remindersList, newReminder]);
      setReminderText('');

      Alert.alert(
        "Success", 
        `Added to reminders!\nYou will receive notifications every day at 10:00 AM.\nDays left: ${daysLeft}`
      );

    } catch (error) {
      Alert.alert("Error", "Failed to set reminders.");
    }
  };

  const deleteReminder = async (id: string) => {
    setRemindersList(remindersList.filter(item => item.id !== id));

    await Notifications.cancelAllScheduledNotificationsAsync();
    
    Alert.alert("Deleted", "Reminder has been removed successfully.");
  };

  return (

    <LinearGradient
      colors={['#2b2541', '#26252b', '#2C1B3D']}
      style={styles.container}
    >
    
    <ThemedView style = {styles.header} >

      <ThemedView style = {styles.subHeader}>

        <ThemedText type='title' style = {styles.headerTitle}>
          NotiCute
        </ThemedText>

        <Image
          source= {require('@/assets/waitingAnime.jpg')}
          style = {styles.headerImage}
          />

      </ThemedView>

    </ThemedView>




    <ThemedView style = {styles.content}>
    
    <ThemedView style = {styles.subContent}>

      <ThemedText type='title' style = {styles.contentTitle}>
          Write a reminder.
      </ThemedText>

      <TextInput
      style = {styles.contentInput}
      placeholder='Write any reminder...'
      placeholderTextColor="rgba(255,255,255,0.4)"
      value={reminderText}
      onChangeText = {(text) => setReminderText(text)}
      />

    </ThemedView>

    <ThemedView style={styles.dateBlock}>
      <ThemedText style={styles.dateLabel}>
        Remind until: <ThemedText style={styles.dateValue}>{endDate.toLocaleDateString('ru-RU')}</ThemedText>
    </ThemedText>
  
    <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
      <ThemedText style={styles.dateButtonText}>📅 Choose date</ThemedText>
      </TouchableOpacity>
    </ThemedView>


    {showDatePicker && (
    <DateTimePicker
      value={endDate}
      mode="date"
      display="default"
      minimumDate={new Date()} 
      onChange={(event, selectedDate) => {
      setShowDatePicker(false);
      if (selectedDate) setEndDate(selectedDate); 
    }}
    />
  )}
      
      <TouchableOpacity style={styles.contentButton} onPress={turnOnDailyReminder}>
        <ThemedText style = {styles.buttonText}>Turn on reminders!</ThemedText>
      </TouchableOpacity>

      {remindersList.length > 0 && (
      <TouchableOpacity style={styles.historyButton} onPress={() => setIsHistoryOpen(true)}>
        <ThemedText style={styles.historyButtonText}>📋 View Active Reminders ({remindersList.length})</ThemedText>
      </TouchableOpacity>
    )}

    <Modal
      animationType="slide"
      transparent={true}
      visible={isHistoryOpen}
      onRequestClose={() => setIsHistoryOpen(false)}
   >
      <ThemedView style={styles.modalOverlay}>
        <ThemedView style={styles.sheetContainer}>

          <ThemedView style={styles.sheetHeader}>
            <ThemedText style={styles.sheetTitle}>Active Reminders</ThemedText>
            <TouchableOpacity onPress={() => setIsHistoryOpen(false)}>
            <ThemedText style={styles.closeButtonText}>Close ✕</ThemedText>
          </TouchableOpacity>
        </ThemedView>

       
        <ScrollView style={styles.sheetList}>
          {remindersList.map((item) => (
            <ThemedView key={item.id} style={styles.reminderCard}>
              <ThemedView style={styles.reminderCardLeft}>
                <ThemedText style={styles.cardTextPrimary}>{item.text}</ThemedText>
                <ThemedText style={styles.cardTextSecondary}>{item.days} days left</ThemedText>
            </ThemedView>

              <TouchableOpacity style={styles.deleteButton} onPress={() => deleteReminder(item.id)}>
                <ThemedText style={styles.deleteButtonText}>Delete</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          ))}
        </ScrollView>

      </ThemedView>
    </ThemedView>
  </Modal>

    </ThemedView>
    
    



    </LinearGradient>

    

  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    width: '100%',
    height: 130,
    justifyContent: 'flex-end',
    paddingBottom: 15,
    borderBottomColor: 'rgba(255, 107, 129, 0.2)',
  },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 38,
    fontWeight: 'bold',
    fontFamily: 'Noteworthy',
  },
  headerImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  content: {
    flex: 1,
    paddingTop: 30,
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 25,
  },
  subContent: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  contentTitle: {
    color: '#FFF',         
    fontSize: 26,
    fontWeight: 'bold',
    fontFamily: 'Avenir Next',
    marginBottom: 15,
  },
  contentInput: {
    width: '100%',
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 15,
    paddingHorizontal: 16,
    color: '#FFF',           
    fontSize: 16,
    fontFamily: 'Avenir Next',
    borderWidth: 1,
    borderColor: 'rgba(85, 137, 227, 0.3)', 
    marginBottom: 10, 
  },
  contentButton: {
    marginTop: 15,
    backgroundColor: '#FF6B81',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 25,
    shadowColor: '#FF6B81',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Avenir Next',
  },
  dateBlock: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(85, 137, 227, 0.3)',
  },
  dateLabel: {
    color: '#aaa',
    fontSize: 15,
    fontFamily: 'Avenir Next',
  },
  dateValue: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  dateButton: {
    backgroundColor: 'rgba(255, 107, 129, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  dateButtonText: {
    color: '#FF6B81',
    fontWeight: '600',
    fontSize: 14,
  },
  historyButton: {
    marginTop: 20,
    backgroundColor: 'transparent',
  },
  historyButtonText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
    textDecorationLine: 'underline',
    fontFamily: 'Avenir Next',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#59558e',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    maxHeight: '75%',
    width: '100%',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  sheetTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Avenir Next',
  },
  closeButtonText: {
    color: '#FF6B81',
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Avenir Next',
  },
  sheetList: {
    backgroundColor: 'transparent',
  },
  reminderCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 129, 0.1)',
  },
  reminderCardLeft: {
    backgroundColor: 'transparent',
  },
  cardTextPrimary: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Avenir Next',
  },
  cardTextSecondary: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 13,
    marginTop: 3,
    fontFamily: 'Avenir Next',
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 75, 75, 0.12)',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: '#FF4B4B',
    fontWeight: '600',
    fontSize: 13,
    fontFamily: 'Avenir Next',
  },
});


