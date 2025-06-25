import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export default function AccountScreen() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingField, setEditingField] = useState<string>('');
  const [editingValue, setEditingValue] = useState<string>('');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userDataString = await SecureStore.getItemAsync('userData');
      if (userDataString) {
        setUserData(JSON.parse(userDataString));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleEdit = (field: string, currentValue: string) => {
    setEditingField(field);
    setEditingValue(currentValue);
    setShowEditModal(true);
  };

  const handleSave = async () => {
    if (!userData) return;

    const updatedUserData = {
      ...userData,
      [editingField]: editingValue,
    };

    try {
      await SecureStore.setItemAsync('userData', JSON.stringify(updatedUserData));
      setUserData(updatedUserData);
      setShowEditModal(false);
      Alert.alert('Success', 'Account information updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update account information');
    }
  };

  const handleSecuritySettings = () => {
    Alert.alert('Security Settings', 'Biometric settings and security options');
  };

  const handleNotificationSettings = () => {
    Alert.alert('Notification Settings', 'Manage your notification preferences');
  };

  const handlePrivacy = () => {
    Alert.alert('Privacy', 'Privacy policy and data management');
  };

  const handleSupport = () => {
    Alert.alert('Support', 'Contact customer support');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              await SecureStore.deleteItemAsync('biometricSetup');
              await SecureStore.deleteItemAsync('onboardingComplete');
              Alert.alert('Logged out', 'You have been logged out successfully');
            } catch (error) {
              console.error('Error logging out:', error);
            }
          }
        }
      ]
    );
  };

  if (!userData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading account...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const getFieldLabel = (field: string) => {
    const labels: { [key: string]: string } = {
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      phoneNumber: 'Phone',
      address: 'Address',
      city: 'City',
      state: 'State',
      zipCode: 'ZIP Code',
      country: 'Country'
    };
    return labels[field] || field;
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Account</Text>
            <TouchableOpacity style={styles.settingsButton}>
              <Ionicons name="settings-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={['#4ecdc4', '#44a08d']}
                  style={styles.avatar}
                >
                  <Text style={styles.avatarText}>
                    {userData.firstName.charAt(0)}{userData.lastName.charAt(0)}
                  </Text>
                </LinearGradient>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>
                  {userData.firstName} {userData.lastName}
                </Text>
                <Text style={styles.profileEmail}>{userData.email}</Text>
              </View>
            </View>
          </View>

          {/* Account Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            {Object.entries(userData).map(([key, value]) => (
              <TouchableOpacity
                key={key}
                style={styles.detailItem}
                onPress={() => handleEdit(key, value)}
              >
                <View style={styles.detailLeft}>
                  <Text style={styles.detailLabel}>{getFieldLabel(key)}</Text>
                  <Text style={styles.detailValue}>{value}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Settings</Text>
            
            <TouchableOpacity style={styles.settingItem} onPress={handleSecuritySettings}>
              <View style={styles.settingIcon}>
                <Ionicons name="shield-checkmark-outline" size={24} color="#667eea" />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Security</Text>
                <Text style={styles.settingSubtitle}>Biometric and login settings</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem} onPress={handleNotificationSettings}>
              <View style={styles.settingIcon}>
                <Ionicons name="notifications-outline" size={24} color="#667eea" />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Notifications</Text>
                <Text style={styles.settingSubtitle}>Push notification preferences</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem} onPress={handlePrivacy}>
              <View style={styles.settingIcon}>
                <Ionicons name="lock-closed-outline" size={24} color="#667eea" />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Privacy</Text>
                <Text style={styles.settingSubtitle}>Data and privacy settings</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem} onPress={handleSupport}>
              <View style={styles.settingIcon}>
                <Ionicons name="help-circle-outline" size={24} color="#667eea" />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Support</Text>
                <Text style={styles.settingSubtitle}>Help and customer service</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.settingItem, styles.logoutItem]} onPress={handleLogout}>
              <View style={styles.settingIcon}>
                <Ionicons name="log-out-outline" size={24} color="#ff6b6b" />
              </View>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, styles.logoutText]}>Logout</Text>
                <Text style={styles.settingSubtitle}>Sign out of your account</Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Edit Modal */}
        <Modal
          visible={showEditModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Edit {getFieldLabel(editingField)}</Text>
              <TouchableOpacity onPress={handleSave}>
                <Text style={styles.modalSave}>Save</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <TextInput
                style={styles.modalInput}
                value={editingValue}
                onChangeText={setEditingValue}
                placeholder={`Enter ${getFieldLabel(editingField).toLowerCase()}`}
                autoFocus
              />
            </View>
          </SafeAreaView>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  settingsButton: {
    padding: 8,
  },
  profileCard: {
    marginHorizontal: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 24,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLeft: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: '#ff6b6b',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  modalCancel: {
    fontSize: 16,
    color: '#666',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  modalSave: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: '600',
  },
  modalContent: {
    padding: 24,
  },
  modalInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
});
