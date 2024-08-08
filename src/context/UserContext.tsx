import React, { createContext, useState, useEffect, useContext } from 'react';
import { getDoc, doc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User } from '../utils/Auth';
import { onAuthStateChanged } from 'firebase/auth';
import { CollectionEnum } from '../utils/Firebase';
import { withDocumentIdOnObject } from '../utils/helpers';
import Cookies from 'js-cookie';
interface UserContextProps {
  user: User | null;
  hasAdminRights: boolean;
}

const UserContext = createContext<UserContextProps>({ user: null, hasAdminRights: false });

export const useUser = () => useContext(UserContext);

export const UserProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = Cookies.get('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [hasAdminRights, setHasAdminRights] = useState<boolean>(() => {
    const storedUser = Cookies.get('user');
    return storedUser ? JSON.parse(storedUser).role === 'ADMIN' : false;
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, CollectionEnum.USERS, user.uid);
        const userDocSnap = await getDoc(userDocRef);
  
        if (userDocSnap.exists()) {
          const userWithDocId = withDocumentIdOnObject<User>(userDocSnap);
          setUser(userWithDocId);
          Cookies.set('user', JSON.stringify(userWithDocId), { expires: 365, secure: true, sameSite: 'strict' });
          if (userWithDocId?.role === 'ADMIN') {
            setHasAdminRights(true);
          }
        } else {
          console.log("No such user!");
        }
      } else {
        setUser(null);
        setHasAdminRights(false);
        Cookies.remove('user');
      }
      setLoading(false);
    });
  
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  if (loading && !user) {
    return <div>Loading...</div>; // Or a spinner
  }

  return (
    <UserContext.Provider value={{ user, hasAdminRights }}>
      {children}
    </UserContext.Provider>
  );
};