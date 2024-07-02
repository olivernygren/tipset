import React from 'react';
import Avatar, { AvatarSize } from './Avatar';

interface ClubAvatarProps {
  clubName: string;
  logoUrl: string;
  size: AvatarSize;
  showBorder?: boolean;
  isDarkMode?: boolean;
}

const ClubAvatar = ({ logoUrl, clubName, size, showBorder, isDarkMode }: ClubAvatarProps) => {
  return (
    <Avatar 
      src={logoUrl} 
      size={size} 
      alt={`${clubName} logo`}
      showBorder={showBorder}
      isDarkMode={isDarkMode}
    />
  )
};

export default ClubAvatar;