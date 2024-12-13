import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { app } from './firebase';

const auth = getAuth(app);

interface AuthHook {
  user: User | null;
  loading: boolean;
  getIdToken: () => Promise<string>;
}

export function useAuth(): AuthHook {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getIdToken = async () => {
    if (!user) {
      throw new Error('No user logged in');
    }
    return user.getIdToken();
  };

  return { user, loading, getIdToken };
} 