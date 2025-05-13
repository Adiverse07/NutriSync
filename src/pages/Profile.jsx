// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import {
  getAuth,
  onAuthStateChanged,
  updateProfile as updateFirebaseAuthProfile
} from 'firebase/auth';
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/firebase';

import maleAvatar from '../assets/img/male.png';
import femaleAvatar from '../assets/img/female.png';

export default function Profile() {
  const auth = getAuth();

  // ─── 1️⃣ Auth State ─────────────────────────────────────────────
  const [user, setUser] = useState(); // undefined=loading, null=no user, User=obj

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return unsub;
  }, [auth]);

  // ─── 2️⃣ Form State ─────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

  // ─── 3️⃣ Load Firestore Profile ─────────────────────────────────
  useEffect(() => {
    if (!user?.uid) return;

    (async () => {
      try {
        const userRef = doc(db, 'users', user.uid);
        const snap = await getDoc(userRef);
        const data = snap.exists() ? snap.data() : {};

        setName(data.name || user.displayName || '');
        setAge(data.age?.toString() || '');
        setHeight(data.height?.toString() || '');
        setWeight(data.weight?.toString() || '');
        setPhotoURL(data.photoURL || maleAvatar);
      } catch (e) {
        console.error('Profile load error:', e);
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  // ─── 4️⃣ Early Returns ───────────────────────────────────────────
  if (user === undefined) return <div className="p-8 text-center text-white">Loading auth…</div>;
  if (user === null) return <div className="p-8 text-center text-white">Please sign in to view your profile.</div>;
  if (loading) return <div className="p-8 text-center text-white">Loading profile…</div>;

  // ─── 5️⃣ Avatar Options ──────────────────────────────────────────
  const options = [
    { label: 'Male', url: maleAvatar },
    { label: 'Female', url: femaleAvatar },
  ];

  // ─── 6️⃣ Handlers ───────────────────────────────────────────────
  const handleSelectAvatar = async (url) => {
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        photoURL: url,
        updatedAt: serverTimestamp(),
      });
      await updateFirebaseAuthProfile(user, { photoURL: url });
      setPhotoURL(url);
    } catch (e) {
      console.error('Avatar update error:', e);
      setError('Failed to update avatar.');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        name,
        age: Number(age),
        height: Number(height),
        weight: Number(weight),
        updatedAt: serverTimestamp(),
      });
      await updateFirebaseAuthProfile(user, { displayName: name });
      alert('Profile updated!');
    } catch (e) {
      console.error('Profile save error:', e);
      setError('Save failed.');
    } finally {
      setSaving(false);
    }
  };

  // ─── 7️⃣ Render ──────────────────────────────────────────────────
  return (
    <div className="max-w-md mx-auto p-6 card-gradient rounded-2xl border border-white/10 space-y-6">
      <h1 className="text-2xl font-bold gradient-text text-center">Your Profile</h1>
      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="flex justify-center">
        <img
          src={photoURL}
          alt="Current Avatar"
          className="w-32 h-32 rounded-full object-cover border-2 border-primary"
        />
      </div>

      <div className="text-center">
        <p className="text-sm text-white/70 mb-2">Choose an avatar:</p>
        <div className="flex justify-center space-x-6">
          {options.map((opt) => (
            <div key={opt.label} className="flex flex-col items-center">
              <button
                onClick={() => handleSelectAvatar(opt.url)}
                disabled={saving}
                className={`p-1 rounded-full border-4 transition ${
                  photoURL === opt.url
                    ? 'border-primary'
                    : 'border-transparent hover:border-white/50'
                }`}
              >
                <img
                  src={opt.url}
                  alt={opt.label}
                  className="w-16 h-16 rounded-full object-cover"
                />
              </button>
              <span className="mt-1 text-xs text-white/60">{opt.label}</span>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {[ 
          { label: 'Name', value: name, setter: setName, type: 'text' },
          { label: 'Age', value: age, setter: setAge, type: 'number' },
          { label: 'Height (cm)', value: height, setter: setHeight, type: 'number' },
          { label: 'Weight (kg)', value: weight, setter: setWeight, type: 'number' },
        ].map((field) => (
          <div key={field.label}>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              {field.label}
            </label>
            <input
              type={field.type}
              value={field.value}
              onChange={(e) => field.setter(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[#242442] border border-gray-700 text-white focus:outline-none"
              min={field.type === 'number' ? 0 : undefined}
            />
          </div>
        ))}

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-lg hover:opacity-90 transition"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
