import React, { createContext, useState, useEffect, useContext } from 'react';
import { getDoc, doc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User } from '../utils/Auth';
import { onAuthStateChanged } from 'firebase/auth';
import { CollectionEnum } from '../utils/Firebase';
import { withDocumentIdOnObject } from '../utils/helpers';

interface UserContextProps {
  user: User | null;
  hasAdminRights: boolean;
}

const UserContext = createContext<UserContextProps>({ user: null, hasAdminRights: false });

export const useUser = () => useContext(UserContext);

export const UserProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [hasAdminRights, setHasAdminRights] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, CollectionEnum.USERS, user.uid);
        const userDocSnap = await getDoc(userDocRef);
  
        if (userDocSnap.exists()) {
          const userWithDocId = withDocumentIdOnObject<User>(userDocSnap);
          setUser(userWithDocId);
          if (userWithDocId?.role === 'ADMIN') {
            setHasAdminRights(true);
          }
        } else {
          console.log("No such user!");
        }
      } else {
        setUser(null);
      }
    });
  
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, hasAdminRights }}>
      {children}
    </UserContext.Provider>
  );
};