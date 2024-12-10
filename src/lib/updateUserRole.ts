import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export async function updateUserRole(userId: string, newRole: 'admin' | 'employee') {
  try {
    const userRef = doc(db, 'users', userId);
    
    if (newRole === 'admin') {
      // Wenn der Benutzer zum Admin wird, erstelle auch eine Organisation
      const organizationRef = doc(db, 'organizations', userId);
      await updateDoc(organizationRef, {
        name: 'My Organization',
        createdAt: new Date().toISOString(),
        adminId: userId
      });
    }
    
    await updateDoc(userRef, {
      role: newRole,
      ...(newRole === 'admin' ? { organizationId: userId } : {})
    });
    
    return true;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
}
