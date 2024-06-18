import React from 'react';
import Avatar, { AvatarSize } from './Avatar';

interface ClubAvatarProps {
  clubName: string;
  logoUrl: string;
  size: AvatarSize;
  showBorder?: boolean;
}

const ClubAvatar = ({ logoUrl, clubName, size, showBorder }: ClubAvatarProps) => {
  return (
    <Avatar 
      src={logoUrl} 
      size={size} 
      alt={`${clubName} logo`}
      showBorder={showBorder}
    />
  )
};

export default ClubAvatar;