import React from 'react';
import Avatar, { AvatarSize } from './Avatar';

interface NationAvatarProps {
  nationName: string;
  flagUrl: string;
  size: AvatarSize;
  isDarkMode?: boolean;
}

const NationAvatar = ({
  nationName, flagUrl, size, isDarkMode,
}: NationAvatarProps) => (
  <Avatar
    src={flagUrl}
    size={size}
    alt={`${nationName} logo`}
    showBorder
    objectFit="cover"
    title={nationName}
    isDarkMode={isDarkMode}
  />
);

export default NationAvatar;
