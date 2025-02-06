import React, {
  createContext, useState, useEffect, useContext,
  useMemo,
} from 'react';
import { getDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Cookies from 'js-cookie';
import { auth, db } from '../config/firebase';
import { User } from '../utils/Auth';
import { CollectionEnum } from '../utils/Firebase';
import { withDocumentIdOnObject } from '../utils/helpers';

interface UserContextProps {
  user: User | null;
  hasAdminRights: boolean | undefined;
  loading: boolean;
}

const UserContext = createContext<UserContextProps>({ user: null, hasAdminRights: false, loading: true });

export const useUser = () => useContext(UserContext);

export const UserProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [hasAdminRights, setHasAdminRights] = useState<boolean>();
  const [loading, setLoading] = useState<boolean>(true);

  const contextValue = useMemo(() => ({ user, hasAdminRights, loading }), [user, hasAdminRights, loading]);

  useEffect(() => {
    const fetchUser = async (userId: string) => {
      const userDocRef = doc(db, CollectionEnum.USERS, userId);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userWithDocId = withDocumentIdOnObject<User>(userDocSnap);

        setUser(userWithDocId);
        setHasAdminRights(userWithDocId.role === 'ADMIN');
        setLoading(false);
      } else {
        console.log('No such user!');
      }
    };

    const storedUserId = Cookies.get('user_id');
    if (storedUserId) {
      fetchUser(storedUserId);
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userId = user.uid;
        Cookies.set('user_id', userId, { expires: 365 * 3, secure: true, sameSite: 'strict' });
        fetchUser(userId);

        // Temporary logic to remove the old "user" cookie
        if (Cookies.get('user')) {
          Cookies.remove('user');
          console.log('Old "user" cookie removed');
        }
      } else {
        setUser(null);
        setHasAdminRights(false);
        Cookies.remove('user_id');
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  if (loading && !user) {
    return null;
  }

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};
