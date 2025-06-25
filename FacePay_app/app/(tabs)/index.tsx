import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

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

interface CardData {
  cardNumber: string;
  nameOnCard: string;
  expiryDate: string;
  cvv: string;
}

export default function HomeScreen() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [cards, setCards] = useState<CardData[]>([]);
  const [selectedCardIndex, setSelectedCardIndex] = useState(0);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [newCard, setNewCard] = useState<CardData>({
    cardNumber: '',
    nameOnCard: '',
    expiryDate: '',
    cvv: '',
  });
  const [mockTransaction, setMockTransaction] = useState({
    merchant: 'Apple Store',
    amount: 99.99,
    time: new Date().toLocaleTimeString(),
    redirectUrl: 'https://www.apple.com/store',
  });

  const transactionOpacity = useRef(new Animated.Value(1)).current;
  const cardFlatListRef = useRef<FlatList>(null);

  const [recentTransactions] = useState([
    { 
      cardIndex: 0,
      transactions: [
        { id: 1, name: 'Apple Store', amount: -29.99, date: 'Today', icon: 'bag-outline', type: 'purchase' },
        { id: 2, name: 'Starbucks Coffee', amount: -5.75, date: 'Yesterday', icon: 'cafe-outline', type: 'purchase' },
        { id: 3, name: 'Online Shopping', amount: -156.20, date: 'Dec 20', icon: 'card-outline', type: 'purchase' },
      ]
    },
    {
      cardIndex: 1,
      transactions: [
        { id: 4, name: 'Netflix Subscription', amount: -15.99, date: 'Dec 19', icon: 'tv-outline', type: 'subscription' },
        { id: 5, name: 'Grocery Store', amount: -87.45, date: 'Dec 18', icon: 'basket-outline', type: 'purchase' },
        { id: 6, name: 'Gas Station', amount: -45.00, date: 'Dec 17', icon: 'car-outline', type: 'purchase' },
      ]
    }
  ]);

  useEffect(() => {
    checkOnboardingStatus();
    setupNotifications();
  }, []);

  const setupNotifications = async () => {
    // Configure notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Push notifications are required for transaction alerts');
      return;
    }

    // Listen for notification responses (when user taps notification)
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      // When user taps the notification, show the payment modal
      setShowNotificationModal(true);
    });

    return () => subscription.remove();
  };

  const checkOnboardingStatus = async () => {
    try {
      const biometricSetup = await SecureStore.getItemAsync('biometricSetup');
      if (!biometricSetup) {
        router.replace('/biometric-setup');
        return;
      }

      const onboardingComplete = await SecureStore.getItemAsync('onboardingComplete');
      if (!onboardingComplete) {
        router.replace('/onboarding');
        return;
      }

      const userDataString = await SecureStore.getItemAsync('userData');
      const cardsDataString = await SecureStore.getItemAsync('cardsData');

      if (userDataString) {
        setUserData(JSON.parse(userDataString));
      }
      
      if (cardsDataString) {
        setCards(JSON.parse(cardsDataString));
      } else {
        // Load initial card from old data structure
        const cardDataString = await SecureStore.getItemAsync('cardData');
        if (cardDataString) {
          const cardData = JSON.parse(cardDataString);
          setCards([cardData]);
          await SecureStore.setItemAsync('cardsData', JSON.stringify([cardData]));
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const match = cleaned.match(/.{1,4}/g);
    return match ? match.join(' ') : '';
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const handleCardSelection = (index: number) => {
    setSelectedCardIndex(index);
    
    // Fade out and in transactions
    Animated.sequence([
      Animated.timing(transactionOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(transactionOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleAddCard = () => {
    setShowAddCardModal(true);
  };

  const handleSaveCard = async () => {
    if (!newCard.cardNumber || !newCard.nameOnCard || !newCard.expiryDate || !newCard.cvv) {
      Alert.alert('Error', 'Please fill in all card details');
      return;
    }

    const updatedCards = [...cards, newCard];
    setCards(updatedCards);
    await SecureStore.setItemAsync('cardsData', JSON.stringify(updatedCards));
    
    setNewCard({ cardNumber: '', nameOnCard: '', expiryDate: '', cvv: '' });
    setShowAddCardModal(false);
    Alert.alert('Success', 'Card added successfully!');
  };

  const triggerMockNotification = async () => {
    // Schedule a push notification that appears after 2 seconds
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Payment Request',
        body: `${mockTransaction.merchant} - $${mockTransaction.amount}`,
        data: { 
          merchant: mockTransaction.merchant,
          amount: mockTransaction.amount,
          redirectUrl: mockTransaction.redirectUrl
        },
      },
      trigger: { seconds: 2 } as any,
    });
    
    Alert.alert('Mock Notification', 'A payment request notification will appear in 2 seconds. Tap it to authorize the transaction.');
  };

  const confirmTransaction = () => {
    setShowNotificationModal(false);
    Alert.alert(
      'Transaction Confirmed!', 
      'Your payment has been processed successfully. Redirecting to merchant...',
      [
        {
          text: 'OK',
          onPress: () => {
            // Simulate redirect to merchant
            Alert.alert('Redirected', `Opening ${mockTransaction.merchant} store...`);
          }
        }
      ]
    );
  };

  const getCurrentTransactions = () => {
    const currentCard = recentTransactions.find(t => t.cardIndex === selectedCardIndex);
    return currentCard ? currentCard.transactions : [];
  };

  if (!userData || cards.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Good morning</Text>
              <Text style={styles.userName}>{userData.firstName} {userData.lastName}</Text>
            </View>
            <TouchableOpacity style={styles.profileButton} onPress={triggerMockNotification}>
              <Ionicons name="notifications-outline" size={32} color="white" />
            </TouchableOpacity>
          </View>

          {/* Card Carousel */}
          <View style={styles.cardContainer}>
            <FlatList
              ref={cardFlatListRef}
              data={cards}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) => index.toString()}
              onMomentumScrollEnd={(event) => {
                const index = Math.round(event.nativeEvent.contentOffset.x / width);
                handleCardSelection(index);
              }}
              renderItem={({ item: card, index }) => (
                <View style={styles.cardItem}>
                  <LinearGradient
                    colors={
                      index === 0 
                        ? ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']
                        : index === 1
                        ? ['rgba(76, 175, 80, 0.2)', 'rgba(76, 175, 80, 0.1)']
                        : ['rgba(255, 152, 0, 0.2)', 'rgba(255, 152, 0, 0.1)']
                    }
                    style={styles.cardGradient}
                  >
                    <Text style={styles.cardType}>
                      {card.cardNumber.startsWith('4') ? 'Visa' : 'Mastercard'}
                    </Text>
                    <Text style={styles.cardNumber}>
                      •••• •••• •••• {card.cardNumber.slice(-4)}
                    </Text>
                    <View style={styles.cardFooter}>
                      <Text style={styles.cardName}>{card.nameOnCard}</Text>
                      <Text style={styles.cardExpiry}>{card.expiryDate}</Text>
                    </View>
                  </LinearGradient>
                </View>
              )}
            />
            
            {/* Card Indicators */}
            <View style={styles.cardIndicators}>
              {cards.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicator,
                    index === selectedCardIndex && styles.activeIndicator
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleAddCard}>
              <LinearGradient
                colors={['#4ecdc4', '#44a08d']}
                style={styles.actionIcon}
              >
                <Ionicons name="add-outline" size={24} color="white" />
              </LinearGradient>
              <Text style={styles.actionText}>Add Card</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <LinearGradient
                colors={['#f093fb', '#f5576c']}
                style={styles.actionIcon}
              >
                <Ionicons name="qr-code-outline" size={24} color="white" />
              </LinearGradient>
              <Text style={styles.actionText}>Pay</Text>
            </TouchableOpacity>
          </View>

          {/* Recent Transactions */}
          <Animated.View style={[styles.transactionsSection, { opacity: transactionOpacity }]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Transactions</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>

              <View style={styles.transactionsList}>
                {getCurrentTransactions().map((transaction) => (
                  <View key={transaction.id} style={styles.transactionItem}>
                    <View style={styles.transactionIcon}>
                      <Ionicons 
                        name={transaction.icon as any} 
                        size={20} 
                        color="#667eea" 
                      />
                    </View>
                    <View style={styles.transactionDetails}>
                      <Text style={styles.transactionName}>{transaction.name}</Text>
                      <Text style={styles.transactionDate}>{transaction.date}</Text>
                    </View>
                    <Text style={[
                      styles.transactionAmount,
                      transaction.amount > 0 ? styles.positiveAmount : styles.negativeAmount
                    ]}>
                      {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                    </Text>
                  </View>
                ))}
              </View>
            </Animated.View>
        </ScrollView>

        {/* Add Card Modal */}
        <Modal
          visible={showAddCardModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowAddCardModal(false)}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Add New Card</Text>
              <TouchableOpacity onPress={handleSaveCard}>
                <Text style={styles.modalSave}>Save</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.inputContainer}>
                <Ionicons name="card-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Card Number"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  value={newCard.cardNumber}
                  onChangeText={(text) => {
                    const formatted = formatCardNumber(text);
                    if (formatted.replace(/\s/g, '').length <= 16) {
                      setNewCard({...newCard, cardNumber: formatted});
                    }
                  }}
                  maxLength={19}
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Name on Card"
                  placeholderTextColor="#999"
                  value={newCard.nameOnCard}
                  onChangeText={(text) => setNewCard({...newCard, nameOnCard: text})}
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <Ionicons name="calendar-outline" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="MM/YY"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    value={newCard.expiryDate}
                    onChangeText={(text) => {
                      const formatted = formatExpiryDate(text);
                      if (formatted.length <= 5) {
                        setNewCard({...newCard, expiryDate: formatted});
                      }
                    }}
                    maxLength={5}
                  />
                </View>

                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="CVV"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    secureTextEntry
                    value={newCard.cvv}
                    onChangeText={(text) => {
                      if (text.length <= 4) {
                        setNewCard({...newCard, cvv: text});
                      }
                    }}
                    maxLength={4}
                  />
                </View>
              </View>
            </ScrollView>
          </SafeAreaView>
        </Modal>

        {/* Mock Notification Modal */}
        <Modal
          visible={showNotificationModal}
          animationType="fade"
          transparent={true}
        >
          <View style={styles.notificationOverlay}>
            <BlurView intensity={20} tint="dark" style={styles.notificationBlur}>
              <View style={styles.notificationModal}>
                <View style={styles.notificationHeader}>
                  <Ionicons name="card-outline" size={32} color="#667eea" />
                  <Text style={styles.notificationTitle}>Payment Request</Text>
                </View>

                <View style={styles.notificationContent}>
                  <Text style={styles.merchantName}>{mockTransaction.merchant}</Text>
                  <Text style={styles.notificationAmount}>${mockTransaction.amount}</Text>
                  <Text style={styles.transactionTime}>{mockTransaction.time}</Text>
                  <Text style={styles.cardUsed}>Using •••• {cards[selectedCardIndex]?.cardNumber.slice(-4)}</Text>
                </View>

                <View style={styles.notificationActions}>
                  <TouchableOpacity 
                    style={styles.declineButton}
                    onPress={() => setShowNotificationModal(false)}
                  >
                    <Text style={styles.declineText}>Decline</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.confirmButton}
                    onPress={confirmTransaction}
                  >
                    <LinearGradient
                      colors={['#4ecdc4', '#44a08d']}
                      style={styles.confirmGradient}
                    >
                      <Text style={styles.confirmText}>Confirm</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </BlurView>
          </View>
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
  greeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  profileButton: {
    padding: 8,
  },
  cardContainer: {
    paddingHorizontal: 0,
    marginBottom: 32,
    height: 250,
  },
  cardItem: {
    width: width,
    paddingHorizontal: 24,
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
  },
  cardGradient: {
    flex: 1,
    height: 200,
    borderRadius: 20,
    padding: 24,
    justifyContent: 'space-between',
  },
  cardIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  activeIndicator: {
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  cardType: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 20,
  },
  cardNumber: {
    fontSize: 20,
    fontWeight: '500',
    color: 'white',
    letterSpacing: 2,
    fontFamily: 'monospace',
    marginBottom: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardName: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  cardExpiry: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  transactionsSection: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  seeAllText: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: '500',
  },
  transactionsList: {
    gap: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 14,
    color: '#666',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  positiveAmount: {
    color: '#4ecdc4',
  },
  negativeAmount: {
    color: '#1a1a1a',
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
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 16,
    color: '#1a1a1a',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  // Notification Modal styles
  notificationOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBlur: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationModal: {
    width: width * 0.85,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  notificationHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 12,
  },
  notificationContent: {
    alignItems: 'center',
    marginBottom: 32,
  },
  merchantName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  notificationAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 8,
  },
  transactionTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  cardUsed: {
    fontSize: 16,
    color: '#1a1a1a',
    fontFamily: 'monospace',
  },
  notificationActions: {
    flexDirection: 'row',
    gap: 12,
  },
  declineButton: {
    flex: 1,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#e1e5e9',
  },
  declineText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
  },
  confirmGradient: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
});
