import { doc, deleteDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { toast } from 'react-hot-toast';
import { 
  EmailAuthProvider,
  reauthenticateWithCredential, 
  reauthenticateWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';

export async function deleteAccount(email?: string, password?: string) {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Kein Benutzer angemeldet');
    }

    // Prüfe, ob der Benutzer sich mit Google angemeldet hat
    const isGoogleUser = user.providerData.some(
      provider => provider.providerId === 'google.com'
    );

    // Re-authentifiziere den Benutzer
    if (isGoogleUser) {
      // Für Google-Benutzer
      const googleProvider = new GoogleAuthProvider();
      await reauthenticateWithPopup(user, googleProvider);
    } else if (email && password) {
      // Für Email/Passwort-Benutzer
      const credential = EmailAuthProvider.credential(email, password);
      await reauthenticateWithCredential(user, credential);
    } else {
      throw new Error('Bitte geben Sie Ihre Anmeldedaten ein');
    }

    // Lösche den Benutzer aus der users-Sammlung
    await deleteDoc(doc(db, 'users', user.uid));
    
    // Lösche die zugehörige Organisation
    await deleteDoc(doc(db, 'organizations', user.uid));
    
    // Lösche den Firebase Auth Account
    await user.delete();
    
    toast.success('Account wurde gelöscht. Sie können sich jetzt neu registrieren.');
    
    // Zur Registrierungsseite weiterleiten
    window.location.href = '/auth/register';
  } catch (error: any) {
    console.error('Error deleting account:', error);
    if (error.code === 'auth/requires-recent-login') {
      toast.error('Aus Sicherheitsgründen müssen Sie sich erneut anmelden');
    } else {
      toast.error('Fehler beim Löschen des Accounts: ' + error.message);
    }
    throw error;
  }
}
