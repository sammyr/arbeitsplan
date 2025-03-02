'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import { toast } from 'react-hot-toast';
import { UserIcon } from '@heroicons/react/24/outline';
import { updateProfile } from 'firebase/auth';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    try {
      await updateProfile(user, {
        displayName: displayName
      });
      toast.success('Profil erfolgreich aktualisiert');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Profil konnte nicht aktualisiert werden');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        {/* Ladeanimation entfernt, Container beibehalten */}
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="flex-1 p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-slate-100 p-3 rounded-full">
              <UserIcon className="h-8 w-8 text-slate-600" />
            </div>
            <h1 className="text-2xl font-semibold text-slate-800">Profil Einstellungen</h1>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Anzeigename
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <div className="text-slate-900 py-2">{displayName || 'Nicht gesetzt'}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                E-Mail Adresse
              </label>
              <div className="text-slate-900 py-2">{email}</div>
            </div>

            <div className="pt-4">
              {isEditing ? (
                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Änderungen speichern
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setDisplayName(user?.displayName || '');
                    }}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Abbrechen
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Profil bearbeiten
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
