import React, { useState, useEffect } from 'react';
import { getUserDataById, getUserNameById } from '../../utils/firebaseHelpers';

interface UserNameProps {
  userId: string;
}

const UserName = ({ userId }: UserNameProps) => {
  const [name, setName] = useState('');

  useEffect(() => {
    const fetchUserName = async () => {
      const userName = await getUserNameById(userId);
      setName(userName);
    };

    fetchUserName();
  }, [userId]);

  return <>{name || 'Loading...'}</>;
};

export const UserEmail = ({ userId }: UserNameProps) => {
  const [email, setEmail] = useState('');

  useEffect(() => {
    const fetchUserEmail = async () => {
      const user = await getUserDataById(userId);
      const userEmail = user?.email || '';
      setEmail(userEmail);
    };

    fetchUserEmail();
  }, [userId]);

  return <>{email || 'Loading...'}</>;
}

export default UserName;