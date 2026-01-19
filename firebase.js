import firebase from '@react-native-firebase/app'
import auth from '@react-native-firebase/auth'

// Firebase auto-configures from google-services.json on Android
// No manual config needed for React Native Firebase
if (!firebase.apps.length) {
  firebase.initializeApp()
}

export { auth }
