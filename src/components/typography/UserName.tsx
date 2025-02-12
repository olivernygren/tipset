/* eslint-disable react/jsx-no-useless-fragment */
import React, { useState, useEffect } from 'react';
import { getUserDataById, getUserNameById } from '../../utils/firebaseHelpers';
import Avatar, { AvatarSize } from '../avatar/Avatar';

interface UserNameProps {
  userId: string;
}

interface UserProfilePictureProps extends UserNameProps {
  size?: AvatarSize;
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
};

export const UserProfilePicture = ({ userId, size }: UserProfilePictureProps) => {
  const [profilePicture, setProfilePicture] = useState('');

  useEffect(() => {
    const fetchUserProfilePicture = async () => {
      const user = await getUserDataById(userId);
      const userProfilePicture = user?.profilePicture || '';
      setProfilePicture(userProfilePicture);
    };

    fetchUserProfilePicture();
  }, [userId]);

  return (
    <Avatar
      src={profilePicture && profilePicture.length > 0 ? `/images/${profilePicture}.png` : '/images/generic.png'}
      size={size ?? AvatarSize.M}
      objectFit="cover"
      showBorder
      customBorderWidth={1}
    />
  );
};

export default UserName;
