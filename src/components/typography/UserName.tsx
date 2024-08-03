import React, { useState, useEffect } from 'react';
import { getUserNameById } from '../../utils/firebaseHelpers';

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

export default UserName;