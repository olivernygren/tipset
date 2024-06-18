import React from 'react'
import Avatar, { AvatarSize } from './Avatar';

interface NationAvatarProps {
  nationName: string;
  flagUrl: string;
  size: AvatarSize;
}

const NationAvatar = ({ nationName, flagUrl, size }: NationAvatarProps) => {
  return (
    <Avatar 
      src={flagUrl} 
      size={size} 
      alt={`${nationName} logo`}
      showBorder
      objectFit='cover'
    />
  )
}

export default NationAvatar;