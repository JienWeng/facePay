import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
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

interface CardData {
  cardNumber: string;
  nameOnCard: string;
  expiryDate: string;
  cvv: string;
}

const OnboardingScreen = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [userData, setUserData] = useState<UserData>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Malaysia',
  });
  const [cardData, setCardData] = useState<CardData>({
    cardNumber: '',
    nameOnCard: '',
    expiryDate: '',
    cvv: '',
  });

  const malaysianStates = [
    'Johor', 'Kedah', 'Kelantan', 'Kuala Lumpur', 'Labuan', 'Malacca', 'Negeri Sembilan',
    'Pahang', 'Penang', 'Perak', 'Perlis', 'Putrajaya', 'Sabah', 'Sarawak', 'Selangor', 'Terengganu'
  ];

  const steps = [
    'Personal Info',
    'Contact Details',
    'Address',
    'Payment Method',
    'Complete'
  ];

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

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return userData.firstName.trim() !== '' && userData.lastName.trim() !== '';
      case 1:
        return userData.email.trim() !== '' && validateEmail(userData.email) && userData.phoneNumber.trim() !== '';
      case 2:
        return userData.address.trim() !== '' && 
               userData.city.trim() !== '' && 
               userData.state.trim() !== '' && 
               userData.zipCode.trim() !== '';
      case 3:
        return cardData.cardNumber.replace(/\s/g, '').length === 16 && 
               cardData.nameOnCard.trim() !== '' && 
               cardData.expiryDate.length === 5 && 
               cardData.cvv.length >= 3;
      default:
        return true;
    }
  };

  const handleNext = async () => {
    if (!validateCurrentStep()) {
      Alert.alert('Error', 'Please fill in all required fields correctly.');
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save data securely
      try {
        await SecureStore.setItemAsync('userData', JSON.stringify(userData));
        await SecureStore.setItemAsync('cardData', JSON.stringify(cardData));
        await SecureStore.setItemAsync('onboardingComplete', 'true');
        router.replace('/(tabs)');
      } catch (error) {
        Alert.alert('Error', 'Failed to save your information. Please try again.');
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Personal Information</Text>
            <Text style={styles.stepSubtitle}>Let's start with your basic details</Text>
            
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="First Name"
                placeholderTextColor="#999"
                value={userData.firstName}
                onChangeText={(text) => setUserData({...userData, firstName: text})}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Last Name"
                placeholderTextColor="#999"
                value={userData.lastName}
                onChangeText={(text) => setUserData({...userData, lastName: text})}
              />
            </View>
          </View>
        );

      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Contact Information</Text>
            <Text style={styles.stepSubtitle}>How can we reach you?</Text>
            
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
                value={userData.email}
                onChangeText={(text) => setUserData({...userData, email: text})}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                value={userData.phoneNumber}
                onChangeText={(text) => setUserData({...userData, phoneNumber: text})}
              />
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Address Information</Text>
            <Text style={styles.stepSubtitle}>Where should we send your statements?</Text>
            
            <View style={styles.inputContainer}>
              <Ionicons name="home-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Street Address"
                placeholderTextColor="#999"
                value={userData.address}
                onChangeText={(text) => setUserData({...userData, address: text})}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Ionicons name="location-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="City"
                placeholderTextColor="#999"
                value={userData.city}
                onChangeText={(text) => setUserData({...userData, city: text})}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="map-outline" size={20} color="#666" style={styles.inputIcon} />
              <TouchableOpacity 
                style={styles.pickerButton}
                onPress={() => {
                  Alert.alert(
                    'Select State',
                    '',
                    [
                      ...malaysianStates.map(state => ({
                        text: state,
                        onPress: () => setUserData({...userData, state})
                      })),
                      { text: 'Cancel', onPress: () => {} }
                    ]
                  );
                }}
              >
                <Text style={[styles.pickerText, !userData.state && styles.placeholderText]}>
                  {userData.state || 'Select State'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="ZIP Code"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={userData.zipCode}
                onChangeText={(text) => setUserData({...userData, zipCode: text})}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="flag-outline" size={20} color="#666" style={styles.inputIcon} />
              <Text style={styles.countryText}>Malaysia</Text>
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Payment Method</Text>
            <Text style={styles.stepSubtitle}>Add your card for secure payments</Text>
            
            <View style={styles.inputContainer}>
              <Ionicons name="card-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Card Number"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={cardData.cardNumber}
                onChangeText={(text) => {
                  const formatted = formatCardNumber(text);
                  if (formatted.replace(/\s/g, '').length <= 16) {
                    setCardData({...cardData, cardNumber: formatted});
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
                value={cardData.nameOnCard}
                onChangeText={(text) => setCardData({...cardData, nameOnCard: text})}
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
                  value={cardData.expiryDate}
                  onChangeText={(text) => {
                    const formatted = formatExpiryDate(text);
                    if (formatted.length <= 5) {
                      setCardData({...cardData, expiryDate: formatted});
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
                  value={cardData.cvv}
                  onChangeText={(text) => {
                    if (text.length <= 4) {
                      setCardData({...cardData, cvv: text});
                    }
                  }}
                  maxLength={4}
                />
              </View>
            </View>
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContent}>
            <View style={styles.successContainer}>
              <LinearGradient
                colors={['#007AFF', '#5856D6']}
                style={styles.successIcon}
              >
                <Ionicons name="checkmark" size={48} color="white" />
              </LinearGradient>
              <Text style={styles.successTitle}>All Set!</Text>
              <Text style={styles.successSubtitle}>
                Your FacePay wallet is ready to use. Start making secure payments with confidence.
              </Text>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#f8f9fa', '#ffffff']}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.progressContainer}>
              {steps.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.progressDot,
                    index <= currentStep ? styles.progressDotActive : {}
                  ]}
                />
              ))}
            </View>
            <Text style={styles.stepIndicator}>
              Step {currentStep + 1} of {steps.length}
            </Text>
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {renderStepContent()}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            {currentStep > 0 && currentStep < steps.length - 1 && (
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[
                styles.nextButton,
                !validateCurrentStep() && currentStep < steps.length - 1 ? styles.nextButtonDisabled : {}
              ]}
              onPress={handleNext}
              disabled={!validateCurrentStep() && currentStep < steps.length - 1}
            >
              <LinearGradient
                colors={['#007AFF', '#5856D6']}
                style={styles.nextButtonGradient}
              >
                <Text style={styles.nextButtonText}>
                  {currentStep === steps.length - 1 ? 'Get Started' : 'Continue'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e1e5e9',
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: '#007AFF',
  },
  stepIndicator: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  stepContent: {
    paddingBottom: 40,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
  successContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  successTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 34,
    paddingTop: 20,
  },
  backButton: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  nextButton: {
    borderRadius: 28,
    overflow: 'hidden',
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonGradient: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  pickerButton: {
    flex: 1,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 16,
  },
  pickerText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  placeholderText: {
    color: '#999',
  },
  countryText: {
    flex: 1,
    height: 56,
    fontSize: 16,
    color: '#1a1a1a',
    textAlignVertical: 'center',
    paddingTop: 18,
  },
});

export default OnboardingScreen;
