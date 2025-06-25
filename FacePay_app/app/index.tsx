import { router } from 'expo-router';
import { useEffect } from 'react';

export default function IndexScreen() {
  useEffect(() => {
    // Redirect to biometric setup on app start
    router.replace('/biometric-setup');
  }, []);

  return null;
}
