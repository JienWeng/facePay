import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import * as LocalAuthentication from 'expo-local-authentication';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function BiometricSetupScreen() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [showCamera, setShowCamera] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    checkBiometricSupport();
    startPulseAnimation();
  }, []);

  useEffect(() => {
    if (isScanning) {
      startScanAnimation();
    }
  }, [isScanning]);

  const checkBiometricSupport = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    if (!compatible) {
      Alert.alert(
        'Biometric Not Supported',
        'Your device does not support biometric authentication. Continuing without biometric setup.',
        [
          {
            text: 'Continue',
            onPress: () => router.replace('/onboarding'),
          },
        ]
      );
    }
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startScanAnimation = () => {
    // Progress animation
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false,
    }).start();

    // Scale animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Simulate scan progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setScanProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        completeScan();
      }
    }, 300);
  };

  const completeScan = async () => {
    try {
      await SecureStore.setItemAsync('biometricSetup', 'completed');
      setTimeout(() => {
        Alert.alert(
          'Face Registered Successfully!',
          'Your biometric authentication has been set up. You can now use Face ID to secure your transactions.',
          [
            {
              text: 'Continue',
              onPress: () => router.replace('/onboarding'),
            },
          ]
        );
      }, 500);
    } catch (error) {
      console.error('Error saving biometric setup:', error);
    }
  };

  const handleStartScan = async () => {
    if (!permission) {
      return;
    }

    if (!permission.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert('Camera Permission', 'Camera access is required for face registration.');
        return;
      }
    }

    setShowCamera(true);
    setTimeout(() => {
      setIsScanning(true);
    }, 1000);
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Biometric Setup?',
      'You can set up biometric authentication later in settings for enhanced security.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip',
          onPress: () => router.replace('/onboarding'),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Secure Your Wallet</Text>
            <Text style={styles.subtitle}>
              Register your face for quick and secure access to your FacePay wallet
            </Text>
          </View>

          {/* Face Scan Area */}
          <View style={styles.scanContainer}>
            {showCamera ? (
              <View style={styles.cameraContainer}>
                <CameraView
                  style={styles.camera}
                  facing="front"
                />
                <View style={styles.cameraOverlay}>
                  <View style={styles.scanFrame}>
                    <Animated.View
                      style={[
                        styles.scanBorder,
                        {
                          transform: [{ scale: isScanning ? scaleAnim : 1 }]
                        }
                      ]}
                    />
                  </View>
                  
                  {isScanning && (
                    <View style={styles.progressContainer}>
                      <Animated.View
                        style={[
                          styles.progressBar,
                          {
                            width: progressAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: ['0%', '100%'],
                            }),
                          },
                        ]}
                      />
                    </View>
                  )}
                </View>
              </View>
            ) : (
              <Animated.View
                style={[
                  styles.scanFrameStatic,
                  {
                    transform: [{ scale: pulseAnim }]
                  }
                ]}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                  style={styles.scanCircle}
                >
                  <Ionicons name="scan" size={80} color="white" />
                </LinearGradient>
              </Animated.View>
            )}

            {isScanning && (
              <View style={styles.scanStatus}>
                <Text style={styles.scanStatusText}>Scanning... {scanProgress}%</Text>
                <Text style={styles.scanInstructions}>
                  Keep your face centered and still
                </Text>
              </View>
            )}
          </View>

          {/* Instructions */}
          <View style={styles.instructions}>
            <View style={styles.instructionItem}>
              <Ionicons name="eye" size={24} color="rgba(255,255,255,0.8)" />
              <Text style={styles.instructionText}>Look directly at the camera</Text>
            </View>
            <View style={styles.instructionItem}>
              <Ionicons name="sunny" size={24} color="rgba(255,255,255,0.8)" />
              <Text style={styles.instructionText}>Ensure good lighting</Text>
            </View>
            <View style={styles.instructionItem}>
              <Ionicons name="body" size={24} color="rgba(255,255,255,0.8)" />
              <Text style={styles.instructionText}>Keep your face within the frame</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleStartScan}
              disabled={isScanning}
            >
              <LinearGradient
                colors={isScanning ? ['#ccc', '#999'] : ['#4ecdc4', '#44a08d']}
                style={styles.buttonGradient}
              >
                <Text style={styles.primaryButtonText}>
                  {isScanning ? 'Scanning...' : 'Register My Face'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleSkip}
              disabled={isScanning}
            >
              <Text style={styles.secondaryButtonText}>Skip for Now</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 24,
  },
  scanContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  scanFrame: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  scanCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  progressContainer: {
    width: 200,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    marginTop: 20,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4ecdc4',
    borderRadius: 3,
  },
  scanStatus: {
    alignItems: 'center',
  },
  scanStatusText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  scanInstructions: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  instructions: {
    marginBottom: 60,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  instructionText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 16,
  },
  actions: {
    marginTop: 'auto',
  },
  primaryButton: {
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 16,
  },
  buttonGradient: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
  },
  secondaryButtonText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  cameraContainer: {
    width: 250,
    height: 250,
    borderRadius: 125,
    overflow: 'hidden',
    position: 'relative',
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  cameraOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanBorder: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: '#4ecdc4',
  },
  scanFrameStatic: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
});
