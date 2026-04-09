import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, signInWithCredential, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from './firebase';

// Укажите ваш Web Client ID из Google Cloud Console / Firebase Console
GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
});

export async function signInWithGoogle(): Promise<void> {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const response = await GoogleSignin.signIn();

  if (!response.data?.idToken) {
    throw new Error('No ID token from Google');
  }

  const credential = GoogleAuthProvider.credential(response.data.idToken);
  await signInWithCredential(auth, credential);
}

export async function signOut(): Promise<void> {
  await GoogleSignin.signOut();
  await firebaseSignOut(auth);
}
