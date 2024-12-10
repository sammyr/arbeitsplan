'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'react-hot-toast';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import { updateUserRole } from '@/lib/updateUserRole';
import { deleteAccount } from '@/lib/deleteAccount';

export default function ProfilePage() {
  const { user, userRole } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    phone: '',
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteCredentials, setDeleteCredentials] = useState({
    email: '',
    password: ''
  });

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user!.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData(data);
        setFormData({
          displayName: data.displayName || '',
          email: data.email || user!.email || '',
          phone: data.phone || '',
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Fehler beim Laden der Benutzerdaten');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, 'users', user!.uid), {
        ...formData,
        updatedAt: new Date().toISOString(),
      });
      setIsEditing(false);
      toast.success('Profil wurde aktualisiert');
      loadUserData();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Fehler beim Aktualisieren des Profils');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleCorrection = async () => {
    try {
      await updateUserRole(user!.uid, 'admin');
      toast.success('Ihre Rolle wurde zu Administrator aktualisiert. Bitte laden Sie die Seite neu.');
      // Lade die Seite neu, damit die Änderungen wirksam werden
      window.location.reload();
    } catch (error) {
      console.error('Error correcting role:', error);
      toast.error('Fehler beim Aktualisieren der Rolle');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // Für Google-Benutzer direkt löschen
      if (user?.providerData.some(provider => provider.providerId === 'google.com')) {
        await deleteAccount();
        return;
      }

      // Für Email/Passwort-Benutzer Anmeldedaten abfragen
      if (!showDeleteConfirm) {
        setShowDeleteConfirm(true);
        return;
      }

      await deleteAccount(deleteCredentials.email, deleteCredentials.password);
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  return (
    <div className="min-h-screen bg-transparent py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center">
              <UserCircleIcon className="h-8 w-8 text-slate-400" />
              <h3 className="ml-3 text-lg font-medium leading-6 text-slate-900">
                Benutzerprofil
              </h3>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Verwalten Sie hier Ihre persönlichen Informationen
            </p>
          </div>

          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                  E-Mail
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  disabled
                  className="block w-full px-4 py-3 text-base rounded-lg border-slate-200 bg-slate-50 shadow-sm disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Die E-Mail-Adresse kann nicht geändert werden
                </p>
              </div>

              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-slate-700">
                  Name
                </label>
                <input
                  type="text"
                  name="displayName"
                  id="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="block w-full px-4 py-3 text-base rounded-lg border-slate-200 bg-slate-50 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 hover:border-emerald-300 transition-colors duration-200 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                  placeholder="z.B. Max Mustermann"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
                  Telefon
                </label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="block w-full px-4 py-3 text-base rounded-lg border-slate-200 bg-slate-50 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 hover:border-emerald-300 transition-colors duration-200 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                  placeholder="z.B. +49 123 45678900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Rolle
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={userRole === 'admin' ? 'Administrator' : 'Mitarbeiter'}
                    disabled
                    className="block w-full px-4 py-3 text-base rounded-lg border-slate-200 bg-slate-50 shadow-sm disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                  />
                  {userRole === 'user' && !userData?.invitedBy && (
                    <button
                      type="button"
                      onClick={handleRoleCorrection}
                      className="mt-1 inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Rolle korrigieren
                    </button>
                  )}
                </div>
                {userRole === 'user' && !userData?.invitedBy && (
                  <p className="mt-1 text-sm text-red-600">
                    Sie wurden fälschlicherweise als Benutzer eingestuft. Klicken Sie auf "Rolle korrigieren", um dies zu beheben.
                  </p>
                )}
              </div>

              <div className="flex justify-between space-x-3">
                {showDeleteConfirm ? (
                  <div className="w-full space-y-4">
                    <div>
                      <label htmlFor="deleteEmail" className="block text-sm font-medium text-slate-700">
                        E-Mail
                      </label>
                      <input
                        type="email"
                        id="deleteEmail"
                        value={deleteCredentials.email}
                        onChange={(e) => setDeleteCredentials(prev => ({ ...prev, email: e.target.value }))}
                        className="block w-full px-4 py-3 text-base rounded-lg border-slate-200 bg-slate-50 shadow-sm focus:border-red-500 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="deletePassword" className="block text-sm font-medium text-slate-700">
                        Passwort
                      </label>
                      <input
                        type="password"
                        id="deletePassword"
                        value={deleteCredentials.password}
                        onChange={(e) => setDeleteCredentials(prev => ({ ...prev, password: e.target.value }))}
                        className="block w-full px-4 py-3 text-base rounded-lg border-slate-200 bg-slate-50 shadow-sm focus:border-red-500 focus:ring-red-500"
                      />
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50"
                      >
                        Abbrechen
                      </button>
                      <button
                        type="button"
                        onClick={handleDeleteAccount}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700"
                      >
                        Account endgültig löschen
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleDeleteAccount}
                      className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-lg text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Account löschen
                    </button>

                    <div className="flex space-x-3">
                      {!isEditing ? (
                        <button
                          type="button"
                          onClick={() => setIsEditing(true)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-emerald-500 hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                        >
                          Bearbeiten
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditing(false);
                              loadUserData();
                            }}
                            className="inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                          >
                            Abbrechen
                          </button>
                          <button
                            type="submit"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-emerald-500 hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                          >
                            Speichern
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
